pragma solidity ^0.4.17;
contract LinkedStore {
  address public owner = msg.sender;
 
  string[] public hashes;
  event NewHash(
    string _hash); 
 
  modifier onlyBy(address _account) {
    require(
      msg.sender == _account,
      "Sender not authorised"
    );
    _;
  }

  function sendItem(string _hash) public onlyBy(owner) { 
    hashes.push(_hash);
    emit NewHash(_hash);
  }
}
