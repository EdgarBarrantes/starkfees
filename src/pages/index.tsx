import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import React, { useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import WalletBar from "@/components/WalletBar";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

// Format number to 8 decimals
const formatNumber = (num: number, dec: number) => {
  return num.toFixed(dec);
};

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

  const { account, address: unformattedAddress } = useAccount();

  useEffect(() => {
    if (unformattedAddress) {
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
    setFeesData({
      fees: data.fees,
      averageFee: data.average,
      txs: data.txs,
      price: data.price,
    });
    setIsLoadingFees(false);
  };

  return (
    <>
      <Head>
        <title>Starkfees</title>
        <meta name="description" content="Simple fees for a stark(net)work" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} gradient mb-8 md:mb-0`}>
        <div className={`${styles.description}`}>
          <p className="text-lg ">
            How much in fees have ye spent in Starknet, eh?
          </p>
          <div>
            <WalletBar />
          </div>
        </div>

        <div className="flex flex-col">
          <Image
            src="/duck.webp"
            alt="An AI generated image of a wealthy duck"
            width={224}
            height={224}
            className={`basis-full self-center ${
              isLoadingFees ? "animate-spin" : ""
            }`}
          />
          <div className="flex flex-nowrap flex-grow-1 flex-col md:flex-row text-3xl text-center leading-normal">
            {feesData.fees && (
              <>
                <div className="bg-blend-normal shadow-lg p-6 m-2 bg-slate-400 bg-opacity-40 rounded-lg md:basis-1/3">
                  <p>
                    Let this ol&#39; duck tell ye. Ye have spent{" "}
                    <span className="py-1 px-3 rounded-lg bg-slate-400 bg-opacity-40 shadow-sm">
                      {(Number(feesData.fees) / 10 ** 18).toFixed(6)}Ξ
                    </span>
                  </p>
                </div>
                <div className="bg-blend-normal shadow-lg p-4 m-2 bg-slate-400 bg-opacity-40 rounded-lg md:basis-1/3">
                  <p>
                    Today that would be...{" "}
                    <span className="p-1 rounded-lg bg-slate-400 bg-opacity-40 shadow-sm">
                      $
                      {(
                        (Number(feesData.fees) / 10 ** 18) *
                        (feesData.price ? feesData.price : 1800)
                      ).toFixed(2)}
                    </span>{" "}
                    but alas, tis no more!
                  </p>
                </div>
                <div className="bg-blend-normal shadow-lg p-4 m-2 bg-slate-400 bg-opacity-40 rounded-lg md:basis-1/3">
                  <p>
                    And on average, ye have used up{" "}
                    <span className="p-1 rounded-lg bg-slate-400 bg-opacity-40 shadow-sm">
                      {(Number(feesData.averageFee) / 10 ** 18).toFixed(6)}Ξ
                    </span>{" "}
                    or{" "}
                    <span>
                      <span className="p-1 rounded-lg bg-slate-400 bg-opacity-40 shadow-sm">
                        $
                        {(
                          (Number(feesData.averageFee) / 10 ** 18) *
                          (feesData.price ? feesData.price : 1800)
                        ).toFixed(2)}{" "}
                      </span>
                    </span>
                    per tx in <span>{feesData.txs}</span> transactions
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex w-full justify-end">
          <Link href="https://github.com/EdgarBarrantes/starkfees">
            <FaGithub />
          </Link>
        </div>
      </main>
    </>
  );
}
