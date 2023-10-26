import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { StarknetConfig, InjectedConnector } from "@starknet-react/core";
import { WebWalletConnector } from "@argent/starknet-react-webwallet-connector";

export default function App({ Component, pageProps }: AppProps) {
  const connectors = [
    new InjectedConnector({ options: { id: "braavos" } }),
    new InjectedConnector({ options: { id: "argentX" } }),
    new WebWalletConnector(),
    // new WebWalletConnector({
    //   url: "https://web.hydrogen.argent47.net",
    // }),
  ];
  return (
    <StarknetConfig connectors={connectors} autoConnect>
      <Component {...pageProps} />
    </StarknetConfig>
  );
}
