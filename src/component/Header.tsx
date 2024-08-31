import { useState } from "react";
import WalletButton from "@/component/WalletButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { CopyIcon } from "lucide-react";

const WALLETADDRESS = "jGBVZGZqDQZz97VFmkMxmzbsLCiW9XZpVx5GJXMWdMF";

const Header = () => {
  const [copied, setCopied] = useState(false);
  const { publicKey } = useWallet();


  const handleCopy = () => {
    navigator.clipboard.writeText(WALLETADDRESS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-black shadow-lg space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
      <WalletButton />
      {publicKey && (
        <div className="text-center sm:text-left">
          <p className="text-md font-semibold text-zinc-300 mb-2">
            Buy me a Coffee !
          </p>
          <p className="flex justify-center sm:justify-start bg-zinc-800 text-zinc-200 p-2 rounded-lg border border-zinc-500 gap-2 lg:gap-4 items-center">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2"
            >

              <CopyIcon
                size={18}
                className={`${copied ? "text-[#7a35d8] font-bold" : ""}`}
              />
            </button>
            <span className="text-sm select-all break-all">
              {WALLETADDRESS}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Header;
