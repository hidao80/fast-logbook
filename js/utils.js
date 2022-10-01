export const __ = chrome.i18n.getMessage;
export const sync = chrome.storage.sync;
export const $ = (selector) => document.querySelectorAll(selector);
export const i18nInit = () => {
    const nodes = $('[data-i18n]');
    console.log(nodes);
    for (const node of nodes) {
        console.log(node);
        const str = __(node.dataset.i18n);
        if (node.type == 'text') {
            node.value = str;
        } else {
            node.innerText = str;
        }
    }
};
export const syncGet = async (key) => {
    return (await sync.get(key))[key];
};
export const translate = (node) => {
    const key = node.dataset.i18n;
    const value = __(key);
    const str = syncGet.get(key);
    if (str == '') {
        sync.set({ [key]: [value] });
    }
    if (node.type == 'text') {
        node.value = str;
    } else {
        node.innerText = str;
    }
};
