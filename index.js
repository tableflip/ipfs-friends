const IpfsApi = require('ipfs-api')
const repl = require('./repl')

module.exports = async function (argv, opts) {
  argv = (argv || process.argv).slice(2)
  opts = opts || {}

  const ctx = await getInitialCtx()
  repl(ctx, opts)
}

async function getInitialCtx () {
  const ipfs = IpfsApi()
  return { ipfs }
}
