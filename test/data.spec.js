/* eslint-env mocha */

'use strict'

const _Duplex = require('pull-pair/duplex')
const Connection = require('interface-connection').Connection
const multiaddr = require('multiaddr')
const Duplex = () => {
  const d = _Duplex()
  let isc = 1 // is client
  return d.map(d => {
    return new Connection(d, {
      getObservedAddrs: isc-- ? (cb) => cb(null, [multiaddr('/ip4/127.0.0.1/tcp/15544')]) : (cb) => cb(null, [multiaddr('/ip4/127.0.0.1/tcp/36778')])
    })
  })
}

const Client = require('../src')

it('can send pings', cb => {
  let [client, server] = Duplex()
  server = Client(server, {
    ping: (data, cb) => cb(null, {body: 'Pong!'})
  }, true)
  client = Client(client, {})
  client.request('ping', {}, cb)
})
