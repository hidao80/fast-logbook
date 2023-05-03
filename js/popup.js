import { $, LOG_DATA_KEY, trimNewLine, appendTime } from "./lib/utils.js";
import { i18nInit, translate } from "./lib/i18n.js";
import { downloadLog } from "./lib/download.js";
import { Log } from "./lib/logger.js";

/**
 * Add one log
 *
 * @param {*} tag One log without time of day
 * @return {Promise}
 */
export function appendLog(tag) {
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
    // Objects are entered from similar instead of empty strings
    const str = (await chrome.storage.sync.get(LOG_DATA_KEY))[LOG_DATA_KEY];
    if (str && str != "undefined") {
        const textarea = $('textarea');
        textarea.value = str;

        // Keep scrolling to the bottom.
        textarea.scrollTo(0, textarea.scrollHeight);
    }
}

/**
 * Save your work log
 *
 * @return {Promise}
 */
function saveLogs() {
    chrome.storage.sync.set({ [LOG_DATA_KEY]: trimNewLine($('textarea').value) });
}

/**
 * Code to be executed upon completion of form loading
 */
document.addEventListener("DOMContentLoaded", async () => {
    i18nInit();

    // When you click on a preset tag
    for (const node of $('label[data-shortcut-key]')) {
        const key = 'shortcut_' + node.dataset.shortcutKey;
        const str = (await chrome.storage.sync.get(key))[key];
        if (str && str != "undefined") {
            node.textContent = str;
        } else {
            node.textContent = translate(node.dataset.i18n);
        }

        node.addEventListener('click', async function(e) {
            e.stopPropagation();
            if (document.activeElement.value) return;
            await appendLog(appendTime(this.textContent))
            await saveLogs();
        });
    }

    // When a key is entered on the popup
    document.body.addEventListener('keydown', async (e) => {
        if (document.activeElement.value) return;

        // When a numeric key is pressed
        const matches = e.code.match(/Digit(\d)/);
        if (matches?.length == 2) {
            const inputDigit = matches[1];
            if (inputDigit == '0') {
                // When 0 is pressed, focus on the input field.
                e.preventDefault()
                e.stopPropagation();
                $('input').focus();
                $('input').value = '';
            } else {
                // For 1-9, imprint the preset tag.
                const node = $(`label[data-shortcut-key="${inputDigit}"]`);
                await appendLog(appendTime(node.textContent));
            }
        } else if (["Escape", "Alt+Shift+0"].includes(e.code)) {
            await saveLogs();
            window.close();
        }
    });

    // When the download button is pressed, the log is downloaded.
    $('button').addEventListener('click', async () => downloadLog);

    // When the entry to the 0th is confirmed, the log entered is imprinted.
    $('input').addEventListener('keydown', async function(e) {
        if ("Enter" == e.code) {
            if (this.value.length == 0) return;
            await appendLog(appendTime(this.value));
            this.value = '';
        }
    });

    //
    $('textarea').addEventListener('keydown', async function(e) {
        if ("Enter" == e.code) {
            await saveLogs();
        }
    });

    // When a popup loses focus, it saves the contents of the textarea.
    [$('input'), window].forEach((node) => {
        node.addEventListener('blur', async function() {
            await saveLogs();
        });
    });

    // Load the last saved log
    await loadLogs();
});
