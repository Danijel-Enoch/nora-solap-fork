import React, { useState, useEffect } from "react";
import TokenChart from "./TokenChart";
import TokenStats from "./TokenStats";

export default function SolapeSwapStats({ token }) {
  const [tokenDetails, setTokenDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetch(`https://api.coingecko.com/api/v3/coins/${token.extensions.coingeckoId}?tickers=false&community_data=false&developer_data=false&sparkline=true`)
        .then(response => response.json())
        .then(json => {
          setTokenDetails(json);
          setLoading(false);
        })
        .catch(e => {
          console.log('Error: ', e);
        });
    }
  }, [token])

  return (
    <>
      {loading ?
        <div>Loading...</div>
        :
        tokenDetails &&
        <div style={{ padding: "1% 0% 5% 5%" }}>
          <TokenChart token={tokenDetails} />
          <TokenStats token={tokenDetails} />
        </div>
      }
    </>
  );
}
