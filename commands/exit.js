module.exports = async function exit (ctx, peerId, name) {
  const { friendDaemon } = ctx
  await friendDaemon.stop()
  process.exit()
}
