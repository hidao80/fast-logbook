import { $, syncGet, syncSet, getRoundingUnit, ROUNDING_UNIT_MINUTE_KEY } from "./lib/utils.js";
import { i18nInit, translate } from "./lib/i18n.js";
import { Log } from "./lib/logger.js";

document.addEventListener("DOMContentLoaded", async () => {
    i18nInit();

    for (const node of $('input')) {
        // Loading storage.sync
        translate(node);

        node.addEventListener('input', async function() {
            await syncSet({ [this.dataset.i18n]: this.value });
        });
    }

    const value = await syncGet(ROUNDING_UNIT_MINUTE_KEY);
    $('select').value = getRoundingUnit(value);

    $('select').addEventListener('change', async function() {
        await syncSet({ [ROUNDING_UNIT_MINUTE_KEY]: Number(this.value) });
    });
});
