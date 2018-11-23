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
    ipfs.pubsub.publish(id, Buffer.from(JSON.stringify({ action: 'online' })))
      .catch(err => log('failed to publish online message', err))
  }

  async onMessage (msg) {
    const peerId = msg.topicIDs[0]
    if (msg.from !== peerId) {
      return log('Bad message!', msg)
    }

    if (peerId === this.peerId) {
      return log('ignoring own message', msg)
    }

    let res

    try {
      res = JSON.parse(msg.data)
    } catch (err) {
      return log('failed to parse message', err)
    }

    const { action, payload } = res

    if (action === 'share') {
      try {
        await this._ipfs.pin.add(payload.cid)
      } catch (err) {
        return log(`failed to pin ${payload.cid}`, err)
      }

      try {
        const msg = Buffer.from(JSON.stringify({
          action: 'shared',
          payload: { cid: payload.cid, shareName: payload.shareName }
        }))

        await this._ipfs.pubsub.publish(this.peerId, msg)
      } catch (err) {
        return log(`failed publish shared message ${payload.cid}`, err)
      }

      this.emit('message:share', {
        peerId,
        peerName: this._index[peerId],
        cid: payload.cid,
        shareName: payload.shareName
      })
    } else if (action === 'shared') {
      this.emit('message:shared', {
        peerId,
        peerName: this._index[peerId],
        cid: payload.cid,
        shareName: payload.shareName
      })
    } else if (action === 'online') {
      this.emit('message:online', { peerId, peerName: this._index[peerId] })
    } else if (action === 'offline') {
      this.emit('message:offline', { peerId, peerName: this._index[peerId] })
    }
  }

  async add (peerId, name) {
    if (!peerId) throw new Error('missing friend peer ID')

    try {
      new CID(peerId) // eslint-disable-line
    } catch (err) {
      log(err)
      throw new Error(`invalid peer ID ${peerId}`)
    }

    if (!name) throw new Error('missing friend name')

    if (Object.keys(this._index).includes(peerId)) {
      await this.dump(peerId)
    }

    this._index[peerId] = name
    await writeFriends(this._ipfs, this._index)
    await this._ipfs.pubsub.subscribe(peerId, this.onMessage)
  }

  async share (cid, name) {
    if (!cid) throw new Error('missing share CID')

    try {
      new CID(cid) // eslint-disable-line
    } catch (err) {
      log(err)
      throw new Error(`invalid CID ${cid}`)
    }

    if (!name) throw new Error('missing share name')

    const msg = Buffer.from(JSON.stringify({
      action: 'share',
      payload: { cid, shareName: name }
    }))

    await this._ipfs.pubsub.publish(this.peerId, msg)
  }

  ls () {
    return JSON.parse(JSON.stringify(this._index))
  }

  async dump (peerIdOrName) {
    if (!peerIdOrName) throw new Error('missing friend peer ID or name')

    const index = this._index
    let peerId

    if (Object.keys(index).includes(peerIdOrName)) {
      peerId = peerIdOrName
    } else if (Object.values(index).includes(peerIdOrName)) {
      for (peerId of Object.keys(index)) {
        if (index[peerId] === peerIdOrName) break
      }
    } else {
      throw new Error('no such friend!')
    }

    delete index[peerId]
    await writeFriends(this._ipfs, index)
    await this._ipfs.pubsub.unsubscribe(peerId, this.onMessage)
    this._index = index
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
      await this._ipfs.pubsub.publish(this.peerId, Buffer.from(JSON.stringify({ action: 'offline' })))
    } catch (err) {
      log('failed to publish offline message', err)
    }

    this.peerId = null
    this._ipfs = null
  }
}

module.exports = FriendDaemon

async function readFriends (ipfs) {
  try {
    const index = await ipfs.files.read('/friends/index.json')
    return JSON.parse(index)
  } catch (err) {
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