module.exports = function help () {
  const out = `
  Use the following commands to share files with your friends:

  add  <Peer ID> <Name>  add a friend
  dump <Name/Peer ID>    remove a friend
  exit                   exit IPFS friends (also ctrl+c)
  help                   print this help message
  ls                     list your friends
  share <CID> <Name>     ask friends to share the passed CID by the given name
  version                print the version number of this tool
  `
  return { out }
}
