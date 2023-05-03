import { __ } from "./i18n.js";
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
 */
export function fetchHourFromTime(time = null, isInt = true) {
    const date = time === null ? new Date() : new Date(time)
    const hour = date.getHours().toString().padStart(2,"0");
    return isInt ? parseInt(hour) : hour;
}

/**
 * Get minutes from a date and time
 *
 * @param {string|null} time - "Y-m-d H:i:s"
 * @returns {int|string} - minutes
 */
export function fetchMinFromTime(time = null, isInt = true) {
    const date = time === null ? new Date() : new Date(time)
    const min = date.getMinutes().toString().padStart(2,"0");
    return isInt ? parseInt(min) : min;
}

/**
 * Retrieve strings stored in storage (asynchronous)
 *
 * @param {string} key Object Keys
 * @returns {Promise<string>} Promise returning a string stored in storage
 */
export function syncGet(key) {
    return chrome.storage.sync.get(key)
        .then(obj => {
            return obj[key] || __(key);
        });
}

/**
 * Obtain valid rounding unit time
 *
 * @param {int|string|NaN} value
 * @returns {int} Rounding unit: 1, 5, 10, 15, 30, 60
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
 * @returns {string} formatted a log. e.g.) "2023-01-01 00:00Work Contents"
 */
export function appendTime(tag) {
    return getTodayString()
        + " "
        + fetchHourFromTime(null, false) + ":" + fetchMinFromTime(null, false)
        + tag;
}
