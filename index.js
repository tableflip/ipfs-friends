const IpfsApi = require('ipfs-api')
const Chalk = require('chalk')
const FriendDaemon = require('./lib/friends')
const repl = require('./repl')

module.exports = async function (opts) {
  opts = opts || {}
  console.log(Chalk.bold('...get by with a little help from your 👫👭👬'))
  const ctx = await getInitialCtx()
  console.log('Type "help" then <Enter> for a list of commands.')
  return repl(ctx, opts)
}

async function getInitialCtx () {
  const ipfs = IpfsApi()
  const friendDaemon = new FriendDaemon(ipfs)

  friendDaemon
    .on('message:share', ({ peerName, peerId, cid, shareName }) => {
      console.log(`🎁 ${peerName} shared ${shareName} ${cid}`)
    })
    .on('message:shared', ({ peerName, peerId, shareName }) => {
      console.log(`${peerName} got ${shareName} 🙌`)
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
