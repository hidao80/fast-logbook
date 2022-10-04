const DEBUG = false;

import { __ } from "./i18n.js";
import { getTodayString } from "./utils.js";

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
export const download = (outputDataString, extension, mimeType) => {
    const reader = new FileReader();
    reader.readAsDataURL(new Blob([outputDataString], { type: mimeType }));
    reader.onload = () => {
        chrome.downloads.download({
            "url": reader.result,
            "filename": __("app_name") + "_" + getTodayString() + "." + extension
        });
    };
};

/**
 * Analyze and tabulate raw data from work hour logs
 *
 * @param {string} text Raw data of work time logs
 * @returns {object} Categorized aggregate data (json)
 */
export const parse = (text) => {
    const TIME_LENGTH = 16;
    const FIELD_SEPARATOR = ";";
    const RECORD_SEPARATOR = "\n";

    let timeStamp = [], jso = {};

    // Convert logs to JSON
    text.split(RECORD_SEPARATOR).forEach(line => {
        const time = line.slice(0, TIME_LENGTH);
        const junction = line.indexOf(FIELD_SEPARATOR);
        const category = junction < 0 ? line.slice(TIME_LENGTH) : line.slice(TIME_LENGTH, junction);
        const detail = junction < 0 ? '' : line.slice(junction + 1);

        timeStamp.push({ "time": time, "category": category });
        if (!jso[category]) jso[category] = {};
        jso[category].time = 0;
        if (!jso[category].detail) jso[category].detail = [];
        jso[category].detail.push(detail);
    });

    // Eliminate duplication of work details
    Object.keys(jso).forEach(item => {
        jso[item].detail = Array.from(new Set(jso[item].detail)).join(", ");
    });

    // Work time in minutes
    for (let i = 1; i < timeStamp.length; i++) {
        let afterHour = parseInt(timeStamp[i].time.slice(-5, -3));
        let beforeHour = parseInt(timeStamp[i - 1].time.slice(-5, -3));
        console.log(afterHour, beforeHour);
        let hour = afterHour - beforeHour < 0 ? afterHour + 24 - beforeHour : afterHour - beforeHour;
        let min = parseInt(timeStamp[i].time.slice(-2)) - parseInt(timeStamp[i - 1].time.slice(-2));
        // over the course of a day
        if (min < 0) {
            hour -= 1;
            min += 60;
        }
        jso[timeStamp[i - 1].category].time += hour * 60 + min;
    }

    // Convert work time to 0.25 increments of time
    Object.keys(jso).forEach(item => {
        jso[item].round = Math.floor(jso[item].time / 60) + Math.round(jso[item].time % 60 / 15) / 4;
    });

    return jso;
};

/**
 * Make a table of the aggregated time in HTML format
 *
 * @param {object} log Categorized aggregate data (json)
 * @returns {string} HTML Table
 */
export const toHtml = (log) => {
    const dataJson = parse(log);
    const breakMark = "^";
    let sum = 0;
    let total = 0;
    let output =
        `<html><head><style>
th {background-color:#bfa}
tr:nth-child(2n) {background-color:#dfc}
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
};

/**
 * Make a markdown table of the aggregated time
 *
 * @param {object} log Categorized aggregate data (json)
 * @returns {string} markdown table
 */
export const toMarkdown = (log) => {
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
};