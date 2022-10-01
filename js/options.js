import { __, sync, i18nInit } from './utils.js';

i18nInit();

// Set evnet listener
$('input,select').on('input', e => {
    const $this = $(e.target);
    const hash = $this.data('i18n');
    let obj = {};
    obj[hash] = $this.val() || $this.text();
    sync.set(obj);
});

$(document).ready(async () => {
    // Initialization of preset strings
    let hash = $('select').data('i18n');
    if ((await sync.get(hash))[hash] == '') {
        let obj = {};
        obj[hash] = __(hash);
        sync.set(obj);
    }
    $('select').val((await sync.get(hash))[hash]);

    $('input').each(async (index, elem) => {
        let hash = $(elem).data('i18n');
        if ((await sync.get(hash))[hash] == '') {
            let obj = {};
            obj[hash] = __(hash);
            sync.set(obj);
        }
        $(elem).val((await sync.get(hash))[hash]);
    });
});
