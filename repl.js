const debug = require('debug')('ipfs-friends:repl')
const Chalk = require('chalk')
const { read } = require('./read')
const { evaluate } = require('./eval')
const print = require('./print')
const loop = require('./loop')
const { withAutoComplete } = require('./auto-complete')
const { withSpin } = require('./spinner')

module.exports = async function repl (ctx, opts) {
  opts = opts || {}

  console.log(`
${Chalk.bold('...get by with a little help from your friends')}
Type "help" then <Enter> for a list of commands.
`)

  opts.read = opts.read || withAutoComplete(read)
  opts.evaluate = opts.evaluate || withSpin(evaluate)

  return loop(async function rep () {
    const { input } = await opts.read(ctx)
    let [ cmd, ...cmdArgs ] = input.split(' ').filter(Boolean)

    debug(cmd, cmdArgs)

    await print(async () => {
      const res = await opts.evaluate(ctx, cmd, cmdArgs)
      if (res && res.ctx) Object.assign(ctx, res.ctx)
      return res
    })
  })
}
