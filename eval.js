const log = require('debug')('ipfs-friends:eval')

module.exports.evaluate = async (ctx, cmd, cmdArgs) => {
  log(cmd, cmdArgs)
  cmd = cmd || ''
  if (!cmd) return
  if (!ctx || !ctx.commands || !ctx.commands[cmd]) {
    throw new Error(`${cmd}: command not found`)
  }
  return ctx.commands[cmd](ctx, ...cmdArgs)
}
