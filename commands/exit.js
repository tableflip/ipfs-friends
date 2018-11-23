module.exports = async function exit (ctx, peerId, name) {
  const { friendDaemon } = ctx
  await friendDaemon.stop()
  if (ctx.spinner) ctx.spinner.stop()
  process.exit()
}
