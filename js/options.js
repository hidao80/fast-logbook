import { $, syncGet, syncSet, getRoundingUnit, ROUNDING_UNIT_MINUTE_KEY } from "./lib/utils.js";
import { i18nInit, translate } from "./lib/i18n.js";
import { Log } from "./lib/logger.js";

/**
 * Code to be executed upon completion of form loading
 */
document.addEventListener("DOMContentLoaded", async () => {
    i18nInit();

    // Init tags
    for (const node of $('input')) {
        node.value = await syncGet(node.dataset.i18n);
        if (node.value == "undefined") {
            node.value = translate(node.dataset.i18n);
        }

        // When the focus is removed or changed, the input is saved.
        ['blur', 'change'].forEach(event => {
            node.addEventListener(event, async function() {
                await syncSet(this.dataset.i18n, this.value.trim());
            });
        });
    }

    // Init rounding unit
    $('select').value = getRoundingUnit(await syncGet(ROUNDING_UNIT_MINUTE_KEY));

    // When the rounding unit is changed, the value is saved.
    $('select').addEventListener('change', async function() {
        await syncSet(ROUNDING_UNIT_MINUTE_KEY, parseInt(this.value));
    });
});
