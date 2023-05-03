import { $, getRoundingUnit, ROUNDING_UNIT_MINUTE_KEY } from "./lib/utils.js";
import { i18nInit, translate } from "./lib/i18n.js";
import { Log } from "./lib/logger.js";

/**
 * Code to be executed upon completion of form loading
 */
document.addEventListener("DOMContentLoaded", async () => {
    i18nInit();

    // Init tags
    $('input').forEach(async node => {
        const str = (await chrome.storage.sync.get(node.dataset.i18n))[node.dataset.i18n];
        node.value = (str && str != "undefined") ? str : translate(node.dataset.i18n);

        // When the focus is removed or changed, the input is saved.
        node.addEventListener('change', function(e) {
            chrome.storage.sync.set({ [this.dataset.i18n]: this.value.trim() });
        });
    });

    // Init rounding unit
    const min = (await chrome.storage.sync.get(ROUNDING_UNIT_MINUTE_KEY))[ROUNDING_UNIT_MINUTE_KEY];
    $('select').value = getRoundingUnit(min);

    // When the rounding unit is changed, the value is saved.
    $('select').addEventListener('change', function(e) {
        chrome.storage.sync.set({ [ROUNDING_UNIT_MINUTE_KEY]: this.value });
    });
});
