"use strict"

module.exports = function Tracker(zite, node) {
  const self = this

  self.isAvailable = node.trackers.servers && !!node.trackers.servers.length
  self.tracker = false
  self.start = cb => {
    if (self.tracker) return cb() //already on
    self.tracker = node.trackers.create(zite.address)
    cb()
  }
  self.stop = cb => {
    if (!self.tracker) return cb(new Error("Not running"))
    node.trackers.rm(self.tracker)
    cb()
  }
  self.discover = cb => {
    if (!self.tracker) return cb(new Error("Not running"))
    self.tracker.update()
    self.tracker.once("update", () => process.nextTick(cb))
  }
}
