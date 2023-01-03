import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import { Alchemy, Network } from 'alchemy-sdk'
import { NFTCard } from '../components/nftCard'

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

const Home = () => {
  const [wallet, setWalletAddress] = useState("");
  const [collection, setCollectionAddress] = useState("0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e");
  const [NFTs, setNFTs] = useState([]);
  const [fetchForCollection, setFetchForCollection] = useState(true);
  const [nextPage, setNextPage] = useState("");

  const fetchNFTs = async (pagination) => {
    let nfts;
    const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}/getNFTs/`
    var requestOptions = {
      method: 'GET'
    };

    console.log("fetching nfts");
    if (!collection.length) {
      nfts = await alchemy.nft.getNftsForOwner(wallet);
    } else {
      console.log("fetching nfts for collection owned by address", collection);
      const fetchURL = `${baseURL}?owner=${wallet}&contractAddresses%5B%5D=${collection}&pageKey=${pagination ? nextPage : ""}`;
      nfts = await fetch(fetchURL, requestOptions)
        .then(data => data.json());
    }

    if (nfts) {
      console.log("NFTs:", nfts);
      setNFTs(nfts.ownedNfts);
      setNextPage(nfts.pageKey);
    }
  };

  const fetchNFTsForCollection = async (pagination) => {
    //const nfts = await alchemy.nft.getNftsForContract(collection);
    let nfts;
    const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}/getNFTsForCollection/`
    var requestOptions = {
      method: 'GET'
    };

    console.log("fetching nfts");
    const fetchURL = `${baseURL}?contractAddress=${collection}&withMetadata=${"true"}&startToken=${pagination ? nextPage : ""}`;
    nfts = await fetch(fetchURL, requestOptions)
      .then(data => data.json());

    if (nfts) {
      console.log("NFTs in colleciton:", nfts);
      setNFTs(nfts.nfts);
      setNextPage(nfts.nextToken);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-y-3">
      <div className="flex flex-col w-full justify-center items-center gap-y-2">
        <input disabled={fetchForCollection} className="w-2/5 bg-slate-100 py-2 px-2 rounded-lg text-gray-000 focus:outline-blue-300 disabled:bg-slate-50 disabled:text-gray-50" onChange={(e) => { setWalletAddress(e.target.value) }} value={wallet} type={"text"} placeholder="Add your wallet address"></input>
        <input className="w-2/5 bg-slate-100 py-2 px-2 rounded-lg text-gray-000 focus:outline-blue-300 disabled:bg-slate-50 disabled:text-gray-50" onChange={(e) => { setCollectionAddress(e.target.value) }} value={collection} type={"text"} placeholder="Add the collection address">
        </input>
        <label className="text-gray-600">
          <input checked={fetchForCollection} className="mr-2" onChange={(e) => { setFetchForCollection(e.target.checked) }} type={"checkbox"}></input>
          Fetch for collection
        </label>
        <button className="disabled:bg-slate-500 text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm w-1/5" onClick={
          () => {
            if (fetchForCollection) {
              fetchNFTsForCollection(false);
            }
            else fetchNFTs(false);
          }
        }>
          Let's go!
        </button>
      </div>
      <div className="flex flex-wrap gap-y-12 mt-4 w-5/6 gap-x-2 justify-center">
        {
          NFTs.length && NFTs.map(nft => {
            return (
              <NFTCard key={nft.id?.tokenId} nft={nft}></NFTCard>
            )
          })
        }
      </div>
      {
        nextPage && (
          <button className="disabled:bg-slate-500 text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm w-1/5" onClick={
            () => {
              if (fetchForCollection) {
                fetchNFTsForCollection(true);
              }
              else fetchNFTs(true);
            }
          }>
            More
          </button>
        )
      }
    </div>
  )
}

export default Home
