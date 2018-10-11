const {
  checkMetadata,
  getExtraData,
  createUnfurls
} = require('./metadataService')
const { fetchPage, postNotification, authenticate } = require('./apiService')

const handleMessageEvent = async req => {
  try {
    const {
      event: { channel, links, message_ts: ts }
    } = req
    const { url } = links[0]
    const page = await fetchPage(url)
    const metadata = await checkMetadata({ page, url })
    let unfurlData =
      (metadata.image_url && metadata) || (await getExtraData(url)) || metadata
    await postNotification({
      channel,
      ts,
      unfurls: createUnfurls(unfurlData)
    })
  } catch (err) {
    throw err
  }
}

const reauthenticateEvent = async () => {
  const { auth_token } = await authenticate()
  process.env.FUSE_AUTH_TOKEN = auth_token
}

module.exports = { handleMessageEvent, reauthenticateEvent }
