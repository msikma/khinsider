// @dada78641/khinsider, (c) 2024. MIT license.

import {createRequire} from 'module'

const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

/**
 * Returns the current version for use in the info.json file.
 */
export function getVersion() {
  return {
    _package: pkg.name,
    _version: pkg.version,
  }
}