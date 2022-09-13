// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@ensdomains/ens-contracts/contracts/registry/ENS.sol";
import "@ensdomains/ens-contracts/contracts/ethregistrar/IBaseRegistrar.sol";

contract EnsExchange {
    uint256 public itemCount;

    struct Item {
        uint256 itemId;
        string name;
        uint256 tokenId;
        uint256 price;
        bool listed;
        address payable seller;
    }

    mapping(uint256 => Item) public items;
    IBaseRegistrar public immutable ensContract;

    constructor(address _baseRegistrar) {
        ensContract = IBaseRegistrar(_baseRegistrar);
    }

    //Function to list the item for sale, approve this contract
    function listENS(
        string memory _name,
        uint256 _tokenId,
        uint256 _price
    ) public {
        require(_price > 0, "Price should be greater than 0");
        require(balanceOf(msg.sender) > 0, "No items available to list");
        itemCount++;
        items[itemCount] = Item(
            itemCount,
            _name,
            _tokenId,
            _price,
            true,
            payable(msg.sender)
        );
    }

    function delistENS(string memory _name, uint256 _tokenId) public {
        //Item memory eachItem = items[_tokenId]
        itemCount--;
        delete items[itemCount];
        // items[itemCount] = Item(
        //     itemCount,
        //     _name,
        //     _tokenId,
        //     0,
        //     false,
        //     payable(msg.sender)
        // );
    }

    //Function to buy the ENS - ie - transferFrom
    function buyENS(uint256 _itemId) public payable {
        Item memory eachItem = items[_itemId];
        require(msg.value >= eachItem.price, "Price sent is not correct");
        require(_itemId > 0 && _itemId <= itemCount, "Wrong itemId");
        require(
            eachItem.listed == true,
            "This item is has not been listed for sale"
        );
        ensContract.safeTransferFrom(
            eachItem.seller,
            msg.sender,
            eachItem.tokenId
        );
        eachItem.listed = false;
        (bool sent, ) = eachItem.seller.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
    }

    // function registerENS(
    //     uint256 _id,
    //     address _owner,
    //     uint256 _duration,
    //     bool _updateRegistry
    // ) public returns (uint256) {
    //     _register(_id, _owner, _duration, false);
    // }

    function available(uint256 _id) external view returns (bool) {
        return ensContract.available(_id);
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return ensContract.balanceOf(_owner);
    }

    receive() external payable {}
}
