import { $, getTodayString, syncGet, LOG_DATA_KEY, FILE_TYPE_KEY } from "./lib/utils.js";
import { i18nInit, __, translate } from "./lib/i18n.js";
import { outputLog } from "./lib/download.js";
import { Log } from "./lib/logger.js";

function appendTime(tag) {
    var d = new Date();
    return getTodayString()
        + " "
        + `0${d.getHours()}`.slice(-2) + ":" + `0${d.getMinutes()}`.slice(-2)
        + tag;
}

/**
 * Add one log
 *
 * @param {*} tag One log without time of day
 * @return {Promise} Promise to register work log in sync
 */
export function appendLog(tag) {
    /** var {int} LOG_MAX_LEN Maximum number of lines to be kept as a log. Lines older than this are discarded. */
    const LOG_MAX_LEN = 100;

    return syncGet(LOG_DATA_KEY)
        .then(log => {
            const logStr = (log + "\n" + tag).replace(/(^\n|\n$|\n{2,})/g, "");  // Delete empty lines
            const splitedLogs = logStr.split("\n").slice(-1 * LOG_MAX_LEN);
            const formatedLog = logStr.replace(/.+\n$/, '');
            chrome.storage.sync.set({ [LOG_DATA_KEY]: formatedLog });
        });
}

/**
 * Add one line to the work log
 */
function updateLogs() {
    const ta = $('textarea');
    syncGet(LOG_DATA_KEY)
        .then(str => {
            if (typeof str != 'string') {
                // Objects are entered from similar instead of empty strings
                str = "";
            }
            ta.textContent = str;

            // Keep scrolling to the bottom.
            ta.scrollTo(0, ta.scrollHeight);
        });
}

/**
 * Save your work log
 *
 * @param {string} log
 */
function saveLogs(log) {
    chrome.storage.sync.set({ [LOG_DATA_KEY]: log.replace(/\n+/g, "\n").replace(/(^\n+|\n+$)/g, "") });
}

document.addEventListener("DOMContentLoaded", () => {
    i18nInit();

    for (const node of $('label')) {
        translate(node);
        Log.debug(node);
    }

    $('input').addEventListener('change', (e) => {
        appendLog(appendTime(e.target.value))
            .then(updateLogs);
    });

    $('button').addEventListener('click', (e) => {
        outputLog();
    });

    document.body.addEventListener('keydown', (e) => {
        e.cancelBubble = true;
        if (document.activeElement.value) return;
        if (/Digit\d/.test(e.code)) {
            if (e.code == 'Digit0') {
                e.preventDefault();
                $('input').focus();
            } else {
                const digit = e.code.slice(-1);
                const node = $(`[data-shortcut-key="${digit}"]`);
                appendLog(appendTime(node.value || node.textContent))
                    .then(updateLogs);
            }
        } else if (e.code == "Enter" || e.code == "Escape" || e.code == "Alt+Shift+0") {
            window.close();
        }
    });

    for (const node of $('label[data-shortcut-key]')) {
        node.addEventListener('click', (e) => {
            e.cancelBubble = true;
            if (document.activeElement.value) return;
            appendLog(appendTime(node.textContent))
                .then(updateLogs);
        });
    }

    $('textarea').addEventListener('keyup', e => {
        saveLogs(e.target.value);
    });

    updateLogs();

    // debug();
});
