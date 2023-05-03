import { $, syncGet, syncSet } from "./utils.js";
import { Log } from "./logger.js";

/**
 * Internationalize display items
 */
export function i18nInit() {
    const nodes = $('[data-i18n]');
    for (const node of nodes) {
        translate(node);
    }
}

/**
 * Use i18n to internationalize phrases
 *
 * @param {string} key Keywords for the sentence to be translated
 * @returns {string} Translated text
 */
export function __(key) {
    try {
        return chrome.i18n.getMessage(key);
    } catch (ex) {
        return "";
    }
}

/**
 * Translate default values
 *
 * @param {*} node Nodes in the DOM
 */
export async function translate(node) {
    const key = node.dataset.i18n;
    const str = __(key);

    if (node.type == 'text') {
        node.value = str;
    } else {
        node.textContent = str;
    }
}
