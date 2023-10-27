import {
  Connector,
  useAccount,
  useConnectors,
  useStarkName,
} from "@starknet-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";
import Modal from "react-modal";
import Link from "next/link";

function WalletConnected() {
  const { address } = useAccount();
  const { disconnect, available } = useConnectors();
  const [starknetID, setStarknetID] = useState("");

  const {
    data: id,
    isLoading,
    isError,
  } = useStarkName({
    address: address || ""
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

  const [shouldOpenModal, setShouldOpenModal] = useState(false);

  const openModal = () => {
    setShouldOpenModal(true);
  };

  function closeModal() {
    setShouldOpenModal(false);
  }

  const customStyles = {
    content: {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
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
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
  };

  const onConnectClick = (connector: Connector<any>) => () => {
    try {
      connect(connector);
      const isAvailable = available.some(
        (availableConnector) => availableConnector.id === connector.id
      );
      if (!isAvailable) {
        openModal();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="md:ml-4 z-50 flex flex-col content-center md:flex-row">
      {connectors.map((connector) => {
        return (
          <button
            key={connector.id}
            className="rounded-full bg-blue-600 bg-opacity-100 text-white font-bold px-4 py-2 md:px-3 md:py-1 text-xl my-1 md:my-0 md:mr-1"
            style={{ cursor: "pointer", pointerEvents: "auto" }}
            onClick={onConnectClick(connector)}
            onTouchEnd={onConnectClick(connector)}
          >
            {connector.id}
          </button>
        );
      })}
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
