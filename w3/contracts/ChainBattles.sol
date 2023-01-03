// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract ChainBattles is ERC721URIStorage {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Hero {
        uint256 level;
        uint256 hp;
        uint256 strength;
        uint256 speed;
    }
    mapping(uint256 => Hero) public tokenIdtoLevels;
    // levels, hp, strength, speed
    //  keccak256, block.timestamp, block.difficulty
    // mint, train

    constructor() ERC721("Chain Battles", "CBTLS") {
    }

    function generateCharacter(uint256 tokenId) public view returns(string memory) {
        Hero memory hero = getHero(tokenId);

        bytes memory svg = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
            '<style>.base { fill: white; font-family: serif; font-size: 14px; }</style>',
            '<rect width="100%" height="100%" fill="black" />',
            '<text x="50%" y="40%" class="base" dominant-baseline="middle" text-anchor="middle">',"Warrior",'</text>',
            '<text x="50%" y="50%" class="base" dominant-baseline="middle" text-anchor="middle">', "Level: ",hero.level.toString(),'</text>',
            '<text x="50%" y="60%" class="base" dominant-baseline="middle" text-anchor="middle">', "HP: ",hero.hp.toString(),'</text>',
            '<text x="50%" y="70%" class="base" dominant-baseline="middle" text-anchor="middle">', "Strength: ",hero.strength.toString(),'</text>',
            '<text x="50%" y="80%" class="base" dominant-baseline="middle" text-anchor="middle">', "Speed: ",hero.speed.toString(),'</text>',
            '</svg>'
        );

        return string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(svg)
            )
        );
    }

    function getHero(uint256 tokenId) public view returns(Hero memory) {
        Hero memory hero = tokenIdtoLevels[tokenId];
        return hero;
    }

    function getTokenURI(uint256 tokenId) public view returns(string memory) {
        bytes memory dataURI = abi.encodePacked(
            "{",
                '"name": "Chain Battles #', tokenId.toString(), '",',
                '"description": "Battles on chain",',
                '"image": "', generateCharacter(tokenId), '"',
            "}"
        );
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    function randomMod(uint _modulus, uint _seed) view internal returns(uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, _seed))) % _modulus;
    }

    function mint() public {
        Hero memory hero = Hero(
            randomMod(100, 1),
            randomMod(100, 2),
            randomMod(100, 3),
            randomMod(100, 4)
        );

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        tokenIdtoLevels[newItemId] = hero;
        _setTokenURI(newItemId, getTokenURI(newItemId));
    }

    function train(uint256 tokenId) public {
        require(_exists(tokenId), "Please use an existing Token");
        require(ownerOf(tokenId) == msg.sender, "You must own this token to train it");
        Hero memory current = tokenIdtoLevels[tokenId];
        tokenIdtoLevels[tokenId] = Hero(current.level + 1, current.hp + 1, current.strength + 1, current.speed + 1);
        _setTokenURI(tokenId, getTokenURI(tokenId));
    }
}