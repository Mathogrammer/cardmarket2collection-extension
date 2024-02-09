import logo from "~/assets/logo.svg";
import "./App.css";
import { getCards } from "./main";


function App() {
    const logoImageUrl = new URL(logo, import.meta.url).href;

    return (
        <div className="logo">
            <img onClick={getCards} src={logoImageUrl} height="50" alt="" />
        </div>
    );
}

export default App;
