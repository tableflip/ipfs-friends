module.exports = async function dump (ctx, peerIdOrName) {
  const { friendDaemon } = ctx
  await friendDaemon.dump(peerIdOrName)
  const out = `💦🗑  ${peerIdOrName}`
  return { out }
}
