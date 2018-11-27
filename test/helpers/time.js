export async function waitFor (test, options) {
  options = options || {}
  options.timeout = options.timeout || 30000
  options.message = options.message || 'timed out waiting for operation to succeed'

  const end = Date.now() + options.timeout

  while (true) {
    const done = await test()
    if (done) return
    if (Date.now() > end) throw new Error(options.message)
  }
}
