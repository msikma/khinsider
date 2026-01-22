// @dada78641/khinsider, (c) 2024. MIT license.

import {ArgumentParser} from 'argparse'

export async function parseCli() {
  const parser = new ArgumentParser({
    description: 'Downloads albums from Kingdom Hearts Insider.'
  })

  parser.add_argument('URLs', {help: 'URLs to albums to download.', nargs: '+'})
  parser.add_argument('--prefer-mp3', {help: 'Downloads MP3 files if available.', action: 'store_true'})
  parser.add_argument('--prefer-flac', {help: 'Downloads FLAC files if available (default).', action: 'store_true'})
  
  const args = {...parser.parse_args()}
  const main = await import('./index.js')
  const prefer = parser.prefer_mp3 ? 'mp3' : 'flac'
  let hasErrored = false
  for (const url of args.URLs) {
    try {
      await main.downloadAlbum(url, prefer)
    }
    catch (err) {
      hasErrored = true
      console.log(`Error while fetching url: ${url}`)
    }
  }
  if (hasErrored) {
    process.exitCode = 1
  }
}
