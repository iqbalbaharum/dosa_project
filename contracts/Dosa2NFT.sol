// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./ERC721.sol";
import "./ERC721Enumerable.sol";
import "./ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Dosa2NFT is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, ERC721Burnable {
    
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    address public royaltyReceiver;
    uint256 public royaltyFee;

    event Mint(address to, uint tokenId);
    event Sale(address from, address to, uint256 value);

    constructor(address _royaltyReceiver, uint _royaltyFee) ERC721("Dosa2NFT", "DOSA2NFT") {
      royaltyReceiver = _royaltyReceiver;
      royaltyFee = _royaltyFee;
    }

    function setRoyaltyReceiver(address _royaltyReceiver) public onlyOwner {
        royaltyReceiver = _royaltyReceiver;
    }

    function setRoyaltyFee(uint _royaltyFee) public onlyOwner {
        royaltyFee = _royaltyFee;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit Mint(to, tokenId);
    }

    function setTokenURI(uint _tokenId, string memory _uri) public onlyOwner {
        _setTokenURI(_tokenId, _uri);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        
        if (msg.sender != owner()) {
            if (msg.value > 0) {
                uint256 royalty = (msg.value * royaltyFee) / 100;
                _payRoyalty(royalty);

                (bool success2, ) = payable(from).call{value: msg.value - royalty}(
                    ""
                );
                require(success2);
            }

            emit Sale(from, to, msg.value);
        }

        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable override {
       
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public payable override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        if (msg.sender != owner()) {
            if (msg.value > 0) {
                uint256 royalty = (msg.value * royaltyFee) / 100;
                _payRoyalty(royalty);

                (bool success2, ) = payable(from).call{value: msg.value - royalty}(
                    ""
                );
                require(success2);
            }

            emit Sale(from, to, msg.value);
        }

        _safeTransfer(from, to, tokenId, _data);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function _payRoyalty(uint256 _royaltyFee) internal {
        (bool success1, ) = payable(royaltyReceiver).call{value: _royaltyFee}("");
        require(success1);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}