// Modified version of https://github.com/alligator-io/pull-msgpack/blob/master/index.js

'use strict'

const msgpack = require('msgpack5')({
  compatibilityMode: true
})
const Pushable = require('pull-pushable')
const bl = require('bl')

module.exports.pack = function () {
  var ended = false

  return function (read) {
    return function (abort, callback) {
      if (abort) return read(abort, callback)

      if (ended) {
        return callback(ended)
      }

      read(abort, function next (end, c) {
        if (end) {
          ended = end
          return callback(end)
        }

        try {
          callback(null, msgpack.encode(c))
        } catch (err) {
          ended = err
        }

        if (!ended) read(null, next)
      })
    }
  }
}

module.exports.unpack = function () {
  let chunks = bl()
  const push = Pushable()
  return {
    source: push,
    sink: read => {
      const next = (err, data) => {
        if (err) return push.end(err)
        if (data) chunks.append(data)

        function d () {
          try {
            var result = msgpack.decode(chunks)
            return [null, result]
          } catch (err) {
            if (err instanceof msgpack.IncompleteBufferError) {
              return []
            } else {
              return []
            }
          }
        }

        while (true) {
          const [err, res] = d()
          if (err) {
            push.end(err)
            return read(true)
          }
          if (res) {
            push.push(res)
          } else return read(null, next)
        }
      }

      read(null, next)
    },
    getChunks: () => chunks // allows us to access unconsumed data
  }
}
