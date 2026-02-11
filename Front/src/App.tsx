import "./App.css";
import { Header } from "./components/header/Header";
import { ClientPage } from "./pages/ClientPage";

function App() {
  return (
    <div className="App">
      <Header></Header>
      <ClientPage></ClientPage>
    </div>
  );
}

export default App;
