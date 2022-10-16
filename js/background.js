import { outputLog } from "./lib/download.js";
import { Log } from "./lib/logger.js";

chrome.commands.onCommand.addListener((command) => {
    if (command == "log_download") {
        outputLog();
    } else if (command == "open_options") {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('html/options.html'));
        }
    }
}
);
