module.exports = async function add (ctx, peerId, name) {
  const { friendDaemon } = ctx
  await friendDaemon.add(peerId, name)
  const out = `
👍😙👍
  `
  return { out }
}
