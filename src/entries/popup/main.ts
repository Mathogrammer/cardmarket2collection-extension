import "../enableDevHmr";
import browser from "webextension-polyfill";
import "./index.css";
import { GetCardsResponse, MESSAGE_GET_CARDS } from "@/messages";

const app = document.getElementById("app");
const queryButton = `<button id="query-button" type="button">Query cards from page</button>`;

function setupQueryButton() {
    const button = app?.getElementsByTagName("button").namedItem("query-button");

    if (button === null || button === undefined)
        return;

    button.addEventListener("click", retrieveCards);
}

function setIsQuerying(isQuerying: boolean) {
    if (app === null)
        return;

    if (isQuerying) {
        app.innerHTML = "Loading...";
    } else {
        console.log("Setting isQuerying to false");

        app.innerHTML = queryButton;
        setupQueryButton();
    }
}

function retrieveCards() {
    setIsQuerying(true);
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        console.log('Sending query message');
        browser.tabs.sendMessage(tab.id!!, { type: MESSAGE_GET_CARDS }).then((response: unknown) => {
            console.log("received response", response);
            browser.runtime.sendMessage({ type: "ROUNDABOUT_MESSAGE", data: response as GetCardsResponse });
            setIsQuerying(false);
        });
    });
}

setIsQuerying(false);