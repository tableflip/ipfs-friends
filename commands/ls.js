const cols = require('pretty-columns')
/*
list out your /friends/index.json
*/
module.exports = async function ls (ctx) {
  const { friendDaemon } = ctx
  const out = cols(Object.entries(friendDaemon.ls())).output()
  return { out }
}
