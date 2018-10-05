const domino = require('domino')
const { getMetadata } = require('page-metadata-parser')

const { getLearningPlanMetadata } = require('./apiService')

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

const filterMetadata = async ({ title, url }) => {
  switch (true) {
    case /learning plan/i.test(title):
      const id = url.match(/\d+/)[0]
      return await getLearningPlanMetadata({ id })
  }
}

const getExtraMetadata = async params => {
  const res = await filterMetadata(params)
  const { thumbnail_3x_url, title } = res

  return createUnfurls({ image_url: thumbnail_3x_url, title, url: params.url })
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
