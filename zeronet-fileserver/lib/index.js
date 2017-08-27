"use strict"

const pack = require("zeronet-protocol/lib/zero/pack")
const debug = require("debug")
const log = debug("zeronet:fileserver")

/*
opt_def
in/out ->
  protobuf:
    (int)position:
      type, name
  strict:
    (str,fnc,Array(str,fnc))propname:
      //validator function or typeof string. one or more per def must match
*/

module.exports = function FileServer(protocol, zeronet) {
  protocol.handle("ping", { in: {
      protobuf: {},
      strict: {}
    },
    out: {
      protobuf: {
        "1": [
          "string",
          "body"
        ]
      },
      strict: {
        "body": [
          b => b == "Pong!"
        ]
      }
    }
  }, (data, cb) => cb(null, {
    body: "pong"
  }))

  protocol.handle("getFile", { in: {
      protobuf: {
        "1": [
          "string",
          "site"
        ],
        "2": [
          "string",
          "inner_path"
        ],
        "3": [
          "int64",
          "location"
        ]
      },
      strict: {
        site: "string",
        inner_path: "string",
        location: "number"
      }
    },
    out: {
      protobuf: {
        "1": [
          "int64",
          "size"
        ],
        "2": [
          "int64",
          "location"
        ],
        "3": [
          "bytes",
          "body"
        ]
      },
      strict: {
        size: "number",
        location: "number",
        body: Buffer.isBuffer
      }
    }
  }, (data, cb) => {
    if (!zeronet.zites[data.site]) return cb(new Error("Unknown site"))
    cb("Hello. This ZeroNetJS client does not have this function implented yet. Please kindly ignore this peer.")
    //TODO: finish
  })
}

//TODO: rewrite
function Defaults(protocol, zeronet) {
  protocol.handleZN("getFile", {
    site: "string",
    inner_path: "string",
    location: "number"
  }, {
    size: "number",
    location: "number",
    body: Buffer.isBuffer
  }, (data, cb) => {
    if (!zeronet.zites[data.site]) return cb(new Error("Unknown site"))
    cb("Hello. This ZeroNetJS client does not have this function implented yet. Please kindly ignore this peer.")
    //TODO: finish
  })

  protocol.handleZN("ping", {}, {
    body: b => b == "pong"
  }, (data, cb) => {
    cb(null, {
      body: "pong"
    })
  })

  protocol.handleZN("pex", {
    site: "string",
    peers: Array.isArray,
    peers_onion: d => !d || Array.isArray(d),
    need: "number"
  }, {
    peers: Array.isArray
  }, (data, cb) => {
    if (data.peers) { //parse peers. ignore len!=6, but i think it's an encoding error instead
      let unpack = data.peers.map(p => {
        try {
          return pack.v4.unpack(p)
        } catch (e) {
          return
        }
      }).filter(v => !!v)
      log("got peers for", data.site, unpack.join(", ") || "<none>")
      zeronet.peerPool.addMany(unpack, data.site)
    }
    cb("Hello. This ZeroNetJS client does not have this function implented yet. Please kindly ignore this peer.")
    //TODO: parse onion peers
  })

  protocol.handleZN("update", {
    site: "string",
    inner_path: "string",
    body: "string"
  }, {
    ok: "string"
  }, (data, cb) => {
    if (!zeronet.zites[data.site]) return cb(new Error("Unknown site"))
    cb("Hello. This ZeroNetJS client does not have this function implented yet. Please kindly ignore this peer.")
    //TODO: finish
  })

  protocol.handleZN("listModified", {
    site: "string",
    since: "number"
  }, {
    modified_files: "object"
  }, (data, cb) => {
    if (!zeronet.zites[data.site]) return cb(new Error("Unknown site"))
    cb("Hello. This ZeroNetJS client does not have this function implented yet. Please kindly ignore this peer.")
    //TODO: finish
  })

  protocol.handleZN("getHashfield", {
    site: "string"
  }, {
    hashfiled_raw: "object"
  }, (data, cb) => {
    if (!zeronet.zites[data.site]) return cb(new Error("Unknown site"))
    cb("Hello. This ZeroNetJS client does not have this function implented yet. Please kindly ignore this peer.")
    //TODO: finish
  })

  protocol.handleZN("setHashfield", {
    site: "string",
    hashfield_raw: "object"
  }, {
    ok: "object"
  }, (data, cb) => {
    if (!zeronet.zites[data.site]) return cb(new Error("Unknown site"))
    cb("Hello. This ZeroNetJS client does not have this function implented yet. Please kindly ignore this peer.")
    //TODO: finish
  })

  protocol.handleZN("findHashIds", {
    site: "string",
    hash_ids: Array.isArray //with numbers
  }, {
    peers: "object",
    peers_onion: "object"
  }, (data, cb) => {
    if (!zeronet.zites[data.site]) return cb(new Error("Unknown site"))
    cb("Hello. This ZeroNetJS client does not have this function implented yet. Please kindly ignore this peer.")
    //TODO: finish
  })
}
