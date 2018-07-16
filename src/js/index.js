var IPFS = require('ipfs-api')
var Web3 = require('web3');
var web3 = new Web3();
var contract = require("truffle-contract")
var store_json = require("../../build/contracts/Store.json")

// find contract address from ganache
var deployed_contract = "0x638bcfe43314b74239bdbe3441f71cab920783e2"

// init ipfs node
var ipfs = IPFS()

// work needed to properly init web3, below doesn't work
//if (typeof web3 !== 'undefined') {
//  console.log('im in a')
//  window.web3 = new Web3(web3.currentProvider)
//} else {
//  console.log('im in b')
// set the provider you want from Web3.providers
//  window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
//  console.log(window.web3)
//  console.log(window.web3.currentProvider)
//}

// workaround for above
window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

// need to do user defined account
window.web3.eth.defaultAccount = window.web3.eth.accounts[0];


// init contract (truffle abstraction_
window.Store = contract(store_json)
Store.setProvider(window.web3.currentProvider)

function store () {
  // get string from 'source'
  var toStore = document.getElementById('source').value
  
  // given a buffer instance or stream or array of path + content objects
  // res is an array of {path, hash, size} objects
  ipfs.add(Buffer.from(toStore), function (err, res) {
    if (err || !res) {
      return console.error('ipfs add error', err, res)
    }

    res.forEach(function (file) {
      if (file && file.hash) {
        console.log('adding to smart contract')
        Store.at(deployed_contract).then(function(inst) {
            return inst.sendItem(file.hash)}).then(i => console.log(i))
        console.log('successfully stored', file.hash)
        display(file.hash)
      }
    })
  })
}

function display (hash) {
  // buffer: true results in the returned result being a buffer rather than a stream
  ipfs.cat(hash, {buffer: true}, function (err, res) {
    if (err || !res) {
      return console.error('ipfs cat error', err, res)
    }

    document.getElementById('hash').innerText = hash
    document.getElementById('content').innerText = res.toString()
  })
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('store').onclick = store
})
