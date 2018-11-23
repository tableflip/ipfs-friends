const cols = require('pretty-columns')
const Chalk = require('chalk')
/*
list out your /friends/index.json
*/
module.exports = async function ls (ctx) {
  const { friendDaemon } = ctx
  const list = friendDaemon.ls()

  if (!Object.keys(list).length) {
    return {
      out: `No friends yet 😢, use ${Chalk.bold('add <PeerID> <Name>')} to add some friends!`
    }
  }

  const out = cols(Object.entries(list))._STATS.formated
  return { out }
}
