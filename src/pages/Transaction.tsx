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
  const [toPubkey, setToPubkey] = useState<PublicKey | undefined>(undefined);
  const [senderPubkey, setSenderPubkey] = useState<PublicKey | undefined>(undefined);
  const [solAmount, setSolAmount] = useState<number>(0.0);
  const [balance, setBalance] = useState<number>(0);

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<InputDetails>();

  useEffect(() => {
    if (publicKey) {
      setSenderPubkey(publicKey);
    } else {
      setSenderPubkey(undefined);
    }
  }, [publicKey]);

  useEffect(() => {
    if (!connection || !publicKey) return;

    const handleAccountChange = (updatedAccountInfo: web3.AccountInfo<Buffer>) => {
      setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
    };

    // Subscribe to account changes
    const subscriptionId = connection.onAccountChange(publicKey, handleAccountChange, "confirmed");

    // Fetch initial balance
    connection.getAccountInfo(publicKey).then(info => {
      if (info) {
        setBalance(info.lamports / LAMPORTS_PER_SOL);
      }
    });

    // Cleanup subscription on component unmount
    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, publicKey]);

  const validateSolAddress = async () => {
    const address = watch("address");
    if (!address) {
      console.log("Address is required");
      setValidAddress(false);
      return;
    }

    try {
      const newPubKey = new PublicKey(address);

      if (publicKey?.toBase58() === address) {
        console.log("Enter another address");
        setValidAddress(false);
        return;
      }

      const isSolana = PublicKey.isOnCurve(newPubKey.toBuffer());

      console.log("PublicKey:", newPubKey.toBase58());
      console.log("Is valid Solana address:", isSolana);

      setToPubkey(newPubKey);
      setValidAddress(isSolana);
    } catch (error) {
      setValidAddress(false);
      console.error("Invalid address format:", error);
    }
  };

  const onTransaction = async (data: InputDetails) => {
    setSolAmount(data.solAmount);

    if (!senderPubkey || !toPubkey) {
      console.error("PublicKeys must be provided");
      return;
    }

    if (solAmount <= 0 || solAmount > balance) {
      console.log("Enter Valid amount");
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
  };

  return (
    <div className="w-full flex justify-center text-center p-4">
      {publicKey ? (
        <form
          className="flex flex-col gap-4 w-3/5"
          onSubmit={handleSubmit(onTransaction)}
        >
          <div className="flex flex-col items-start gap-2">
            <Label htmlFor="address">Sol Address</Label>
            <Input
              id="address"
              placeholder="address"
              {...register("address")}
            />
            <Button type="button" onClick={validateSolAddress}>
              Verify
            </Button>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Label htmlFor="solAmount">Sol amount (in SOL)</Label>{" "}
            <Input
              id="solAmount"
              placeholder="SOL"
              type="number"
              {...register("solAmount")}
              disabled={!validAddress}
            />
          </div>
          <Button type="submit" disabled={!validAddress}>
            Send
          </Button>
        </form>
      ) : (
        <p className="text-xl font-bold text-red-500">Connect to the wallet</p>
      )}
    </div>
  );
};

export default Transaction;
