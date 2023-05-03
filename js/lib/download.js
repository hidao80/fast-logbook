import { translate } from "./i18n.js";
import { getTodayString, syncGet, getRoundingUnit, LOG_DATA_KEY, ROUNDING_UNIT_MINUTE_KEY, fetchHourFromTime, fetchMinFromTime } from "./utils.js";
import { Log } from "./logger.js";

/**
 * Give the string a file type and have it downloaded.
 *
 * @param {string} outputDataString Original data to be downloaded
 * @param {string} extension (filename) extension
 * @param {string} mimeType mime type
 */
export function download(outputDataString, extension = '.html', mimeType = 'text/html') {
    const reader = new FileReader();
    reader.readAsDataURL(new Blob([outputDataString], { type: mimeType }));
    reader.onload = () => {
        chrome.downloads.download({
            "url": reader.result,
            "filename": translate("app_name") + "_" + getTodayString() + "." + extension
        });
    };
}

export function downloadLog() {
    Promise.all([syncGet(LOG_DATA_KEY), syncGet(ROUNDING_UNIT_MINUTE_KEY)])
        .then(values => {
            const log = values[0];
            const mins = getRoundingUnit(values[1]);
            const outputStr = `
<style>
.pt-5 {padding-top:3rem;}
</style>
<h2>${translate('html_summary')}</h2>
<div>
${toHtml(log, mins)}
</div>
<h2 class="pt-5">${translate('plaintext_log')}</h2>
<div><pre><code>
${log}
</code></pre></div>
<h2 class="pt-5">${translate('markdown_summary')}</h2>
<div><pre><code>
${toMarkdown(log, mins)}
</code></pre></div>
`;
            download(outputStr);
        });
}

/**
 * Analyze and tabulate raw data from work hour logs
 *
 * @param {string} text Raw data of work time logs
 * @param {int} mins Rounding unit (mins.)
 * @returns {object} Categorized aggregate data (json)
 */
export function parse(text, mins) {
    const TIME_LENGTH = 16;
    const FIELD_SEPARATOR = ";";
    const RECORD_SEPARATOR = "\n";

    let timeStamp = [], obj = {};

    // Convert logs to JSON
    text.split(RECORD_SEPARATOR).forEach(line => {
        const time = line.slice(0, TIME_LENGTH);
        const junction = line.indexOf(FIELD_SEPARATOR);
        const category = junction < 0 ? line.slice(TIME_LENGTH) : line.slice(TIME_LENGTH, junction);
        const detail = junction < 0 ? '' : line.slice(junction + 1);

        timeStamp.push({ "time": time, "category": category });
        if (!obj[category]) obj[category] = {};
        obj[category].time = 0;
        if (!obj[category].detail) obj[category].detail = [];
        obj[category].detail.push(detail);
    });

    // Eliminate duplication of work details
    Object.keys(obj).forEach(item => {
        obj[item].detail = Array.from(new Set(obj[item].detail)).join(", ");
    });

    // Work time in minutes
    for (let i = 1; i < timeStamp.length; i++) {
        const after = timeStamp[i].time;
        const before = timeStamp[i - 1].time;
        let hour = fetchHourFromTime(after) - fetchHourFromTime(before);
        if (hour < 0) {
            hour += 24;
        }
        let min = fetchMinFromTime(after) - fetchMinFromTime(before);
        // over the course of a day
        if (min < 0) {
            hour -= 1;
            min += 60;
        }
        obj[timeStamp[i - 1].category].time += hour * 60 + min;
    }

    // Convert work time to ROUNDIGN_UNIT increments of time
    Object.keys(obj).forEach(item => {
        obj[item].round = Math.floor(obj[item].time / 60) + Number((Math.round(obj[item].time % 60 / mins) * mins / 60).toFixed(2));
    });

    return obj;
}

/**
 * Make a table of the aggregated time in HTML format
 *
 * @param {object} log Categorized aggregate data (json)
 * @param {int} mins Rounding unit (mins.)
 * @returns {string} HTML Table
 */
export function toHtml(log, mins) {
    const dataJson = parse(log, mins);
    const breakMark = "^";
    let sum = 0;
    let total = 0;
    let output =
        `<html><head><style>
th {background-color:#bfa}
tr:nth-child(2n+1) {background-color:#dfc}
</style></head><body><table><tbody>
<tr>
<th>${translate("work_category")}</th>
<th>${translate("work_detail")}</th>
<th>${translate("work_time_hour")}</th>
<th>${translate("work_time_min")}</th>
</tr>`;

    for (const category of Object.keys(dataJson).sort()) {
        output +=
            `<tr>
    <td style="white-space:nowrap">${category}</td>
    <td>${dataJson[category].detail}</td>
    <td style="text-align:right">${dataJson[category].round}</td>
    <td style="text-align:right">${dataJson[category].time}</td>
</tr>`;
        if (category[0] != breakMark) sum += dataJson[category].time;
        total += dataJson[category].time;
    }

    const sumStr = translate("work_time_actual") + "： " + (Math.floor(sum / 60) + Number((Math.round(sum % 60 / mins) * mins / 60).toFixed(2))) + " h";
    const totalStr = translate("work_time_total") + "： " + (Math.floor(total / 60) + Number((Math.round(total % 60 / mins) * mins / 60).toFixed(2))) + " h";

    output +=
        `</tbod></table>
<p>
${sumStr} (${sum} ${translate('mins')})<br>
${totalStr} (${sum} ${translate('mins')})</p>
</bdoy></html>`;

    return output;
}

/**
 * Make a markdown table of the aggregated time
 *
 * @param {object} log Categorized aggregate data (json)
 * @param {int} mins Rounding unit (mins.)
 * @returns {string} markdown table
 */
export function toMarkdown(log, mins) {
    const dataJson = parse(log, mins);
    const breakMark = "^";
    let sum = 0;
    let total = 0;
    let output =
        `${translate("work_category")} | ${translate("work_detail")} | ${translate("work_time_hour")} | ${translate("work_time_min")}
--- | --- | --: | --:
`;

    for (const category of Object.keys(dataJson).sort()) {
        output += `${category} | ${dataJson[category].detail} | ${dataJson[category].round} | ${dataJson[category].time}\n`;
        if (category[0] != breakMark) sum += dataJson[category].time;
        total += dataJson[category].time;
    }

    output += `\n${translate("work_time_actual")}： ` + (Math.floor(sum / 60) + Number((Math.round(sum % 60 / mins) * mins / 60).toFixed(2))) + ` h (${sum} ${translate('mins')})`;
    output += `\n${translate("work_time_total")}： ` + (Math.floor(total / 60) + Number((Math.round(total % 60 / mins) * mins / 60).toFixed(2))) + ` h (${sum} ${translate('mins')})`;

    return output;
}
