import Home from "./pages/Home";
import WalletContextProvider from "./pages/WalletContextProvider";

const App = () => {
  return (
    <WalletContextProvider>
      <div className="h-screen w-screen bg-zinc-50">
        <Home />
      </div>
    </WalletContextProvider>
  );
};

export default App;
