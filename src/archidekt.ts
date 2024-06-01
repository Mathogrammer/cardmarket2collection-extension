
import { AxiosStatic } from "axios";
import { CardmarketConditionToArchidektCondition, CardmarketLanguageToLanguageCode, ResultFound } from "./cardmarket";
import { Browser } from "webextension-polyfill";

export const archidektBase = "archidekt.com"
export const archidektMatcher = `*://*.${archidektBase}/*`;

export const archidektAuthEndpoint = "https://archidekt.com/api/rest-auth/login/";

export type ArchidektCredentials = {
    username: string,
    password: string,
}

export type AUTH_RESPONSE = {
    access_token: string,
    refresh_token: string,
    token: string,
    user: {
        id: number,
        username: string,
        first_name: string,
        last_name: string,
        rootFolder: number,
        profile: {
            roles: string[],
        }
    }
}

// Need to parametrise axios and browser to be able to keep this function in the same file as the const definitions above
export const importToArchidekt = async (axios: AxiosStatic, browser: Browser, cards: ResultFound[], archidektCredentials: ArchidektCredentials) => {
    const { data } = await axios.post<AUTH_RESPONSE>(archidektAuthEndpoint, archidektCredentials);
    console.log(data, "trying to set cookies");
    await browser.cookies.set({
        url: 'https://www.archidekt.com',
        name: 'tbJwt',
        value: data.token,
    });
    await browser.cookies.set({
        url: 'https://www.archidekt.com',
        name: 'tbRefresh',
        value: data.refresh_token,
    });
    await browser.cookies.set({
        url: 'https://www.archidekt.com',
        name: 'tbUser',
        value: data.user.username,
    });
    await browser.cookies.set({
        url: 'https://www.archidekt.com',
        name: 'tbId',
        value: data.user.id.toString(),
    });
    await browser.cookies.set({
        url: 'https://www.archidekt.com',
        name: 'tbRootFolder',
        value: data.user.rootFolder.toString(),
    });
    await browser.cookies.set({
        url: 'https://www.archidekt.com',
        name: 'tbR',
        value: encodeURIComponent(`[${data.user.profile.roles.join(',')}]`),
    });

    await axios.postForm("https://archidekt.com/api/collection/upload/v2/", {
        fileType: "csv",
        file: new Blob([
            cards.map(it => `${it.amount},${it.card.id},${it.isFoil ? "Foil" : "Normal"},${CardmarketLanguageToLanguageCode[it.language]},${it.price},${CardmarketConditionToArchidektCondition[it.condition]}`).join(`\n`),
        ], { type: "text/csv" }),
        ifFound: "add",
        skip: false,
        defaultGame: 1,
        defaultLanguage: 1,
        defaultCondition: 1,
        skipAmbiguousImports: true,
        "columns[0]": "quantity",
        "columns[1]": "uid",
        "columns[2]": "modifier",
        "columns[3]": "language",
        "columns[4]": "purchasePrice",
        "columns[5]": "condition",
    }, {
        headers: {
            'Authorization': `JWT ${data.token}`,
        }

    });

    await browser.tabs.create({ url: `https://www.archidekt.com/collection/v2/${data.user.id}`, active: true });

    browser.runtime.sendMessage({ type: "IMPORT_SUCCESS" });
};
