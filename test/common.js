import get from 'simple-get'
import thunky from 'thunky'
import bowser from 'bowser'
import _wrtc from 'wrtc'

export const getConfig = thunky(function (cb) {
  // Includes TURN -- needed for tests to pass on Sauce Labs
  // https://github.com/feross/simple-peer/issues/41
  // WARNING: This is *NOT* a public endpoint. Do not depend on it in your app.
  get.concat('https://instant.io/__rtcConfig__', function (err, res, data) {
    if (err) return cb(err)
    data = data.toString()
    try {
      data = JSON.parse(data)
    } catch (err) {
      cb(err)
      return
    }
    cb(null, data)
  })
})

// For testing on node, we must provide a WebRTC implementation
export const wrtc = _wrtc?.nonstandard && _wrtc
// create a test MediaStream with two tracks
let canvas
export function getMediaStream () {
  if (_wrtc?.nonstandard) {
    const source = new _wrtc.nonstandard.RTCVideoSource()
    const tracks = [source.createTrack(), source.createTrack()]
    return new _wrtc.MediaStream(tracks)
  } else {
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.width = canvas.height = 100
      canvas.getContext('2d') // initialize canvas
    }
    const stream = canvas.captureStream(30)
    stream.addTrack(stream.getTracks()[0].clone()) // should have 2 tracks
    return stream
  }
}

export function isBrowser (name) {
  if (typeof (window) === 'undefined') return false
  const satifyObject = {}
  if (name === 'ios') { // bowser can't directly name iOS Safari
    satifyObject.mobile = { safari: '>=0' }
  } else {
    satifyObject[name] = '>=0'
  }
  return bowser.getParser(window.navigator.userAgent).satisfies(satifyObject)
}

export default {
  isBrowser,
  getMediaStream,
  getConfig,
  wrtc: _wrtc?.nonstandard && _wrtc
}
