const Commands = require('./commands')

exports.withAutoComplete = fn => {
  const autoComplete = s => s.includes(' ') ? [] : Object.keys(Commands)
  return function fnWithAutoComplete (ctx) {
    ctx.autoComplete = autoComplete
    return fn.apply(this, arguments)
  }
}
