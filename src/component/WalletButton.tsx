import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  useWalletModal,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

const WalletButton = () => {
  const { setVisible, visible } = useWalletModal();
  const { wallets, select } = useWallet();

  const [balance, setBalance] = useState(0);

  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!connection) {
      console.log("Connection not established!");
      return;
    }
    if (!publicKey) {
      console.log("Try again later");
      return;
    }
    
    connection.onAccountChange(
      publicKey,
      (updateAccountInfo) => {
        setBalance(updateAccountInfo.lamports / LAMPORTS_PER_SOL);
      },
      {
        commitment: "confirmed",
      }
    );

    connection.getAccountInfo(publicKey).then((info) => {
      if (info) {
        setBalance(info.lamports / LAMPORTS_PER_SOL);
      }
    });
  }, [connection, publicKey]);

  return (
    <div className="text-xl">
      <Dialog>
        <DialogTrigger className="bg-[#9449FD] text-white py-2 px-4 rounded hover:bg-[#7a35d8]">
          Wallet
        </DialogTrigger>

        <DialogContent className="bg-black text-zinc-50 p-4 rounded-lg">
          <div className="p-4 flex flex-col gap-2">
            <div className="bg-[#9449FD] text-zinc-50 p-2 rounded-t-2xl flex flex-col items-center">
              <WalletMultiButton className="mb-4 w-full" />
            </div>

            <p>{publicKey ? `${balance / LAMPORTS_PER_SOL} SOL` : ""}</p>
            {!visible && (
              <>
                {wallets.length > 0 ? (
                  <ul className="space-y-2">
                    {wallets.map((wallet) => (
                      <li
                        key={wallet.adapter.name}
                        className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          select(wallet.adapter.name);
                          setVisible(false);
                        }}
                      >
                        <img
                          src={wallet.adapter.icon}
                          alt={wallet.adapter.name}
                          className="w-8 h-8"
                        />
                        <span className="text-white">
                          {wallet.adapter.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-red-500 text-center">
                    No wallets found. Please download a wallet.
                  </p>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletButton;
