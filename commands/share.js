module.exports = async function share (ctx, cid, name) {
  const { friendDaemon } = ctx
  await friendDaemon.share(cid, name)
  const out = `🎁 you shared ${name}\nhttps://share.ipfs.io/#/${cid}`
  return { out }
}
