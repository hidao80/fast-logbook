export const __ = chrome.i18n.getMessage;
export const sync = chrome.storage.sync;
export const i18nInit = () => {
    $('[data-i18n]').each((index, elem) => {
        if ($(elem).is('input')) {
            $(elem).val(__($(elem).data('i18n')));
        } else {
            $(elem).text(__($(elem).data('i18n')));
        }
    });
};
