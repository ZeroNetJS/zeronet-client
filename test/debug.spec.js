/* eslint-env mocha */

'use strict'

const util = require('./util')

const Client = require('../src')

const state = process.env.DEBUG_PACKETS

describe('debug', () => {
  before(() => (process.env.DEBUG_PACKETS = 1))

  it('see if it does not crash', cb => {
    let [client, server] = util.Duplex()
    /* server = */Client(server, {
      ping: (data, cb) => cb(null, {body: 'Pong!'})
    }, true)
    client = Client(client, {})
    client.request('ping', {}, cb)
  })

  after(() => (process.env.DEBUG_PACKETS = state || ''))
})
