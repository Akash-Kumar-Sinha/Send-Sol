import Header from "../component/Header";
import WalletContextProvider from "./WalletContextProvider";
import Transaction from "./Transaction";


const Home = () => {
  return (
    <WalletContextProvider>
      <div>
        <Header />
      </div>
      <Transaction />
    </WalletContextProvider>
  );
};

export default Home;
