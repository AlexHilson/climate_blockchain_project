const LinkedStore = artifacts.require("./LinkedStore.sol")

module.exports = function(deployer) {
    deployer.deploy(LinkedStore);
};
