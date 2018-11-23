const { readFriends, writeFriends } = require('../lib/friends')

module.exports = async function dump (ctx, peerIdOrName) {
  const { ipfs } = ctx
  const index = await readFriends(ipfs)
  const friend = index[peerIdOrName] || Object.entries(index).find(row => row[1] === peerIdOrName)
  if (!friend) throw new Error('no such friend!')
  if (index[peerIdOrName]) {
    delete index[peerIdOrName]
  } else {
    Object.keys(index).forEach(k => {
      if (index[k] === peerIdOrName) {
        delete index[k]
      }
    })
  }
  await writeFriends(ipfs, index)
  const out = `
💦🗑  ${peerIdOrName}
  `
  return { out }
}
