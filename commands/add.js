const log = require('debug')('ipfs-friends:add')
const CID = require('cids')
const { readFriends, writeFriends } = require('../lib/friends')

/*
write somthing to mfs
{
  QmHash: "al"
}
*/
module.exports = async function add (ctx, peerId, name) {
  if (!name || !peerId) throw new Error('missing name or peerId')
  try {
    new CID(peerId) // eslint-disable-line
  } catch (err) {
    log(err)
    throw new Error(`invalid peerId ${peerId}`)
  }

  const { ipfs } = ctx
  const index = await readFriends(ipfs)
  index[peerId] = name
  await writeFriends(ipfs, index)
  const out = `
👍😙👍
  `
  return { out }
}
