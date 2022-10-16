import { $, syncGet, getRoundingUnit, ROUNDING_UNIT_MINUTE_KEY } from "./lib/utils.js";
import { i18nInit, translate } from "./lib/i18n.js";
import { Log } from "./lib/logger.js";

document.addEventListener("DOMContentLoaded", () => {
    i18nInit();

    for (const node of $('input')) {
        // Loading storage.sync
        translate(node);

        node.addEventListener('input', e => {
            const elem = e.target;
            chrome.storage.sync.set({ [elem.dataset.i18n]: elem.value });
        });
    }

    syncGet(ROUNDING_UNIT_MINUTE_KEY)
        .then(value => {
            $('select').value = getRoundingUnit(value);
        });

    $('select').addEventListener('change', e => {
        const mins = Number(e.target.value);
        chrome.storage.sync.set({ [ROUNDING_UNIT_MINUTE_KEY]: mins });
    });
});
