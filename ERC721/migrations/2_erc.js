const ERC = artifacts.require("CustomERC721");

module.exports = function (deployer) {
  deployer.deploy(ERC);
};
