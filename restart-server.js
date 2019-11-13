/*
  Restarts the web server if a new hash is published to the BCH blockchain.
*/

'use strict'

const shell = require('shelljs')
const kill = require('tree-kill')

// App specific libraries.
// const config = require('./config')
const BCH = require(`./src/lib/bch`)
const bch = new BCH()

// Edit the period below, which dictates how often this app checks
// the BCH blockchain for updates.
// The time is in milliseconds (ms). 60,000 ms = 1 minute
const PERIOD = 60000 * 2

// Used for debugging and iterrogating JS objects.
const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

// Start the IPFS blog web server. Restart it if a new hash is published to the
// BCH network.
let localStorage
let pid
// init local storage
if (typeof localStorage === 'undefined' || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage
  localStorage = new LocalStorage('./localStorage')
  localStorage.setItem('ipfsDownloading', false)
}

async function manageServer () {
  try {
    // Start the web server.
    const server = shell.exec('node index.js', { async: true })
    pid = server.pid
    // console.log(`server : ${util.inspect(server)}`)
    // console.log(`pid: ${server.pid}`)

    let serverInterval = setInterval(initServer, PERIOD)

    // Checking if IPFS is downloading new content
    setInterval(() => {
      if (serverInterval && localStorage.getItem('ipfsDownloading') === 'true') {
        console.log('Update Interval Stopped')
        console.log('Downloading new content')
        clearInterval(serverInterval)
        serverInterval = null
        // console.log(serverInterval)
      } else if (serverInterval === null && localStorage.getItem('ipfsDownloading') !== 'true') {
        console.log('IPFS Download finished..!')
        console.log('Resuming update interval')
        serverInterval = setInterval(initServer, PERIOD)
      }
    }, 1000)
  } catch (err) {
    console.error(err)
  }
}
manageServer()

// Promise based sleep function:
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function initServer () {
  console.log(`Checking for updates...`)
  // Check for updates. Will usually return false.
  const hash = await bch.checkForUpdates(pid)
  if (!hash) {
    console.log(`No updates found.`)
    console.log(` `)
  }

  // If a hash is returned, then restart the web server.
  if (hash) {
    console.log(`New content published with hash ${hash}`)
    console.log('Restarting server...')
    kill(pid)

    await sleep(5000)

    const server = shell.exec('node index.js', { async: true })
    pid = server.pid
  }
}
