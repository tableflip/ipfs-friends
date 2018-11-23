const FriendDaemon = require('./lib/friends')
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
  const friendDaemon = new FriendDaemon(ipfs)

  friendDaemon
    .on('message:share', ({ peerName, peerId, cid, shareName }) => {
      console.log(`${peerName} shared ${shareName} ${cid}`)
    })
    .on('message:online', ({ peerName }) => {
      console.log(`${peerName} is here ✨🎷🐩`)
    })
    .on('message:offline', ({ peerName }) => {
      console.log(`${peerName} went away 👋`)
    })

  await friendDaemon.start()

  return { ipfs, friendDaemon }
}
