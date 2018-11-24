module.exports = async function share (ctx, cid, shareName) {
  const { friendDaemon } = ctx
  const url = await friendDaemon.share(cid, shareName)
  return { out: url }
}
