// import * as util from "./utils.js";
import { $, i18nInit, translate, syncGet, LOG_DATA_KEY, FILE_TYPE_KEY } from "./utils.js";

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
