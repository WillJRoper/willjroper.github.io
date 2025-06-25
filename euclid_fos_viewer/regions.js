// regions.js
import * as jsyaml from "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs";

/**
 * A wrapper around a YAML-defined set of regions.
 * Each top-level key becomes a property containing an array of definitions.
 */
export default class Regions {
  /**
   * @param {Object.<string, Array<Object>>} data - Parsed YAML data
   */
  constructor(data) {
    // Copy each top-level section (e.g., 'main', 'ngc_2188', etc.) onto this instance
    Object.assign(this, data);
  }

  /**
   * Fetch and parse a YAML file, returning a Regions instance.
   * @param {string} url - URL or path to the regions.yaml file
   * @returns {Promise<Regions>}
   */
  static async load(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch ${url}: ${res.status} ${res.statusText}`,
        );
      }
      const txt = await res.text();
      const data = jsyaml.load(txt) || {};
      return new Regions(data);
    } catch (err) {
      console.error("Error loading regions.yaml:", err);
      throw err;
    }
  }

  /**
   * Safe getter: returns the array for this key, or an empty array if undefined.
   * @param {string} key
   * @returns {Array<Object>}
   */
  get(key) {
    return this[key] || [];
  }
}
