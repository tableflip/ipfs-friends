const { readFriends } = require('../lib/friends')
const cols = require('pretty-columns')
/*
list out your /friends/index.json
*/
module.exports = async function ls (ctx) {
  const { ipfs } = ctx
  const index = await readFriends(ipfs)
  const out = cols(Object.entries(index)).output()
  return { out }
}
