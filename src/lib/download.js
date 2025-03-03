// @dada78641/khinsider, (c) 2024. MIT license.

import chalk from 'chalk'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import sanitize from 'sanitize-filename'
import {fetchToFile} from '../util/fetch.js'
import {getVersion} from '../util/pkg.js'

/**
 * Actually downloads an album.
 */
export async function runDownloadTasks(album) {
  const dir = sanitize(`${album.title} [${album.meta.platforms}] (${album.meta.year})`)
  await fs.mkdir(dir, {recursive: true})
  const base = path.join(process.cwd(), dir)
  console.log(`Downloading to: ${chalk.green(path.relative(process.cwd(), base))}`)
  console.log('')
  const info = JSON.stringify({...album, _version: getVersion()}, null, 2)
  await fs.writeFile(path.join(base, 'info.json'), info, 'utf8')

  for (const file of [...album.images, ...album.tracks]) {
    const url = new URL(file)
    const urlPath = path.parse(decodeURIComponent(url.pathname))
    await fetchToFile(file, path.join(base, urlPath.base))
    console.log(`Downloaded: ${chalk.yellow(urlPath.base)}`)
  }
}