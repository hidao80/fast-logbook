import { Log } from "./logger.js";

export const LOG_DATA_KEY = 'log';
export const ROUNDING_UNIT_MINUTE_KEY = 'rounding_mins';

/**
 * Alias for querySelector
 *
 * @param {string} selector css selector
 * @returns {Node} Node(s)
 */
export function $(selector) {
    const nodes = document.querySelectorAll(selector);
    return nodes.length == 1 ? nodes[0] : nodes;
}

/**
 * String the current time
 *
 * @returns {string} "Y-m-d H:i:s"
 * @example getNowString() -> "2023-05-01"
 */
export function getTodayString() {
    var date = new Date();
    var yyyy = date.getFullYear().toString().padStart(4,"0");
    var mm = (date.getMonth() + 1).toString().padStart(2,"0");
    var dd = date.getDate().toString().padStart(2,"0");
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Get the time from the date and time
 *
 * @param {string|null} time - "Y-m-d H:i:s"
 * @returns {int|string} - hour
 * @example fetchMinFromTime("2021-01-01 09:04:56") -> 9
 * @example fetchMinFromTime("2021-01-01 09:34:56", false) -> "09"
 * @example fetchMinFromTime() -> 9
 */
export function fetchHourFromTime(time = null, isInt = true) {
    const date = time === null ? new Date() : new Date(time);
    const hour = date.getHours().toString().padStart(2,"0");
    return isInt ? parseInt(hour) : hour;
}

/**
 * Get minutes from a date and time
 *
 * @param {string|null} time - "Y-m-d H:i:s"
 * @returns {int|string} - minutes
 * @example fetchMinFromTime("2021-01-01 12:04:56") -> 4
 * @example fetchMinFromTime("2021-01-01 12:34:56", false) -> "04"
 * @example fetchMinFromTime() -> 4
 */
export function fetchMinFromTime(time = null, isInt = true) {
    const date = time === null ? new Date() : new Date(time);
    const min = date.getMinutes().toString().padStart(2,"0");
    return isInt ? parseInt(min) : min;
}

/**
 * Obtain valid rounding unit time
 *
 * @param {int|string|NaN} value
 * @returns {int} Rounding unit: 1, 5, 10, 15, 30, 60
 * @example getRoundingUnit(20) -> 1
 */
export function getRoundingUnit(value) {
    let mins = 1;
    switch (Number(value)) {
        case 1:
        case 5:
        case 10:
        case 15:
        case 30:
        case 60:
            mins = Number(value);
    }
    return mins;
}

/**
 * Add time to work tag
 *
 * @param {string} tag
 * @returns {string} formatted a log.
 * @example appendTime("Project A;Meeting") -> "2023-01-01 00:00Project A;Meeting"
 */
export function appendTime(tag) {
    return getTodayString()
        + " "
        + fetchHourFromTime(null, false) + ":" + fetchMinFromTime(null, false)
        + tag;
}

/**
 * Remove duplicate and terminating newline characters from log data.
 * @param {string} text
 * @returns {string} text
 * @example trimNewLine("aa\nbb\ncc\n") -> "aa\nbb\ncc"
 */
export function trimNewLine(text) {
    return text.replace(/\n{2,}/g, '\n').replace(/(^\n|\n$)/, '');
}
