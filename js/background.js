const DEBUG = false;

import { syncGet, LOG_DATA_KEY, FILE_TYPE_KEY } from "./utils.js";

chrome.commands.onCommand.addListener((command) => {
    console.log(`background!${command}`);
    if (command == "log_download") {
        Promise.all([syncGet(LOG_DATA_KEY), syncGet(FILE_TYPE_KEY)])
            .then(values => {
                const log = values[0];
                const type = values[1];
                const downloadFunction = type + "Download";
                console.log(type, downloadFunction);
                util[downloadFunction](log);
            });
    }
});
