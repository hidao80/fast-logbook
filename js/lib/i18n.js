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
 * Translate default values
 *
 * @param {node|string} target Nodes in the DOM or keywords for the sentence to be translated
 */
export async function translate(target) {
    const isObject = typeof target === 'object';
    const key = isObject ? target?.dataset?.i18n : target;

    let str = "";
    try {
        str = chrome.i18n.getMessage(key);
    } catch (ex) {
        // str = "";
    }

    if (isObject) {
        if (['input'].includes(target.tagName.toLowerCase())) {
            target.value = str;
        } else {
            target.textContent = str;
        }
    }
    return str;
}
