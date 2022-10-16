import { outputLog } from "./lib/download.js";
import { Log } from "./lib/logger.js";

chrome.commands.onCommand.addListener((command) => {
    Log.log(`background!${command}`);
    if (command == "log_download") {
        outputLog();
    }
}
);
