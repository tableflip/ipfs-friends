exports.withAutoComplete = fn => {
  return function fnWithAutoComplete (ctx) {
    const autoComplete = s => s.includes(' ') ? [] : Object.keys(ctx.commands)
    ctx.autoComplete = autoComplete
    return fn.apply(this, arguments)
  }
}
