// @dada78641/khinsider, (c) 2024. MIT license.

import chalk from 'chalk'
import {runDownloadTasks} from './lib/download.js'
import {extractKhiInfo, extractKhiTrackInfo, getPreferredTracks} from './lib/khi.js'
import {fetchHtml} from './util/fetch.js'
import {sleep} from './util/data.js'

function printAlbumInfo(info) {
  console.log(chalk.yellow(`${info.title}`))
  console.log('')
  console.log(`Year:     ${chalk.cyan(info.meta.year)}`)
  console.log(`Platform: ${chalk.cyan(info.meta.platforms)}`)
  console.log(`Tracks:   ${chalk.cyan(info.tracks.length)}`)
  console.log('')
}

export async function downloadAlbum(url, prefer) {
  const html = await fetchHtml(url)
  const info = extractKhiInfo(html, url)
  printAlbumInfo(info)
  const tracks = []
  for (const track of info.tracks) {
    const trackHtml = await fetchHtml(track.trackInfoUrl)
    const trackInfo = extractKhiTrackInfo(trackHtml, prefer)
    tracks.push(...trackInfo)
    await sleep(500)
  }
  const preferredTracks = getPreferredTracks(tracks, prefer)
  await runDownloadTasks({...info, trackData: info.tracks, tracks: preferredTracks})
}