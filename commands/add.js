const log = require('debug')('ipfs-friends:add')
/*
write somthing to mfs
{
  QmHash: "al"
}
*/
module.exports = async function add (ctx, name, peerId) {
  if (!name || !peerId) throw new Error('missing name or peerId')
  const { ipfs } = ctx
  const index = await readFriends(ipfs)
  index[peerId] = name
  await writeFriends(ipfs, index)
  const out = `
👍😙👍
  `
  return { out }
}

async function readFriends (ipfs) {
  try {
    const index = await ipfs.files.read('/friends/index.json')
    return JSON.parse(index)
  } catch (err) {
    log(err)
    return {}
  }
}

async function writeFriends (ipfs, index) {
  const data = Buffer.from(JSON.stringify(index))
  await ipfs.files.write('/friends/index.json', data, { create: true, parents: true })
}
