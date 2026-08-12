import browser, { Runtime } from "webextension-polyfill";
import { importToArchidekt } from "@/archidekt";
import { IMPORT_CARDS_TO_ARCHIDEKT, MESSAGE_QUERY_CARDS, MESSAGE_GET_CARDS, Message, RESULT_PAGE_READY, makeMessageListener, GetCardsResponse } from "@/messages";
import axios from "axios";

browser.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

function openResultPage(response: GetCardsResponse) {
    browser.tabs.create({ url: browser.runtime.getURL("src/result-page/index.html"), active: true }).then(() => {
        const listener = makeMessageListener((message: Message, sender: Runtime.MessageSender) => {
            console.log("Received some message", sender.tab?.id, response);
            if (message.type === RESULT_PAGE_READY) {
                console.log("Received ready message", sender.tab?.id, response);
                browser.runtime.sendMessage({ type: MESSAGE_QUERY_CARDS, data: response });
                browser.runtime.onMessage.removeListener(listener);
            }
        });
        browser.runtime.onMessage.addListener(listener);
        console.log("listening for ready message");
    });
}

function onActionClicked(tab: { id?: number }) {
    if (tab.id === undefined)
        return;

    console.log("Sending query message");
    browser.tabs.sendMessage(tab.id, { type: MESSAGE_GET_CARDS }).then((response: unknown) => {
        console.log("received response", response);
        openResultPage(response as GetCardsResponse);
    }).catch((error) => {
        console.error("Failed to query cards from page", error);
    });
}

const action = browser.browserAction ?? browser.action;
action.onClicked.addListener(onActionClicked);
browser.pageAction?.onClicked.addListener(onActionClicked);

browser.runtime.onMessage.addListener(makeMessageListener((message: Message) => {
    console.log("Received message", message);
    if (message.type === IMPORT_CARDS_TO_ARCHIDEKT) {
        const { cards, archidektCredentials } = message;
        importToArchidekt(axios, browser, cards, archidektCredentials);
    }
}));

console.log("Listening for messages");