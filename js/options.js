import { sync, i18nInit, translate } from './utils.js';

window.onload = () => {
    i18nInit();

    // Loading storage.sync
    for (const input of $('input,option')) {
        translate(input);
    }

    for (const input of $('input,option')) {
        input.addEventListener('input', e => {
            const elem = e.target;
            const key = elem.dataset('i18n');
            const value = elem.value || elem.innerText;
            sync.set({ [key]: [value] });
        });
    }
};
