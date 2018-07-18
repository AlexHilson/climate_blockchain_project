pragma solidity ^0.4.17;
contract LinkedStore {
 string[] public hashes;
 
 function sendItem(string newItem) public {
   hashes.push(newItem);
 }

}
