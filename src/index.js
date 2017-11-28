'use strict'

const debug = require('debug')
const log = debug('zeronet:client')
const Pushable = require('pull-pushable')
const pull = require('pull-stream')
const msgpack = require('./stream/msgpack')
const EE = require('events').EventEmitter

/*

  Crash course zeronet protocol:
    request:
      {
        cmd: command to execute,
        req_id: an id unique for req/res,
        params: object containing args for request
      }
    response:
      {
        cmd: "response", // this one is special
        to: req_id,
        ... // just drop other response parameters here
      }

*/

class ZeroNetClient extends EE {
  constructor (handlers, isServer) {
    super()
    this.source = Pushable()
    this.sink = this.sink.bind(this)
    this.handlers = handlers
    this.queue = {}
    this.req_id = 1
    this.isServer = isServer || false
    this.addr = '(unknown ' + (isServer ? 'client' : 'server') + ')'
    log('creating isServer=%s', this.isServer)
  }

  // basics
  write (data) {
    if (this.end) return this.end
    this.source.push(data)
  }
  disconnect (reason) {
    if (this.end) throw new Error('Already disconnected')
    if (reason === true) reason = null
    if (reason instanceof Error) reason = reason.toString()
    if (reason) {
      log('[%s/DISCONNECT]: error "%s"', this.addr, reason)
      reason = new Error('Disconnect: ' + reason)
      this.end = reason
    } else {
      log('[%s/DISCONNECT]: normal disconnect', this.addr)
      this.end = true
    }
    for (const id in this.queue) {
      this.queue[id].cb(reason || new Error('Disconnected during execution'))
    }
    this.queue = null
    this.source.end()
    this.emit('end', reason || true)
  }

  // protocol
  getReqId () {
    return this.req_id++
  }
  request (cmd, params, cb) {
    if (typeof cb !== 'function') throw new Error('CB not a function')
    const req_id = this.getReqId() // eslint-disable-line camelcase
    log('[%s/REQUEST]: SEND CMD %s ID %s', this.addr, cmd, req_id)
    this.queue[req_id] = {cb, cmd}
    this.write({req_id, cmd, params})
  }
  _doResponse (to, err, data) {
    const cmd = 'response'
    if (err) {
      log('[%s/RESPONSE]: SEND ID %s SUCCESS false', this.addr, to)
      if (typeof err !== 'string') err = err.toString().split('\n').shift()
      return this.write({cmd, to, error: err})
    } else {
      log('[%s/RESPONSE]: SEND ID %s SUCCESS true', this.addr, to)
      data.to = to
      data.cmd = cmd
      return this.write(data)
    }
  }

  // handler
  sink (read) {
    const next = (err, data) => {
      if (err) return this.disconnect(err)
      const errMalformed = (r) => {
        this.disconnect(r || 'Malformed data')
        return read(true)
      }
      if (typeof data !== 'object' || data == null || !data.cmd || typeof data.cmd !== 'string') return errMalformed()
      if (data.cmd === 'response') { // handle a response
        if (typeof data.to !== 'number') return errMalformed()
        if (this.queue[data.to]) {
          log('[%s/RESPONSE]: GET ID %s SUCCESS %s', this.addr, data.to, !data.error)
          const {cb, cmd} = this.queue[data.to]
          delete this.queue[data.to]
          if (data.error) { // if the response has en error create a fancy error
            const err = new Error((data.error.startsWith('Error: ') ? '' : 'Error: ') + data.error)
            err.stack = (data.error.startsWith('Error: ') ? '' : 'Error: ') + data.error +
              '\n    at PeerCmd(' + cmd + ')' +
              '\n    at Peer(' + this.addr + ')' +
              '\n    at ZeroNet Protocol'
            cb(err)
          } else { // handle a normal response (create new data object wihtout 'to' and 'cmd')
            let cleanData = {}
            for (const p in data) {
              if (p !== 'to' && p !== 'cmd') cleanData[p] = data[p] // eslint-disable-line max-depth
            }
            cb(null, cleanData)
          }
        } else return errMalformed('No such request ' + data.to) // if there is no such request this is a protocol error. bye!
      } else { // handle a request
        if (typeof data.req_id !== 'number') return errMalformed()
        if (typeof data.params !== 'object' || data.params == null) return errMalformed()
        log('[%s/REQUEST]: GET CMD %s ID %s', this.addr, data.cmd, data.req_id)
        if (this.handlers[data.cmd]) { // we have that command
          this.handlers[data.cmd](data.params, this._doResponse.bind(this, data.req_id))
        } else { // we don't have that command.
          this.write({cmd: 'response', to: data.req_id, error: 'Invalid command'})
        }
      }
      read(Boolean(this.end), next)
    }

    read(null, next)
  }
}

module.exports = (conn, handlers, isServer) => {
  const client = new ZeroNetClient(handlers, isServer)

  conn.getObservedAddrs((err, addrs) => {
    if (err) return
    client.addr = (client.isServer ? 'client' : 'server') + ': ' + addrs.map(a => a.toString()).join(', ')
  })

  pull(
    conn,
    (client.unpack = msgpack.unpack()),
    client,
    msgpack.pack(),
    conn
  )

  return client
}

module.exports.Client = ZeroNetClient
