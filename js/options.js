import { $, syncGet, FILE_TYPE_KEY } from "./lib/utils.js";
import { i18nInit, translate } from "./lib/i18n.js";

window.onload = () => {
    i18nInit();

    for (const input of $('input')) {
        // Loading storage.sync
        translate(input);

        input.addEventListener('input', e => {
            const elem = e.target;
            chrome.storage.sync.set({ [elem.dataset.i18n]: elem.value });
        });
    }

    // Select the last item selected
    syncGet(FILE_TYPE_KEY)
        .then(type => {
            $('select').value = type ? type : 'plainText';
        });

    $('select').addEventListener('change', e => {
        chrome.storage.sync.set({ [FILE_TYPE_KEY]: e.target.value });
    });

    // debug();
};
