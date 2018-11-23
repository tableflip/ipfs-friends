module.exports = async function loop (fun) {
  while (true) { await fun() }
}
