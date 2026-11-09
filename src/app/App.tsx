import { HomePage } from "../pages/home";
import { useOrderFormNavigation } from "../shared/lib";
import { HomeFooter, HomeHeader } from "../widgets/home";
import "../App.scss";

function App() {
  const scrollToOrder = useOrderFormNavigation();

  return (
    <div id="top">
      <HomeHeader onCreateOrder={scrollToOrder} />
      <HomePage onCreateOrder={scrollToOrder} />
      <HomeFooter />
    </div>
  );
}

export default App;
