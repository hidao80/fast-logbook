import { __ } from "./i18n.js";
import { getTodayString, syncGet, LOG_DATA_KEY, FILE_TYPE_KEY } from "./utils.js";
import { Log } from "./logger.js";

/**
 * Have it downloaded in plain text format.
 *
 * @param {*} log Original data to be downloaded
 */
export function plainTextDownload(log) {
    download(log, 'txt', 'text/plain');
}

/**
 * Let them download it in html format.
 *
 * @param {*} log Original data to be downloaded
 */
export function markdownTableDownload(log) {
    download(toMarkdown(log), 'md', 'text/markdown');
}

/**
 * Have it downloaded in markdown format.
 *
 * @param {string} log Original data to be downloaded
 */
export function htmlTableDownload(log) {
    download(toHtml(log), 'html', 'text/html');
}

/**
 * Give the string a file type and have it downloaded.
 *
 * @param {string} outputDataString Original data to be downloaded
 * @param {string} extension (filename) extension
 * @param {string} mimeType mime type
 */
export function download(outputDataString, extension, mimeType) {
    const reader = new FileReader();
    reader.readAsDataURL(new Blob([outputDataString], { type: mimeType }));
    reader.onload = () => {
        chrome.downloads.download({
            "url": reader.result,
            "filename": __("app_name") + "_" + getTodayString() + "." + extension
        });
    };
}

export function outputLog() {
    Promise.all([syncGet(LOG_DATA_KEY), syncGet(FILE_TYPE_KEY)])
        .then(values => {
            console.debug(values);
            const log = values[0];
            const type = values[1] || 'plainText';
            const downloadFunction = type + "Download";
            Log.debug(type, downloadFunction);

            const outputStr = `
<style>
.pt-5 {padding-top:3rem;}
</style>
<div>
${toHtml(log)}
</div>
<div class="pt-5"><pre><code>
${log}
</code></pre></div>
<div class="pt-5"><pre><code>
${toMarkdown(log)}
</code></pre></div>
`;
            download(outputStr, '.html', 'text/html');
        });
}

/**
 * Analyze and tabulate raw data from work hour logs
 *
 * @param {string} text Raw data of work time logs
 * @returns {object} Categorized aggregate data (json)
 */
export function parse(text) {
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

    // Convert work time to 0.25 increments of time
    Object.keys(obj).forEach(item => {
        obj[item].round = Math.floor(obj[item].time / 60) + Math.round(obj[item].time % 60 / 15) / 4;
    });

    return obj;
}

/**
 * Get the time from the date and time
 *
 * @param {string} time - "Y-m-d H:i:s"
 * @returns {int} - hour
 */
function fetchHourFromTime(time) {
    return parseInt(time.slice(-5, -3));
}

/**
 * Get minutes from a date and time
 *
 * @param {string} time - "Y-m-d H:i:s"
 * @returns {int} - minutes
 */
function fetchMinFromTime(time) {
    return parseInt(time.slice(-2));
}

/**
 * Make a table of the aggregated time in HTML format
 *
 * @param {object} log Categorized aggregate data (json)
 * @returns {string} HTML Table
 */
export function toHtml(log) {
    const dataJson = parse(log);
    const breakMark = "^";
    let sum = 0;
    let total = 0;
    let output =
        `<html><head><style>
th {background-color:#bfa}
tr:nth-child(2n+1) {background-color:#dfc}
</style></head><body><table><tbody>
<tr>
    <th>${__("work_category")}</th>
    <th>${__("work_detail")}</th>
    <th>${__("work_time_hour")}</th>
    <th>${__("work_time_min")}</th>
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

    const sumStr = __("work_time_actual") + "： " + (Math.floor(sum / 60) + Math.round(sum % 60 / 15) / 4) + " h";
    const totalStr = __("work_time_total") + "： " + (Math.floor(total / 60) + Math.round(total % 60 / 15) / 4) + " h";

    output +=
        `</tbod></table>
<p>
${sumStr}<br>
${totalStr}</p>
</bdoy></html>`;

    return output;
}

/**
 * Make a markdown table of the aggregated time
 *
 * @param {object} log Categorized aggregate data (json)
 * @returns {string} markdown table
 */
export function toMarkdown(log) {
    const dataJson = parse(log);
    const breakMark = "^";
    let sum = 0;
    let total = 0;
    let output =
        `${__("work_category")} | ${__("work_detail")} | ${__("work_time_hour")} | ${__("work_time_min")}
--- | --- | --: | --:
`;

    for (const category of Object.keys(dataJson).sort()) {
        output += `${category} | ${dataJson[category].detail} | ${dataJson[category].round} | ${dataJson[category].time}\n`;
        if (category[0] != breakMark) sum += dataJson[category].time;
        total += dataJson[category].time;
    }

    output += `\n${__("work_time_actual")}： ` + (Math.floor(sum / 60) + Math.round(sum % 60 / 15) / 4) + " h";
    output += `\n${__("work_time_total")}： ` + (Math.floor(total / 60) + Math.round(total % 60 / 15) / 4) + " h";

    return output;
}
