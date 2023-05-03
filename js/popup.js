import { $, syncGet, syncSet, LOG_DATA_KEY, trimNewLine, appendTime } from "./lib/utils.js";
import { i18nInit, __, translate } from "./lib/i18n.js";
import { downloadLog } from "./lib/download.js";
import { Log } from "./lib/logger.js";

/**
 * Add one log
 *
 * @param {*} tag One log without time of day
 * @return {Promise}
 */
export async function appendLog(tag) {
    const textarea = $('textarea');
    textarea.value += "\n" + tag;
    textarea.value = trimNewLine(textarea.value);

    // Keep scrolling to the bottom.
    textarea.scrollTo(0, textarea.scrollHeight);
}

/**
 * Load the work log
 *
 * @return {Promise}
 */
async function loadLogs() {
    const textarea = $('textarea');

    // Objects are entered from similar instead of empty strings
    textarea.value = await syncGet(LOG_DATA_KEY);

    // Keep scrolling to the bottom.
    textarea.scrollTo(0, textarea.scrollHeight);
}

/**
 * Save your work log
 *
 * @param {string} log
 * @return {Promise}
 */
async function saveLogs(log) {
    await syncSet({ [LOG_DATA_KEY]: trimNewLine(log) });
}

/**
 * Code to be executed upon completion of form loading
 */
document.addEventListener("DOMContentLoaded", async () => {
    i18nInit();

    for (const node of $('label')) {
        translate(node);
    }

    // When the entry to the 0th is confirmed, the log entered is imprinted.
    $('input').addEventListener('change', async function() {
        await appendLog(appendTime(this.value));
    });

    // When the download button is pressed, the log is downloaded.
    $('button').addEventListener('click', downloadLog);

    // When a key is entered on the popup
    document.body.addEventListener('keydown', async (e) => {
        // e.stopPropagation();
        if (document.activeElement.value) return;

        // When a numeric key is pressed
        if (/Digit\d/.test(e.code)) {
            if (e.code == 'Digit0') {
                // e.preventDefault();
                $('input').focus();
            } else {
                // For 1-9, imprint the preset tag.
                const digit = e.code.slice(-1);
                const node = $(`[data-shortcut-key="${digit}"]`);
                await appendLog(appendTime(node.value || node.textContent));
            }
        } else if (e.code == "Enter" || e.code == "Escape" || e.code == "Alt+Shift+0") {
            await saveLogs($('textarea').value);
            window.close();
        }
    });

    // When you click on a preset tag
    for (const node of $('label[data-shortcut-key]')) {
        node.addEventListener('click', async function(e) {
            e.stopPropagation();
            if (document.activeElement.value) return;
            await appendLog(appendTime(this.textContent))
        });
    }

    // When a popup loses focus, it saves the contents of the textarea.
    window.addEventListener('blur', async function() {
        await saveLogs($('textarea').value);
    });

    //
    $('textarea').addEventListener('keydown', async function(e) {
        if (e.code == "Enter" || e.code == "Escape" || e.code == "Alt+Shift+0") {
            await saveLogs(this.value);
        }
    });

    // Load the last saved log
    await loadLogs();
});
