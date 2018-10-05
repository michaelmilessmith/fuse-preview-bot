const domino = require('domino')
const stripTags = require('striptags')
const unescape = require('unescape')
const { getMetadata } = require('page-metadata-parser')

const {
  getLearningPlanMetadata,
  getEventMetadata,
  getTopicMetadata
} = require('./apiService')

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

const matchAPIRequest = async url => {
  const id = url.match(/\d+/)[0]
  switch (true) {
    case /plans/i.test(url):
      return await getLearningPlanMetadata({ id })
    case /event/i.test(url):
      return await getEventMetadata({ id })
    case /topic/i.test(url):
      return await getTopicMetadata({ id })
    default:
      return false
  }
}

const getExtraData = async url => {
  const res = await matchAPIRequest(url)
  if (!res) return
  const { image_url, title, description, asset_url, name } = res
  if (image_url && title) {
    // Learning Plan or Topic
    return {
      image_url,
      title,
      description,
      url
    }
  }
  if (description && name && asset_url) {
    // Event
    let image_url = `https://fuse.fuseuniversal.com/${asset_url}`
    let text = unescape(stripTags(description))
    return { image_url, title: name, text, url }
  }
}

const checkMetadata = ({ page, url }) => {
  const { title, text, image_url, footer_icon } = parseMetadata({
    page,
    url
  })
  return { url, title, text, image_url, footer_icon }
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

module.exports = { checkMetadata, createUnfurls, getExtraData }
