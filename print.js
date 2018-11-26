const Chalk = require('chalk')
const log = require('debug')('ipfs-friends:print')

module.exports = async function print (func) {
  try {
    const res = await func()
    if (res && res.out) {
      if (Object.prototype.toString.call(res.out) === '[object String]') {
        console.log(res.out)
      } else {
        console.log(JSON.stringify(res.out, null, 2))
      }
    }
  } catch (err) {
    log(err)
    console.error(`${Chalk.red('✖')} ${err}`)
  }
}
