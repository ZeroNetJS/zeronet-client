/* eslint-env mocha */

'use strict'

const util = require('./util')

const Client = require('../src')

it('can send pings', cb => {
  let [client, server] = util.Duplex()
  /* server = */Client(server, {
    ping: (data, cb) => cb(null, {body: 'Pong!'})
  }, true)
  client = Client(client, {})
  client.request('ping', {}, cb)
})
