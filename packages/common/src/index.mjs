import { configSettings } from "./settings.mjs";
import { freeze } from "./util.mjs";

export const CONFIG_SETTINGS = freeze(configSettings);

export function getDefaultsObject() {
  const output = {};

  for (const key of Object.keys(configSettings)) {
    output[key] = configSettings[key].defaults;
  }

  return output;
}
