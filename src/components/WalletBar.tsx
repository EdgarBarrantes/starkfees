import {
  Connector,
  useAccount,
  useConnectors,
  useStarkName,
  useStarknet,
} from "@starknet-react/core";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";
import Modal from "react-modal";
import Link from "next/link";

function WalletConnected() {
  const { address } = useAccount();
  const { disconnect } = useConnectors();
  const [starknetID, setStarknetID] = useState("");

  const {
    data: id,
    isLoading,
    isError,
  } = useStarkName({
    address: address || "",
    contract:
      "0x6ac597f8116f886fa1c97a23fa4e08299975ecaf6b598873ca6792b9bbfb678",
  });
  useEffect(() => {
    if (id) {
      setStarknetID(id);
    }
  }, [id]);

  const shortenedAddress = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  return (
    <div className="md:ml-4">
      <span className="text-xl px-3 pr-6 py-1 text-xl font-bold">
        {starknetID ? starknetID : shortenedAddress}
      </span>
      <button
        className="rounded-full bg-blue-600 bg-opacity-100 text-white font-bold px-3 py-1 text-xl"
        onClick={disconnect}
      >
        Disconnect
      </button>
    </div>
  );
}

function ConnectWallet() {
  const { connectors, connect, available } = useConnectors();
  const { error } = useStarknet();
  const [shouldOpenMobileModal, setShouldOpenMobileModal] = useState(false);
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  useEffect(() => {
    if (error) {
      openModal();
    }
  }, [error]);

  const openModal = () => {
    if (isMobile) {
      setShouldOpenMobileModal(true);
    } else if (error) {
      setShouldOpenModal(true);
    }
  };

  function closeMobileModal() {
    setShouldOpenMobileModal(false);
  }

  function closeModal() {
    setShouldOpenModal(false);
  }

  const customStyles = {
    content: {
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      borderRadius: "10px",
      padding: "3rem",
      color: "black",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };

  const onConnectClick = (connector: Connector<any>) => () => {
    try {
      connect(connector);
      openModal();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="md:ml-4 z-50">
      <span className="text-xl px-3 pr-1 py-1 text-xl font-bold">
        Choose a wallet:
      </span>
      {connectors.map((connector) => {
        return (
          <button
            key={connector.id()}
            className="rounded-full bg-blue-600 bg-opacity-100 text-white font-bold px-3 py-1 text-xl mr-1"
            style={{ cursor: "pointer", pointerEvents: "auto" }}
            onClick={onConnectClick(connector)}
            onTouchEnd={onConnectClick(connector)}
          >
            {connector.id()}
          </button>
        );
      })}
      <Modal
        isOpen={shouldOpenMobileModal}
        onRequestClose={closeMobileModal}
        contentLabel="Mobile?"
        style={customStyles}
      >
        <p className="text-lg">
          Support for mobile (Braavos)? Coming soon in your nearest laptop!
        </p>
        <br />
        <p className="text-center">
          In the meantime: <br />
          <a
            href="https://www.youtube.com/watch?v=xm3YgoEiEDc&t=10s"
            target="_blank"
            className="text-white font-semibold mt-2 block p-3 bg-orange-700 rounded-md text-center animate-pulse"
          >
            Check this out!
          </a>
        </p>
      </Modal>
      <Modal
        isOpen={shouldOpenModal}
        onRequestClose={closeModal}
        contentLabel="Do you have a wallet?"
        style={customStyles}
      >
        <span className="text-slate-900">
          Are you using a wallet? Check out{" "}
          <a
            className="underline text-teal-900"
            target="_blank"
            href="https://www.argent.xyz/argent-x/"
          >
            ArgentX
          </a>{" "}
          or{" "}
          <a
            className="underline text-teal-900"
            target="_blank"
            href="https://braavos.app/"
          >
            Braavos
          </a>
          .
        </span>
      </Modal>
    </div>
  );
}

export default function WalletBar() {
  const { address } = useAccount();

  return address ? <WalletConnected /> : <ConnectWallet />;
}
