/* eslint-env mocha */

'use strict'

const util = require('./util')

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const Client = require('../src')
const msgpack = require('../src/stream/msgpack')
const pull = require('pull-stream')

const equal = require('assert').deepEqual

const Pushable = require('pull-pushable')

describe('packet', () => {
  const reqPacket = {req_id: 1, cmd: 'ping', params: {}}
  const resPacket = {to: 1, cmd: 'response', body: 'Pong!'}
  const resInvalidPacket = {to: 1, cmd: 'response', error: 'Invalid command'}

  it('client sends the right request packet', cb => {
    let [client, server] = util.Duplex()
    pull(
      Pushable(),
      server,
      msgpack.unpack(),
      pull.collect((err, res) => {
        expect(err).to.not.exist()
        equal(res, [reqPacket])
        cb()
      })
    )
    client = Client(client, {})
    client.request('ping', {}, () => {})
    setTimeout(() => client.disconnect(), 10)
  })

  it('server sends the right result packet', cb => {
    let [client, server] = util.Duplex()
    server = Client(server, {
      ping: (data, cb) => cb(null, {body: 'Pong!'})
    }, true)
    let p
    pull(
      p = Pushable(),
      msgpack.pack(),
      client,
      msgpack.unpack(),
      pull.collect((err, res) => {
        expect(err).to.not.exist()
        equal(res, [resPacket])
        cb()
      })
    )
    p.push(reqPacket)
    setTimeout(() => server.disconnect(), 10)
  })

  it('server sends the right result packet (invalid command)', cb => {
    let [client, server] = util.Duplex()
    server = Client(server, {}, true)
    let p
    pull(
      p = Pushable(),
      msgpack.pack(),
      client,
      msgpack.unpack(),
      pull.collect((err, res) => {
        expect(err).to.not.exist()
        equal(res, [resInvalidPacket])
        cb()
      })
    )
    p.push(reqPacket)
    setTimeout(() => server.disconnect(), 10)
  })
})
