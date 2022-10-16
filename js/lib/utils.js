import { __ } from "./i18n.js";
import { Log } from "./logger.js";

export const LOG_DATA_KEY = 'log';
export const FILE_TYPE_KEY = 'file_type_value';

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
 * storage.sync.get,set preview
 */
export function debug() {
    Promise.all([syncGet(LOG_DATA_KEY), syncGet(FILE_TYPE_KEY)])
        .then(values => {
            const log = values[0];
            const type = values[1];
            Log.debug({ log, type });
        });
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
