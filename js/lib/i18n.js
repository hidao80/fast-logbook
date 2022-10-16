import { $, syncGet } from "./utils.js";
import { Log } from "./logger.js";

/**
 * Internationalize display items
 */
export function i18nInit() {
    const nodes = $('[data-i18n]');
    for (const node of nodes) {
        const str = __(node.dataset.i18n);
        Log.debug(node, str);
        if (node.type == 'text') {
            node.value = str;
        } else {
            node.innerText = str;
        }
    }
}

/**
 * Use i18n to internationalize phrases
 *
 * @param {string} key Keywords for the sentence to be translated
 * @returns {string} Translated text
 */
export function __(key) {
    return chrome.i18n.getMessage(key);
}

/**
 * Translate default values
 *
 * @param {*} node Nodes in the DOM
 */
export function translate(node) {
    const key = node.dataset.i18n;
    Log.debug(key);
    syncGet(key)
        .then(str => {
            Log.debug(str);
            if (!str && typeof str != 'string') {
                str = __(key);
                chrome.storage.sync.set({ [key]: str });
            }
            if (node.type == 'text') {
                node.value = str;
            } else {
                node.textContent = str;
            }
        });
}
