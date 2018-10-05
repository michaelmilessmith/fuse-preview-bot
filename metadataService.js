const domino = require('domino')
const stripTags = require('striptags')
const unescape = require('unescape')
const { getMetadata } = require('page-metadata-parser')

const { getLearningPlanMetadata, getEventMetadata, getTopicMetadata } = require('./apiService')

const parseMetadata = ({ page, url }) => {
  const doc = domino.createWindow(page.text).document
  const {
    title,
    description: text,
    image: image_url,
    icon: footer_icon
  } = getMetadata(doc, url)
  return {
    title,
    text,
    image_url,
    footer_icon
  }
}

const filterMetadata = async ({ url }) => {
  let id
  switch (true) {
    case /plans/i.test(url):
      id = url.match(/\d+/)[0]
      return await getLearningPlanMetadata({ id })
    case /event/i.test(url):
      id = url.match(/\d+/)[0]
      return await getEventMetadata({ id })
    case /topic/i.test(url): 
      id = url.match(/\d+/)[0]
      return await getTopicMetadata({id})
    default: 
      return false
  }
}

const getExtraMetadata = async params => {
  const res = await filterMetadata(params)
  if (!res) return 
  const { image_url, title, description, asset_url, name } = res
  if (image_url && title) {
    // Learning Plan
    return createUnfurls({
      image_url,
      title,
      description,
      url: params.url
    })
  }
  if (description && name && asset_url) {
    // Event
    let image_url = `https://fuse.fuseuniversal.com/${asset_url}`
    let text = unescape(stripTags(description))
    return createUnfurls({ image_url, title: name, text, url: params.url })
  }
}

const createMetadata = ({ page, url }) => {
  const { title, text, image_url, footer_icon } = parseMetadata({
    page,
    url
  })
  if (!image_url || !title) {
    return getExtraMetadata({ title, url })
  }
  return createUnfurls({ url, title, text, image_url, footer_icon })
}

const createUnfurls = ({ url, title, text, image_url, footer_icon }) => {
  return JSON.stringify({
    [url]: {
      text,
      title,
      image_url,
      fallback: title,
      footer_icon,
      footer: 'Powered by Fuse Universal'
    }
  })
}

module.exports = { createMetadata }
