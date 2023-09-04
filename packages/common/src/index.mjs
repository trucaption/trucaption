import { configSettings } from './settings.mjs';
import { freeze } from './util.mjs';

export const CONFIG_SETTINGS = freeze(configSettings);

export function getDefaultsObject() {
  const output = {};

  Object.keys(configSettings).forEach(key => {
    output[key] = configSettings[key].defaults;
  });

  return output;
}
