import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

interface ApiResponse {
  result: { gas: number };
}

interface Item {
  actions: string;
  actual_fee: string;
  blockId: string;
  blockNumber: number;
  class_hash: string | null;
  classAlias: string | null;
  contract_address: string;
  contractAlias: string | null;
  hash: string;
  index: number;
  l1VerificationHash: string | null;
  status: string;
  timestamp: number;
  type: string;
}

interface ApiResponse {
  items: Item[];
  lastPage: number;
}

const getConfigTxs = (address: string, page: number) => {
  const txPerPage = 50;
  return {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://voyager.online/api/txns?to=${address}&ps=${txPerPage}&p=${page}`,
    headers: {
      authority: "voyager.online",
      accept: "*/*",
      "accept-language": "en-GB,en;q=0.5",
      referer:
        "https://voyager.online/contract/0x006b7d4d6de5cd2b2374536522c3bc92626fdc29306e3b06cd19d8381dc1aae8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
    },
  };
};

const getConfigAccount = (address: string) => {
  return {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://voyager.online/api/contract/${address}`,
    headers: {
      authority: "voyager.online",
      accept: "*/*",
      "accept-language": "en-GB,en;q=0.5",
      "if-modified-since": "Sat, 18 Mar 2023 03:53:28 GMT",
      referer: `https://voyager.online/contract/${address}`,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
    },
  };
};

const getConfigPrice = () => {
  const apiKey = process.env.CC_API_KEY;
  return {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=${apiKey}`,
    headers: {},
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    fees?: number;
    average?: number;
    txs?: number;
    price?: number;
    message?: string;
  }> // Define the response type
) {
  try {
    let { address } = req.query;
    if (!address) {
      res.status(400).json({ message: "Address is required" });
      return;
    }

    let config = getConfigTxs(address as string, 1);
    const response = await axios<ApiResponse>(config);

    // Get the number of pages
    const pages = response.data.lastPage;

    // Create an array of promises to fetch data for each page
    const pagePromises = [];
    for (let p = 2; p <= pages; p++) {
      const config = getConfigTxs(address as string, p);
      pagePromises.push(axios<ApiResponse>(config));
    }

    // Fetch Eth price data
    const priceResponse = axios(getConfigPrice());
    pagePromises.push(priceResponse);

    const responses = await Promise.all(pagePromises);
    const price = responses.pop()?.data.USD;
    // const price = 1800;

    // Combine all data from all responses into one array
    const items = responses.reduce(
      (allItems, response) => [...allItems, ...response.data.items],
      response.data.items
    );

    const fees = items.reduce((acc: number, item: Item) => {
      return Number(item.actual_fee) + acc;
    }, 0);

    const average = fees / items.length;

    res.status(200).json({ fees, average, txs: items.length, price });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
