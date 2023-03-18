import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import React, { useEffect, useState } from "react";
import { useAccount, useStarkName } from "@starknet-react/core";
import WalletBar from "@/components/WalletBar";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [address, setAddress] = useState("");
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  // Price could be cached but api key forces it to be in serverless function
  const [feesData, setFeesData] = useState({
    fees: "",
    averageFee: 0,
    txs: 0,
    price: 0,
  });

  const { account, address: unformattedAddress, status } = useAccount();
  // const {
  //   data: id,
  //   isLoading,
  //   isError,
  // } = useStarkName({ address: address || "" });

  useEffect(() => {
    if (unformattedAddress) {
      console.log("unformattedAddress", unformattedAddress);
      const tempAddress =
        unformattedAddress.slice(0, 2) + "00" + unformattedAddress.slice(2);
      setAddress(tempAddress);
      getGas(tempAddress);
    } else {
      setFeesData({ fees: "", averageFee: 0, txs: 0, price: 0 });
      setAddress("");
    }
  }, [unformattedAddress]);

  const getGas = async (address: string) => {
    setIsLoadingFees(true);
    const res = await fetch(`/api/gas-by-account?address=${address}`);
    const data = await res.json();
    console.log("Fees", data.fees);
    setFeesData({
      fees: data.fees,
      averageFee: data.average,
      txs: data.txs,
      price: data.price,
    });
    setIsLoadingFees(true);
  };

  return (
    <>
      <Head>
        <title>Starkfees</title>
        <meta name="description" content="Simple fees for a stark(net)work" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>Are you sure you want to find out how much gas have you spent?</p>
          <div>
            {/* Placeholder for logo */}
            <WalletBar />
            {/* <a
              href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              By{" "}
              <Image
                src="/vercel.svg"
                alt="Vercel Logo"
                className={styles.vercelLogo}
                width={100}
                height={24}
                priority
              />
            </a> */}
          </div>
        </div>

        <div className={styles.center}>
          <div>
            <br></br>
            {feesData && (
              <>
                <div>
                  <p>Total gas used:</p>
                  <p>{Number(feesData) / 10 ** 18}</p>
                </div>
                <div>
                  <p>Which now would be...</p>
                  <p>${(Number(feesData) / 10 ** 18) * 1800}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.grid}>{/* Placeholder for links */}</div>
      </main>
    </>
  );
}
