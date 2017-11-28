/* eslint-env mocha */

'use strict'

const util = require('./util')

const Client = require('../src')

describe('rpc', () => {
  it('can send ping', cb => {
    let [client, server] = util.Duplex()
    /* server = */Client(server, {
      ping: (data, cb) => cb(null, {body: 'Pong!'})
    }, true)
    client = Client(client, {})
    client.request('ping', {}, cb)
  })

  it('can send pings', cb => {
    let [client, server] = util.Duplex()
    /* server = */Client(server, {
      ping: (data, cb) => cb(null, {body: 'Pong!'})
    }, true)
    client = Client(client, {})
    client.request('ping', {}, err => {
      if (err) return cb(err)
      client.request('ping', {}, cb)
    })
  })

  it('can disconnect properly', cb => {
    let [client, server] = util.Duplex()
    server = Client(server, {
      ping: (data, cb) => cb(null, {body: 'Pong!'})
    }, true)
    client = Client(client, {})
    client.request('ping', {}, err => {
      if (err) return cb(err)
      client.disconnect()
      server.once('end', () => cb())
    })
  })
})
