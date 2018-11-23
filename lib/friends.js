const log = require('debug')('ipfs-friends:lib-friends')

module.exports.readFriends = async function readFriends (ipfs) {
  try {
    const index = await ipfs.files.read('/friends/index.json')
    return JSON.parse(index)
  } catch (err) {
    log(err)
    return {}
  }
}

module.exports.writeFriends = async function writeFriends (ipfs, index) {
  const data = Buffer.from(JSON.stringify(index))
  await ipfs.files.write('/friends/index.json', data, {
    create: true,
    parents: true,
    truncate: true
  })
}
