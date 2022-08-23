async function getToken(id) {
    return fetch(`https://api.coingecko.com/api/v3/coins/${id}?tickers=false&community_data=false&developer_data=false&sparkline=true`)
        .then(response => response.json())
        .then(json => json ? json : null);
}

async function getAllToken(ids) {
    return fetch(`https://api.coingecko.com/api/v3/coins/markets/?vs_currency=usd&ids=${ids}&per_page=250&price_change_percentage=24h,7d&sparkline=true&order=market_cap_desc`)
        .then(response => response.json())
        .then(json => json ? json : null);
}

export { getToken, getAllToken };