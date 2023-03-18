import { useAccount, useConnectors, useStarkName } from "@starknet-react/core";
import { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import Modal from "react-modal";

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
  const { connectors, connect } = useConnectors();
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const openModal = () => {
    if (isMobile) {
      setShouldOpenModal(true);
    }
  };

  function closeModal() {
    setShouldOpenModal(false);
  }

  return (
    <div className="md:ml-4">
      <span className="text-xl px-3 pr-1 py-1 text-xl font-bold">
        Choose a wallet:
      </span>
      {connectors.map((connector) => {
        return (
          <button
            key={connector.id()}
            className="rounded-full bg-blue-600 bg-opacity-100 text-white font-bold px-3 py-1 text-xl mr-1"
            onClick={() => {
              openModal();
              connect(connector);
            }}
          >
            {connector.id()}
          </button>
        );
      })}
      <Modal
        isOpen={shouldOpenModal}
        onRequestClose={closeModal}
        contentLabel="Mobile?"
      >
        Support for mobile (Braavos)? Coming soon in your nearest laptop!
      </Modal>
    </div>
  );
}

export default function WalletBar() {
  const { address } = useAccount();

  return address ? <WalletConnected /> : <ConnectWallet />;
}
