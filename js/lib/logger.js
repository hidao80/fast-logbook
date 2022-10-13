/**
* Class of log functions that can control output suppression
*/
export class Logger {
    /**
     * Constructor
     * @param {boolean} isDisplay - If true, output
     */
    constructor(isDisplay = true) {
        this.isDisplay = isDisplay;
    }

    /**
     * Get whether the setting is to output or not
     * @returns {boolean} this.isDisplay value
     */
    isDisplay() {
        return this.isDisplay;
    }

    /**
     * Pass to Log.debug and also control the display
     * @param  {...any} args
     */
    debug(...args) {
        if (this.isDisplay) console.debug(...args);
    }

    /**
     * Pass to Log.info and also control the display
     * @param  {...any} args
     */
    info(...args) {
        if (this.isDisplay) console.info(...args);
    }

    /**
     * Pass to Log.log and also control the display
     * @param  {...any} args
     */
    log(...args) {
        if (this.isDisplay) console.log(...args);
    }

    /**
     * Pass to Log.warn and also control the display
     * @param  {...any} args
     */
    warn(...args) {
        if (this.isDisplay) console.warn(...args);
    }

    /**
     * Pass to Log.error and also control the display
     * @param  {...any} args
     */
    error(...args) {
        if (this.isDisplay) console.error(...args);
    }
}

export default new Logger(true);
export const enabled = new Logger(true);
export const diabled = new Logger(false);
