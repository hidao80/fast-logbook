import { translate } from "./i18n.js";
import { getTodayString, LOG_DATA_KEY, ROUNDING_UNIT_MINUTE_KEY, fetchHourFromTime, fetchMinFromTime } from "./utils.js";
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

export async function downloadLog() {
    const log = (await chrome.storage.sync.get(LOG_DATA_KEY))[LOG_DATA_KEY];
    const mins = (await chrome.storage.sync.get(ROUNDING_UNIT_MINUTE_KEY))[ROUNDING_UNIT_MINUTE_KEY];
    const outputStr =
`<h2>${translate('html_summary')}</h2>
<div>
${toHtml(log, mins)}
</div>
<h2 class="pt-5">${translate('plaintext_log')}</h2>
<i id="plain-text-log" class="fa-sharp fa-regular fa-copy btn btn-outline-secondary"
data-bs-trigger="manual" data-bs-toggle="tooltip" data-bs-placement="top" title="copy!"></i>
<div class="form-control"><pre><code id="plain-text-log-source">
${log}
</code></pre></div>
<h2 class="pt-5">${translate('markdown_summary')}</h2>
<i id="markdown-table-log" class="fa-sharp fa-regular fa-copy btn btn-outline-secondary"
data-bs-trigger="manual" data-bs-toggle="tooltip" data-bs-placement="top" title="copy!"></i>
<div class="form-control"><pre><code id="markdown-table-log-source">
${toMarkdown(log, mins)}
</code></pre></div>
<script>
document.querySelectorAll("#plain-text-log,#markdown-table-log").forEach((t=>{const e=new bootstrap.Tooltip(t);t.addEventListener("click",(async t=>{t.preventDefault(),t.stopPropagation(),e.show(),setTimeout((()=>e.hide()),1e3);const o="plain-text-log"===t.target.id?document.querySelector("#plain-text-log-source").textContent:document.querySelector("#markdown-table-log-source").textContent;await(navigator?.clipboard?.writeText(o.trim()))}))}));
</script>`;
    download(outputStr);
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
`<html lang="ja" lang="en"><head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.3/js/bootstrap.bundle.min.js" integrity="sha512-i9cEfJwUwViEPFKdC1enz4ZRGBj8YQo6QByFTF92YXHi7waCqyexvRD75S5NVTsSiTv7rKWqG9Y5eFxmRsOn0A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0-alpha1/css/bootstrap.min.css" integrity="sha512-72OVeAaPeV8n3BdZj7hOkaPSEk/uwpDkaGyP4W2jSzAC8tfiO4LMEDWoL3uFp5mcZu+8Eehb4GhZWFwvrss69Q==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head><body><table class="table table-striped-columns"><thead class="table-light">
<tr>
<th class="text-center">${translate("work_category")}</th>
<th class="text-center">${translate("work_detail")}</th>
<th class="text-center">${translate("work_time_hour")}</th>
<th class="text-center">${translate("work_time_min")}</th>
</tr>
</thead><tbody class="table-group-divider">`;

    for (const category of Object.keys(dataJson).sort()) {
        output +=
`<tr>
<td>${category}</td>
<td>${dataJson[category].detail}</td>
<td class="text-end">${dataJson[category].round}</td>
<td class="text-end">${dataJson[category].time}</td>
</tr>`;
        if (category[0] != breakMark) sum += dataJson[category].time;
        total += dataJson[category].time;
    }

    const sumStr = translate("work_time_actual") + "： " + (Math.floor(sum / 60) + Number((Math.round(sum % 60 / mins) * mins / 60).toFixed(2))) + " h";
    const totalStr = translate("work_time_total") + "： " + (Math.floor(total / 60) + Number((Math.round(total % 60 / mins) * mins / 60).toFixed(2))) + " h";

    output +=
`</tbody></table>
<p>
${sumStr} (${sum} ${translate('mins')})<br>
${totalStr} (${total} ${translate('mins')})</p>
</body></html>`;

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
    output += `\n${translate("work_time_total")}： ` + (Math.floor(total / 60) + Number((Math.round(total % 60 / mins) * mins / 60).toFixed(2))) + ` h (${total} ${translate('mins')})`;

    return output;
}
