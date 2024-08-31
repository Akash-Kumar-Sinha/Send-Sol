import Header from "../component/Header";
import Transaction from "./Transaction";

const Home = () => {
  return (
    <div className="h-full">
      <div>
        <Header />
      </div>
      <Transaction />
    </div>
  );
};

export default Home;
