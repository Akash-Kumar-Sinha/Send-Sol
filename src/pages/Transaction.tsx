import { useEffect, useState } from "react";
import * as web3 from "@solana/web3.js";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

type InputDetails = {
  address: string;
  solAmount: number;
};

const Transaction = () => {
  const [validAddress, setValidAddress] = useState(false);
  const [showInvalidAddressMessage, setShowInvalidAddressMessage] =
    useState(false);
  const [toPubkey, setToPubkey] = useState<PublicKey | undefined>(undefined);
  const [senderPubkey, setSenderPubkey] = useState<PublicKey | undefined>(
    undefined
  );
  const [solAmount, setSolAmount] = useState<number>(0.0);
  const [balance, setBalance] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InputDetails>();

  useEffect(() => {
    if (publicKey) {
      setSenderPubkey(publicKey);
    } else {
      setSenderPubkey(undefined);
    }
  }, [publicKey]);

  useEffect(() => {
    if (!connection || !publicKey) return;

    const handleAccountChange = (
      updatedAccountInfo: web3.AccountInfo<Buffer>
    ) => {
      setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
    };

    const subscriptionId = connection.onAccountChange(
      publicKey,
      handleAccountChange,
      "confirmed"
    );

    connection.getAccountInfo(publicKey).then((info) => {
      if (info) {
        setBalance(info.lamports / LAMPORTS_PER_SOL);
      }
    });

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, publicKey]);

  const validateSolAddress = async () => {
    const address = watch("address");
    if (!address) {
      setValidAddress(false);
      return;
    }

    try {
      const newPubKey = new PublicKey(address);

      if (publicKey?.toBase58() === address) {
        setValidAddress(false);
        setShowInvalidAddressMessage(true);
        setTimeout(() => setShowInvalidAddressMessage(false), 3000);
        return;
      }

      const isSolana = PublicKey.isOnCurve(newPubKey.toBuffer());

      setToPubkey(newPubKey);
      setValidAddress(isSolana);

      if (!isSolana) {
        setShowInvalidAddressMessage(true);
        setTimeout(() => setShowInvalidAddressMessage(false), 3000);
      }
    } catch {
      setValidAddress(false);
      setShowInvalidAddressMessage(true);
      setTimeout(() => setShowInvalidAddressMessage(false), 3000);
    }
  };

  const onTransaction = async (data: InputDetails) => {
    if (isProcessing) return; // Prevent multiple submissions

    setIsProcessing(true);
    setSolAmount(data.solAmount);

    if (!senderPubkey || !toPubkey) {
      setIsProcessing(false);
      return;
    }

    if (solAmount <= 0 || solAmount > balance) {
      setIsProcessing(false);
      return;
    }

    const transaction = new web3.Transaction();
    const lamportAmount = solAmount * LAMPORTS_PER_SOL;

    const sendSol = web3.SystemProgram.transfer({
      fromPubkey: senderPubkey,
      toPubkey: toPubkey,
      lamports: lamportAmount,
    });

    transaction.add(sendSol);

    try {
      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction signature:", signature);
    } catch (error) {
      console.error("Transaction failed:", error);
    }

    setIsProcessing(false);
  };

  return (
    <div className="w-full flex justify-center p-4 sm:p-8 bg-gray-100 min-h-screen">
  {publicKey ? (
    <form
      className="flex flex-col gap-6 w-full max-w-lg bg-white p-4 sm:p-6 rounded-lg shadow-md"
      onSubmit={handleSubmit(onTransaction)}
      style={{ overflowWrap: 'break-word' }}
    >
      <div className="flex flex-col items-start gap-2">
        <Label htmlFor="address" className="text-gray-700 font-medium">
          Sol Address
        </Label>
        <Input
          id="address"
          placeholder="Enter Solana address"
          {...register("address", { required: true })}
          className={`w-full max-w-full ${
            errors.address ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.address && (
          <p className="text-red-500 text-sm">Address is required</p>
        )}
        <Button
          type="button"
          onClick={validateSolAddress}
          className="mt-2 w-full sm:w-auto text-wrap"
        >
          Verify Address
        </Button>
        {showInvalidAddressMessage && (
          <p className="text-red-500 text-sm mt-2">
            Please enter a valid Solana address.
          </p>
        )}
      </div>

      <div className="flex flex-col items-start gap-2">
        <Label htmlFor="solAmount" className="text-gray-700 font-medium">
          Sol Amount (in SOL)
        </Label>
        <Input
          id="solAmount"
          placeholder="Amount in SOL"
          type="number"
          step="any"
          {...register("solAmount", { required: true, min: 0.001 })}
          className={`w-full max-w-full ${
            errors.solAmount ? "border-red-500" : "border-gray-300"
          }`}
          disabled={!validAddress}
        />
        {errors.solAmount && (
          <p className="text-red-500 text-sm">Enter a valid amount</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!validAddress || isProcessing}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg w-full mt-4"
      >
        {isProcessing ? "Processing..." : "Send SOL"}
      </Button>
    </form>
  ) : (
    <p className="text-2xl font-bold text-red-500 text-center">
      Please connect your wallet
    </p>
  )}
</div>

  );
};

export default Transaction;