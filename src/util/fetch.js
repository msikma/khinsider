// @dada78641/khinsider, (c) 2024. MIT license.

import fsSync from 'node:fs'
import {pipeline} from 'node:stream'
import {promisify} from 'node:util'

/**
 * Fetches a file and saves it to a local file.
 */
export async function fetchToFile(url, filename) {
  const streamPipeline = promisify(pipeline)
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`)
    }
    const fileStream = fsSync.createWriteStream(filename)
    await streamPipeline(response.body, fileStream)
  }
  catch (err) {
    console.error('Error fetching:', err)
  }
}

/**
 * Returns the html for a given KhInsider url.
 */
export async function fetchHtml(url, init = {}) {
  const res = await browserFetch(url, init)
  const text = await res.text()
  return text
}

/**
 * fetch() with preloaded default headers to mimic a real browser.
 * 
 * Usable as a drop in replacement for regular fetch().
 */
export async function browserFetch(url, init = {}) {
  const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh Intel Mac OS X 10.15 rv:133.0) Gecko/20100101 Firefox/133.0',
    'Accept': 'text/html,application/xhtml+xml,application/xmlq=0.9,image/avif,image/webp,*/*q=0.8',
    'Accept-Language': 'en-US,enq=0.5',
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
  }

  const mergedInit = {
    ...init,
    headers: {
      ...defaultHeaders,
      ...(init?.headers || {}),
    },
  }

  return fetch(url, mergedInit)
}