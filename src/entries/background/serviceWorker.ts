import "./main";
import { cardMarketBase } from "~/cardmarket";

// Wrap in an onInstalled callback to avoid unnecessary work
// every time the background script is run
chrome.runtime.onInstalled.addListener(() => {
    // Page actions are disabled by default and enabled on select tabs
    chrome.action.disable();
    console.log("Action disabled");


    // Clear all rules to ensure only our expected rules are set
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        // Declare a rule to enable the action on example.com pages
        const showActionRule = {
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostContains: cardMarketBase },
                })
            ],
            actions: [new chrome.declarativeContent.ShowAction()],
        };

        // Finally, apply our new array of rules
        const rules = [showActionRule];
        chrome.declarativeContent.onPageChanged.addRules(rules);
    });
});
