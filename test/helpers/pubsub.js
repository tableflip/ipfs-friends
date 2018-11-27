import { waitFor } from './time'

export function waitForPeer (ipfs, topic, peerId, options) {
  return waitFor(async () => {
    const peers = await ipfs.pubsub.peers(topic)
    return peers.includes(peerId)
  })
}
