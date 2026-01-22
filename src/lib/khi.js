// @dada78641/khinsider, (c) 2024. MIT license.

import * as cheerio from 'cheerio'
import * as path from 'node:path'
import mime from 'mime-types'
import slugify from '@sindresorhus/slugify'

/**
 * Uses a base url to make potentially relative urls absolute.
 */
function makeAbsoluteUrl(baseUrl) {
  return potentiallyRelativeUrl => {
    if (potentiallyRelativeUrl.startsWith('/')) {
      const parsableUrl = new URL(`http://example.com${potentiallyRelativeUrl}`)
      const newUrl = new URL(baseUrl)
      newUrl.pathname = parsableUrl.pathname
      newUrl.search = parsableUrl.search
      newUrl.hash = parsableUrl.hash
      return String(newUrl)
    }
    return potentiallyRelativeUrl
  }
}

/**
 * Parses an "date added" string, e.g. "Jun 8th, 2023".
 */
function parseDateString(dateString) {
  const cleaned = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1')
  return new Date(`${cleaned} 12:00:00Z`)
}

/**
 * Finds the <p> tag containing the metadata.
 */
function findMetaParagraph($) {
  const paragraphs = [...$('#pageContent > p').get()]
  const metaParagraph = paragraphs.find(p => {
    const content = $(p).text().trim()
    return content.includes('Platforms:') || content.includes('Year:') || content.includes('Number of Files:') || content.includes('Total Filesize:')
  })
  return $(metaParagraph).text().trim()
}

/**
 * Finds the metadata on the page.
 */
function findMeta($) {
  const meta = findMetaParagraph($)
  if (!meta) {
    return {}
  }
  const lines = meta.split('\n').map(l => l.trim()).filter(l => l)
  const data = {}
  for (const line of lines) {
    const split = line.split(':')
    const key = slugify(split[0].trim(), {separator: '_'})
    const value = split.slice(1).join(':').trim()
    data[key] = value
  }
  return data
}

/**
 * Finds the album images on the page.
 */
function findImages($) {
  const images = [...$('#pageContent .albumImage').get()]
  return images.map(image => {
    const href = $('> a', image).attr('href').trim()
    return href
  })
}

/**
 * Finds the tracks on the page.
 */
function findTracks($, toAbsolute) {
  const tracks = [...$('#songlist tr:not(#songlist_header)').get()]
  return tracks.map(track => {
    const n = $('td:nth-child(2)', track).text().trim()
    const title = $('td:nth-child(3)', track).text().trim()
    const duration = $('td:nth-child(4)', track).text().trim()
    const mp3Size = $('td:nth-child(5)', track).text().trim()
    const flacSize = $('td:nth-child(6)', track).text().trim()
    const download = $('td.playlistDownloadSong > a', track).attr('href')
    if (!n || !download) {
      return null
    }
    return {
      n,
      title,
      duration,
      mp3Size,
      flacSize,
      trackInfoUrl: download ? toAbsolute(download) : null,
    }
  }).filter(track => track)
}

/**
 * Returns the tracks we should actually download.
 */
export function getPreferredTracks(tracks, prefer) {
  const preferredTracks = tracks.filter(file => file.type === prefer)
  if (preferredTracks.length === 0) {
    return tracks.map(track => track.url)
  }
  return preferredTracks.map(track => track.url)
}

/**
 * Extracts track download URLs.
 */
export function extractKhiTrackInfo(html, prefer) {
  const $ = cheerio.load(html)
  const content = $('#pageContent')
  const links = [...$('.songDownloadLink', content).get()]
  const tracks = []
  for (const link of links) {
    const anchor = $(link).parent('a')
    const trackUrl = new URL(anchor.attr('href').trim())
    const trackPath = path.parse(decodeURIComponent(trackUrl.pathname))
    const trackMime = mime.lookup(trackPath.ext)
    tracks.push({
      url: trackUrl.toString(),
      type: trackPath.ext === '.flac' ? 'flac' : trackPath.ext === '.mp3' ? 'mp3' : 'other',
      mime: trackMime,
    })
  }
  return tracks
}

/**
 * Extracts structured page information from a Khinsider.com url.
 */
export function extractKhiInfo(html, url) {
  const toAbsolute = makeAbsoluteUrl(url)
  const $ = cheerio.load(html)
  const content = $('#pageContent')
  const title = $('> h2:first-of-type', content)
  const meta = findMeta($)
  const images = findImages($)
  const tracks = findTracks($, toAbsolute)

  return {
    title: title.text().trim(),
    meta,
    images,
    tracks,
  }
}
