import React, {useEffect, useState} from "react";
import {Alchemy, Network} from "alchemy-sdk";
import {ethers} from "ethers";
import Loading from "./Loading";

const ListItem = ({EnsNameAddress, marketplace, ENSContract, account}) => {
  const [ensNames, setEnsNames] = useState([]);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadPage, setLoadPage] = useState(false);
  const [allListings, setAllListings] = useState([]);

  console.log("listed", allListings);

  useEffect(() => {
    if (account != null) {
      getAllENS();
      listedItems();
    }
  }, [account]);

  const getAllENS = async () => {
    setLoadPage(true);
    const config = {
      apiKey: process.env.ALCHEMY_API,
      network: Network.ETH_GOERLI,
    };

    const alchemy = new Alchemy(config);

    const ensContractAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";
    const ens = await alchemy.nft.getNftsForOwner(account, {
      contractAddresses: [ensContractAddress],
    });

    setEnsNames(ens.ownedNfts);
    console.log(ens.ownedNfts);
    setLoadPage(false);
  };

  const listedItems = async () => {
    setLoading(true);
    try {
      const itemCount = await marketplace.itemCount();
      let items = [];
      for (let i = 1; i <= itemCount; i++) {
        const item = await marketplace.items(i);

        const itemId = item.itemId.toString();
        const price = item.price.toString();
        //add all these to an array and save in state
        items.push({
          price: price,
          name: item.name,
          itemId: itemId,
          seller: item.seller,
          listed: item.listed,
        });
      }
      setLoading(false);
      setAllListings(items);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const listForSale = async (tokId, ensName) => {
    setLoading(true);
    try {
      const tx = await ENSContract.setApprovalForAll(EnsNameAddress.address, true);
      await tx.wait();
      let priceInEth = ethers.utils.parseEther(price.toString());
      const tx2 = await marketplace.listENS(ensName, tokId, priceInEth);
      await tx2.wait();
      alert("Awesome! You have now Listed your Item for Sale!");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const deListSale = async (tokId, ensName) => {
    setLoading(true);
    try {
      const tx = await marketplace.delistENS(ensName, tokId);
      await tx.wait();
      alert("Awesome! You have now delisted your Item for Sale!");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  return (
    <div className="container">
      {loadPage ? (
        <Loading val="Loading..." />
      ) : (
        <div>
          <h2 className="mb-4">You Own the Following ENS Domains:</h2>

          {ensNames.length === 0 ? (
            <div>
              <h2 className="lead">Sorry You do Not Own any ENS Domains!</h2>
            </div>
          ) : loading ? (
            <Loading val="Please Wait... Transaction is being Processed!" />
          ) : (
            ensNames.map((na, i) => (
              <div className="input-group mb-3" key={i}>
                <input type="text" className="form-control" value={na.title} disabled />
                <input
                  type="number"
                  className="form-control"
                  onChange={e => setPrice(e.target.value)}
                  placeholder="Enter the Price in ETH at which you want to List"
                  required
                />
                {allListings[i] == null ? (
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    id="button-addon2"
                    onClick={() => listForSale(na.tokenId.toString(), na.title)}>
                    List This ENS
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    id="button-addon2"
                    onClick={() => deListSale(na.tokenId.toString(), na.title)}>
                    {" "}
                    Delist This ENS
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ListItem;

{
  /* <button className='btn btn-primary' onClick={getAllENS}>Get All MY ENS Domains</button>
   */
}
