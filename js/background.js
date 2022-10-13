import { syncGet, LOG_DATA_KEY, FILE_TYPE_KEY } from "./lib/utils.js";
import { Log } from "./lib/logger.js";

chrome.commands.onCommand.addListener((command) => {
    Log.log(`background!${command}`);
    if (command == "log_download") {
        Promise.all([syncGet(LOG_DATA_KEY), syncGet(FILE_TYPE_KEY)])
            .then(values => {
                const log = values[0];
                const type = values[1];
                const downloadFunction = type + "Download";
                Log.log(type, downloadFunction);
                util[downloadFunction](log);
            });
    }
});
