import { $, syncGet, FILE_TYPE_KEY } from "./lib/utils.js";
import { i18nInit, __, translate } from "./lib/i18n.js";
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

    // Select the last item selected
    syncGet(FILE_TYPE_KEY)
        .then(type => {
            Log.debug(type);
            $('select').value = type || 'plainText';
        });

    $('select').addEventListener('change', e => {
        chrome.storage.sync.set({ [FILE_TYPE_KEY]: e.target.value });
    });

    // debug();
});
