const DEBUG = false;

import { __ } from "./i18n.js";

export const LOG_DATA_KEY = 'log';
export const FILE_TYPE_KEY = 'file_type_value';

/** var {int} LOG_MAX_LEN Maximum number of lines to be kept as a log. Lines older than this are discarded. */
export const LOG_MAX_LEN = 100;

/**
 * Alias for querySelector
 *
 * @param {string} selector css selector
 * @returns {Node} Node(s)
 */
export const $ = (selector) => {
    const nodes = document.querySelectorAll(selector);
    return nodes.length == 1 ? nodes[0] : nodes;
};

/**
 * Add one log
 *
 * @param {*} tag One log without time of day
 */
export const appendLog = async (tag) => {
    let log = await syncGet(LOG_DATA_KEY);
    log += "\n" + tag;
    const splitedLog = log.split("\n").slice(-LOG_MAX_LEN);
    if (DEBUG) console.log("appendLog(): " + splitedLog.length);
    await chrome.storage.sync.set({ [LOG_DATA_KEY]: splitedLog.join("\n").replace(/\n+/g, "\n").replace(/(^\n+|\n+$)/g, "") });
};

/**
 * String the current time
 *
 * @returns {string} "Y-m-d H-ii-s"
 */
export const getTodayString = () => {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    var yyyy = `000${year}`.slice(-4);
    var mm = `0${month}`.slice(-2);
    var dd = `0${day}`.slice(-2);
    return yyyy + "-" + mm + "-" + dd;
};

/**
 * storage.sync.get,set preview
 */
export const debug = () => {
    Promise.all([syncGet(LOG_DATA_KEY), syncGet(FILE_TYPE_KEY)])
        .then(values => {
            const log = values[0];
            const type = values[1];
            console.log({ log, type });
        });
};

/**
 * Retrieve strings stored in storage (asynchronous)
 *
 * @param {string} key Object Keys
 * @returns {string} String stored in storage
 */
export const syncGet = async (key) => {
    const value = (await chrome.storage.sync.get(key))[key];
    return value ? value : __(key);
};
