const Disperse = artifacts.require("Disperse");
const Yeruslav = artifacts.require("Yeruslav");

module.exports = function(deployer, network) {
  deployer.deploy(Disperse);
  if (network == 'development')
    deployer.deploy(Yeruslav);
};
