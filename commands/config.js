const Fs = require('fs')
const Path = require('path')
const { promisify } = require('util')
const Os = require('os')
const log = require('debug')('ipfs-friends:config')
const explain = require('explain-error')

const readFile = promisify(Fs.readFile)
const writeFile = promisify(Fs.writeFile)
const DEFAULT_CONFIG_PATH = Path.join(Os.homedir(), '.ipfs-friends')

const SubCommands = {
  async set (ctx, key, value) {
    log('set', key, value)

    const config = await readConfig(ctx.configPath)
    config[key] = value

    await writeConfig(config, ctx.configPath)

    if (ctx.onConfigUpdate) {
      return { ctx: await ctx.onConfigUpdate(key, value) }
    }
  },

  async get (ctx, key) {
    log('get', key)
    const config = await readConfig(ctx.configPath)
    const value = key ? config[key] : config
    return { out: value }
  }
}

async function readConfig (path) {
  path = path || DEFAULT_CONFIG_PATH
  let config

  try {
    config = JSON.parse(await readFile(path))
  } catch (err) {
    log('failed to read config', err)
  }

  return config || {}
}

async function writeConfig (config, path) {
  path = path || DEFAULT_CONFIG_PATH
  try {
    await writeFile(path, JSON.stringify(config))
  } catch (err) {
    throw explain(err, 'failed to write config')
  }
}

module.exports = async function config (ctx, subCmd, ...args) {
  if (!SubCommands[subCmd]) throw new Error(`${subCmd}: subcommand not found`)
  return SubCommands[subCmd](ctx, ...args)
}
