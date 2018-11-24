const log = require('debug')('ipfs-friends:lib-friends')
const CID = require('cids')
const EventEmitter = require('events')

class FriendDaemon extends EventEmitter {
  constructor (ipfs) {
    super()
    this._ipfs = ipfs
    // { peerId: 'alan' }
    this._index = null
  }

  async start () {
    const ipfs = this._ipfs
    const { id } = await ipfs.id()
    const index = await readFriends(ipfs)
    this.peerId = id
    this._index = index
    const peerIds = Object.keys(index)
    await Promise.all(peerIds.map(peerId => {
      return ipfs.pubsub.subscribe(peerId, this.onMessage.bind(this))
    }))
    this.publish({ action: 'online' })
  }

  async onMessage (msg) {
    const peerId = msg.topicIDs[0]
    if (msg.from !== peerId) {
      return log('Bad message!', msg)
    }

    let res

    try {
      res = JSON.parse(msg.data)
    } catch (err) {
      return log('failed to parse message', err)
    }

    const { action, payload } = res

    if (action === 'share') {
      await this._ipfs.pin.add(payload)
      this.emit('message:share', { peerId, peerName: this._index[peerId], cid: payload.cid, shareName: payload.shareName })
    } else if (action === 'online') {
      this.emit('message:online', { peerId, peerName: this._index[peerId] })
    } else if (action === 'offline') {
      this.emit('message:offline', { peerId, peerName: this._index[peerId] })
    }
  }

  async add (peerId, name) {
    if (!name || !peerId) throw new Error('missing name or peerId')
    validateCid(peerId)
    this._index[peerId] = name
    await writeFriends(this._ipfs, this._index)
    await this._ipfs.pubsub.subscribe(peerId, this.onMessage)
  }

  ls () {
    return JSON.parse(JSON.stringify(this._index))
  }

  async dump (peerIdOrName) {
    const index = this._index
    let friendPeerId
    const friend = index[peerIdOrName] || Object.entries(index).find(row => row[1] === peerIdOrName)
    if (!friend) throw new Error('no such friend!')
    if (index[peerIdOrName]) {
      friendPeerId = peerIdOrName
      delete index[peerIdOrName]
    } else {
      Object.keys(index).forEach(k => {
        if (index[k] === peerIdOrName) {
          friendPeerId = k
          delete index[k]
        }
      })
    }
    await writeFriends(this._ipfs, index)
    this._ipfs.pubsub.unsubscribe(friendPeerId, this.onMessage)
    this._index = index
  }

  async share (cid, shareName) {
    if (!cid || !shareName) throw new Error('cid and name arguments are required')
    validateCid(cid)
    await this.publish({ action: 'share', payload: { cid, shareName } })
    return `https://share.ipfs.io/#/${cid}`
  }

  async publish (msg) {
    const { peerId, _ipfs: ipfs } = this
    return ipfs.pubsub.publish(peerId, Buffer.from(JSON.stringify(msg)))
      .catch(err => log(`failed to publish ${msg.action} message`, err))
  }

  async stop () {
    const peerIds = Object.keys(this._index)
    // Unsubscribe from all our friends
    try {
      await Promise.all(peerIds.map(peerId => {
        return this._ipfs.pubsub.unsubscribe(peerId, this.onMessage)
      }))
    } catch (err) {
      log('failed to unsubscribe from all the peerIds', err)
    }

    this._index = null

    try {
      await this.publish({ action: 'offline' })
    } catch (err) {
      log('failed to publish offline message', err)
    }

    this.peerId = null
    this._ipfs = null
  }
}

module.exports = FriendDaemon

function validateCid (str) {
  try {
    new CID(str) // eslint-disable-line
  } catch (err) {
    log(err)
    throw new Error(`invalid peerId ${str}`)
  }
}

async function readFriends (ipfs) {
  try {
    const index = await ipfs.files.read('/friends/index.json')
    return JSON.parse(index)
  } catch (err) {
    console.log(err)
    log(err)
    return {}
  }
}

async function writeFriends (ipfs, index) {
  const data = Buffer.from(JSON.stringify(index))
  await ipfs.files.write('/friends/index.json', data, {
    create: true,
    parents: true,
    truncate: true
  })
}
