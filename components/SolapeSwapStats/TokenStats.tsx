import React from "react";

export default function TokenStats({ token }: { token: any }) {
  return (
    <div className="solape-swap-stats">
      <div style={{ width: "33%" }}>
        <h3>Market Cap Rank</h3>
        <span className={"chart-stats"}>
          {token.market_cap_rank ? `#${token.market_cap_rank}` : "-"}
        </span>
      </div>
      <div style={{ width: "33%" }}>
        <h3>Market Cap</h3>
        <span className={"chart-stats"}>
          {token.market_data?.market_cap?.["usd"] ?
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(token.market_data.market_cap["usd"] / 1000000) + "M"
          : "-"}
        </span>
      </div>
      <div style={{ width: "33%" }}>
        <h3>Circulating Supply</h3>
        <span className={"chart-stats"}>
          {token.market_data?.circulating_supply ? new Intl.NumberFormat('en-US').format(token.market_data.circulating_supply / 1000000) + "M" : "-"}
        </span>
      </div>
      <div style={{ width: "33%" }}>
        <h3>YTD ROI</h3>
        <span className={"chart-stats"}>
          {token.market_data?.roi ?
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(token.market_data.roi)
          : "-"}
        </span>
      </div>
      <div style={{ width: "33%" }}>
        <h3>Trading Volume</h3>
        <span className={"chart-stats"}>
          {token.market_data?.total_volume?.["usd"] ?
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(token.market_data.total_volume["usd"])
          : "-"}
        </span>
      </div>
    </div>
  );
}
