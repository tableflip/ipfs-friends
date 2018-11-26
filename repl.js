const log = require('debug')('ipfs-friends:repl')

const { read } = require('./read')
const { evaluate } = require('./eval')
const print = require('./print')
const loop = require('./loop')
const { withAutoComplete } = require('./auto-complete')
const { withSpin } = require('./spinner')

module.exports = async function repl (ctx, opts) {
  opts = opts || {}

  opts.read = opts.read || withAutoComplete(read)
  opts.evaluate = opts.evaluate || withSpin(evaluate)

  return loop(async function rep () {
    const { input } = await opts.read(ctx)
    let [ cmd, ...cmdArgs ] = input.split(' ').filter(Boolean)

    log(cmd, cmdArgs)

    await print(async () => {
      const res = await opts.evaluate(ctx, cmd, cmdArgs)
      if (res && res.ctx) Object.assign(ctx, res.ctx)
      return res
    })
  })
}
