module.exports = function help () {
  const out = `
  Use the following commands to share files with your friends:

  add  <Peer ID> <Name>     add a friend
  config get [Key]          get all config or get a specifc config value for given key
  config set <Key> <Value>  set a config key to the given value
  dump <Name/Peer ID>       remove a friend
  exit                      exit IPFS friends (also ctrl+c)
  help                      print this help message
  ls                        list your friends
  share <CID> <Name>        ask friends to share the passed CID by the given name
  version                   print the version number of this tool
  `
  return { out }
}
