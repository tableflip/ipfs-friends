import test from 'ava'
import startIpfsDaemon from 'start-ipfs-daemon'
import Os from 'os'
import Path from 'path'
import { promisify } from 'util'
import rimraf from 'rimraf'
import IpfsApi from 'ipfs-api'
import FriendDaemon from '../lib/friends'
import { waitForPeer } from './helpers/pubsub'
import { connect } from './helpers/swarm'

const tmpRepoPath = () => Path.join(Os.tmpdir(), `ipfs-${Math.random()}`)

const tmpConfig = (() => {
  let port = 30138
  return () => ({
    Addresses: {
      Swarm: [
        `/ip4/0.0.0.0/tcp/${port++}`,
        `/ip4/127.0.0.1/tcp/${port++}/ws`
      ],
      API: `/ip4/127.0.0.1/tcp/${port++}`,
      Gateway: `/ip4/127.0.0.1/tcp/${port++}`
    }
  })
})()

test.beforeEach(async t => {
  const repoPaths = [tmpRepoPath(), tmpRepoPath()]

  const ipfsDaemons = await Promise.all(repoPaths.map(p => {
    return startIpfsDaemon({
      ipfsPath: p,
      config: tmpConfig(),
      args: ['--enable-pubsub-experiment']
    })
  }))

  const nodes = ipfsDaemons.map(d => new IpfsApi(d.config.Addresses.API))

  const friendDaemons = await Promise.all(nodes.map(node => {
    return new FriendDaemon(node).start()
  }))

  t.context.nodes = nodes
  t.context.repoPaths = repoPaths
  t.context.friendDaemons = friendDaemons
})

test('should emit when friend goes offline', async t => {
  const [ nodeA, nodeB ] = t.context.nodes
  const [ fdA, fdB ] = t.context.friendDaemons
  const [ idA, idB ] = await Promise.all(t.context.nodes.map(n => n.id()))

  await Promise.all([connect(nodeA, nodeB), connect(nodeB, nodeA)])

  await fdA.add(idB.id, 'B')

  await waitForPeer(nodeB, idB.id, idA.id)

  await new Promise((resolve, reject) => {
    fdA.on('message:offline', ({ peerId, peerName }) => {
      if (peerId === idB.id) resolve()
    })

    fdB.stop().catch(reject)
  })

  t.pass()
})

test('should emit when friend goes online', async t => {
  const [ nodeA, nodeB ] = t.context.nodes
  const [ fdA, fdB ] = t.context.friendDaemons
  const [ idA, idB ] = await Promise.all(t.context.nodes.map(n => n.id()))

  await Promise.all([connect(nodeA, nodeB), connect(nodeB, nodeA)])

  await fdA.add(idB.id, 'B')

  await waitForPeer(nodeB, idB.id, idA.id)

  await new Promise(async (resolve, reject) => {
    fdA.on('message:online', ({ peerId, peerName }) => {
      if (peerId === idB.id) resolve()
    })

    try {
      await fdB.stop()
      await fdB.start()
    } catch (err) {
      reject(err)
    }
  })

  t.pass()
})

test.afterEach(async t => {
  await Promise.all(t.context.friendDaemons.map(f => {
    if (f.state() === 'started') f.stop()
  }))
  await Promise.all(t.context.nodes.map(n => n.stop()))
  await Promise.all(t.context.repoPaths.map(p => promisify(rimraf)(p)))
})
