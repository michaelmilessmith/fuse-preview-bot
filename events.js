const {
  checkMetadata,
  getExtraData,
  createUnfurls
} = require('./metadataService');
const { fetchPage, postNotification, authenticate } = require('./apiService');
const { slashCommandConfig, slashCommand } = require('./slashCommands');

const handleMessageEvent = async (req) => {
  try {
    const {
      event: { channel, links, message_ts: ts }
    } = req;
    const { url } = links[0];
    const page = await fetchPage(url);
    const metadata = await checkMetadata({ page, url });
    let unfurlData =
      (metadata.image_url && metadata) || (await getExtraData(url)) || metadata;
    await postNotification({
      channel,
      ts,
      unfurls: createUnfurls(unfurlData)
    });
  } catch (err) {
    throw err;
  }
};

const reauthenticateEvent = async () => {
  const { auth_token } = await authenticate();
  process.env.FUSE_AUTH_TOKEN = auth_token;
};

const handleSlashEvent = async (data) => {
  try {
    const { text } = data;
    const hasSpace = text.indexOf(' ') >= 0
    const command = hasSpace ? text.slice(0, text.indexOf(' ')) : text;
    const execute = slashCommandConfig[command];
    if (execute) {
      const message = await execute(text);
      return message
    } else {
      return 'That command is not recognized';
    }
  } catch (err) {
    throw err;
  }
};

module.exports = { handleMessageEvent, reauthenticateEvent, handleSlashEvent };
