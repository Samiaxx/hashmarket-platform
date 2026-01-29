// Simple in-memory cache to prevent hitting CoinGecko rate limits
let cache = {
  data: null,
  timestamp: 0
};

export default async function handler(req, res) {
  // 1. Check if we have valid cached data (less than 60 seconds old)
  const CACHE_DURATION = 60000; // 60 seconds
  if (cache.data && Date.now() - cache.timestamp < CACHE_DURATION) {
    return res.status(200).json(cache.data);
  }

  try {
    // 2. Fetch fresh data from CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,usd-coin,solana&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h'
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API Error: ${response.status}`);
    }

    const data = await response.json();

    // 3. Update Cache
    cache = {
      data: data,
      timestamp: Date.now()
    };

    return res.status(200).json(data);

  } catch (error) {
    console.error("Crypto Fetch Error:", error.message);
    
    // 4. Fallback: If API fails, try to return old cache, otherwise return empty array
    if (cache.data) {
      return res.status(200).json(cache.data);
    }
    
    // If absolutely nothing works, return 500 so frontend uses its hardcoded fallback
    return res.status(500).json({ error: 'Failed to fetch crypto data' });
  }
}