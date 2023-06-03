import "./App.css";
import { Footer, Main, Navbar } from "./components/index.js";

const App = () => {
  return (
    <div className="min-h-screen">
      <div className="gradient-bg-welcome">
        <Navbar />
        <Main />
      </div>
      <Footer />
    </div>
  );
};

export default App;
