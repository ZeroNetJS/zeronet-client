# zeronet-client

ZeroNet Protocol Client

# Example
```js
'use strict'

const Client = require('zeronet-client')
const TCP = require('libp2p-tcp')
const multiaddr = require('multiaddr')

const server = TCP.createListener()

const handlers = { // usually this object is autogenerated by zeronet-protocol
  ping: (data, cb) => cb(null, {body: 'Pong!'})
}

server.on('connection', conn => Client(conn, handlers, true))

const addr = multiaddr('/ip4/127.0.0.1/tcp/1234')

server.listen(addr)

server.once('listening', () => {
  const client = Client(TCP.dial(addr))

  client.request('ping', {}, (err, data) => {
    if (err) throw err
    if (data) console.log('Got ping back: %s', data.body)
  }, true) // isServer
})
```

# API

`Client(conn, handlers, isServer)`: Wraps an interface-connection stream instance into a client.
  Returns: ZeroNetClient
