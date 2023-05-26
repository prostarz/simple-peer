// run in a browser, with:
//   beefy perf/send.js

import Peer from 'simple-peer'
import stream from 'readable-stream'

const buf = Buffer.alloc(10000)

const endless = new stream.Readable({
  read: function () {
    this.push(buf)
  }
})

let peer

const socket = new window.WebSocket('ws://localhost:8080')

socket.addEventListener('message', onMessage)

function onMessage (event) {
  const message = event.data
  if (message === 'ready') {
    if (peer) return
    peer = new Peer({ initiator: true })
    peer.on('signal', function (signal) {
      socket.send(JSON.stringify(signal))
    })
    peer.on('connect', function () {
      endless.pipe(peer)
    })
  } else {
    peer.signal(JSON.parse(message))
  }
}
