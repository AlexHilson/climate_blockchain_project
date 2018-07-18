var ipfsAPI = require('ipfs-api')

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink

var Web3 = require('web3');
var web3 = new Web3();
var contract = require("truffle-contract")
var store_json = require("../../build/contracts/Store.json")
var linked_store_json = require("../../build/contracts/LinkedStore.json")
var contract_addresses = require("../../contract_addresses.json")

// connect to local ipfs node
window.ipfs = ipfsAPI()
ipfs.version().then(i => console.log(i))
console.log(ipfs.dag)
console.log(ipfs.object)

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
window.Store.setProvider(window.web3.currentProvider)

window.LinkedStore = contract(linked_store_json)
window.LinkedStore.setProvider(window.web3.currentProvider)


var previousHash
var counter = 0

function store () {
  // get string from 'source'
  var toStore = document.getElementById('source').value
  const data = {data: toStore}
  ipfs.dag.put(data, { format: 'dag-pb', hashAlg: 'sha2-256' }).then(cid => {
    var links = [{name: 'data', multihash: cid.toBaseEncodedString(), size: 1}]
    if (typeof previousHash != 'undefined') {
      links.push({name: 'previous', multihash: previousHash, size: 1})
    }
    console.log('links:')
    console.log(links)
    ipfs.dag.put({data: 'links', links: links}, {format: 'dag-pb', hashAlg: 'sha2-256'}).then(cid => {
      previousHash = cid.toBaseEncodedString()
  
      LinkedStore.at(contract_addresses.LinkedStore).then(linkedStore => {
        linkedStore.sendItem(previousHash, { gas: 1000000 })
        counter++
        display3(counter)
      })
      display(previousHash)
    })
  }).catch(err => { throw err })
}

function display (hash) {
  // buffer: true results in the returned result being a buffer rather than a stream
  ipfs.object.get(hash).then(i => {
    document.getElementById('hash').innerText = hash
    //document.getElementById('content').innerText = i.links.toString()
  }).catch(err => { throw err })
}

function display2 () {
  var toDisplay = document.getElementById('hashSource').value
  ipfs.object.get(toDisplay).then(i => {
    document.getElementById('hash2').innerText = toDisplay
    document.getElementById('links').innerText = i.links.toString()
    document.getElementById('data').innerText = i.data.toString()
  }).catch(err => {throw err})
}

function display3 (count) {
  document.getElementById('contract').innerText = '';
  [...Array(count).keys()].forEach(function(i) {
    LinkedStore.at(contract_addresses.LinkedStore).then(linkedStore => {
      linkedStore.hashes.call(i).then(res => {
        document.getElementById('contract').innerText += i + ': ' + res + '\n'
      })
    })
  })
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('store').onclick = store
  document.getElementById('view').onclick = display2
})
