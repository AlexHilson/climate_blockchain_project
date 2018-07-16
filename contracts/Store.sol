pragma solidity ^0.4.17;
contract Store {
 string item;
 
 function sendItem(string newItem) public {
   item = newItem;
 }

 function getItem() public view returns (string storedItem) {
   return item;
 }
}
