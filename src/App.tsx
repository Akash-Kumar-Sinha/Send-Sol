import Home from "./pages/Home";
import WalletContextProvider from "./utils/WalletContextProvider";

const App = () => {
  return (
    <WalletContextProvider>
      <div className="min-h-screen w-full bg-zinc-50">
        <Home />
      </div>
    </WalletContextProvider>
  );
};

export default App;
