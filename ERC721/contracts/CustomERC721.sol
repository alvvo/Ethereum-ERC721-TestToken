pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestToken is ERC721 {
    
    address _owner;

    mapping (uint256 => uint256) public _offeredForSale;

    constructor() ERC721("Test Token", "TST") {
        _owner = msg.sender;
    }

    function mintProtect(address to, uint256 tokenId, string memory tokenURI) public {
        require(_owner = msg.sender, "Not owner");
        _mint(to,tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function sellToken(uint256 tokenId, uint256 price) public{
        require(_exists(tokenId), "Not exists");
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(_offeredForSale[tokenId] == 0, "On offer");
        require(price > 0, "Low price");

        _offeredForSale[tokenId] = price;
    }

    function buyToken(uint256 tokenId) public payable{
        require(msg.value > _offeredForSale[tokenId], "Low value");
        require(_exists(tokenId), "Not exists");
        require(_offeredForSale[tokenId] != 0, "Not on offer");

        address seller = ownerOf(tokenId);
        delete _offeredForSale[tokenId];
        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(msg.value);
    }

    function onSale(uint256 tokenId) public view returns (bool) {
        return _offeredForSale[tokenId] != 0;
    }
}