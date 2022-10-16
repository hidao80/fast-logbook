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
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    var yyyy = `000${year}`.slice(-4);
    var mm = `0${month}`.slice(-2);
    var dd = `0${day}`.slice(-2);
    return yyyy + "-" + mm + "-" + dd;
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
