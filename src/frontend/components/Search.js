import React, {useEffect, useState} from "react";
import {ethers, providers} from "ethers";

const Search = ({marketplace}) => {
  const lookUp = async () => {
    let provider = marketplace.provider;
    let address = await provider.getResolver("frank.eth");
    console.log(provider, address);
    return address;
  };
  return <button className="btn btn-primary" onClick={() => lookUp()}></button>;
};

export default Search;
