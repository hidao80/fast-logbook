import * as util from "./utils.js";
import { $, i18nInit, translate, syncGet, LOG_DATA_KEY, FILE_TYPE_KEY } from "./utils.js";

const appendTime = (tag) => {
    var d = new Date();
    return util.getTodayString() + " "
        + `0${d.getHours()}`.slice(-2) + ":" + `0${d.getMinutes()}`.slice(-2)
        + tag;
};

const updatecStatus = async () => {
    const log = await syncGet(LOG_DATA_KEY);
    const ta = $('textarea');
    ta.textContent = log;

    // Keep scrolling to the bottom.
    ta.scrollTo(0, ta.scrollHeight);
};

const updateLog = (log) => {
    chrome.storage.sync.set({ [LOG_DATA_KEY]: log.replace(/\n+/g, "\n").replace(/(^\n+|\n+$)/g, "") });
};

window.onload = () => {
    i18nInit();

    for (const node of $('[data-i18n^=shortcut_]')) {
        translate(node);
    }

    $('input').addEventListener('change', (e) => {
        util.appendLog(appendTime(e.target.value))
            .then(util.updatecStatus)
            .then(window.close);
    });

    $('button').addEventListener('click', (e) => {
        Promise.all([syncGet(LOG_DATA_KEY), syncGet(FILE_TYPE_KEY)])
            .then(values => {
                const log = values[0];
                const type = values[1];
                const downloadFunction = type + "Download";
                console.log(type, downloadFunction);
                util[downloadFunction](log);
            });
    });

    document.body.addEventListener('keydown', (e) => {
        e.cancelBubble = true;
        if (document.activeElement.value) return;
        if (/Digit\d/.test(e.code)) {
            if (e.code == 'Digit0') {
                e.preventDefault();
                $('input').focus();
            } else {
                const node = $("[data-i18n=shortcut_" + e.code.slice(-1) + "]");
                util.appendLog(appendTime(node.value || node.textContent))
                    .then(updatecStatus);
            }
        } else if (e.code == "Enter" || e.code == "Escape" || e.code == "Alt+Shift+0") {
            window.close();
        }
    });

    $('textarea').addEventListener('keyup', e => {
        updateLog(e.target.value);
    });

    updatecStatus();

    // debug();
};
