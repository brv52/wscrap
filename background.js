console.log("Background script running...");

chrome.alarms.create("refreshSelectedTab", { periodInMinutes: 0.2 });

let stored = new Map();

chrome.alarms.onAlarm.addListener((alarm) => {
    chrome.storage.local.get("m_tabs", (data) => {
        if (data.m_tabs) {
            for (const tab of data.m_tabs) {
                chrome.tabs.reload(tab);
                console.log("Tab refreshed:", tab);
                chrome.tabs.get(tab, (tab_info) => {
                    if (tab_info && tab_info.url) {
                        console.log("Checking new offers for:", tab_info.url);
                        check_new(tab_info.url, tab);
                    } else {
                        console.warn("Tab URL is undefined:", tab);
                    }
                });
            }
        }
    });
});

function check_new(link, tab_id) {
    chrome.scripting.executeScript({
        target: { tabId: tab_id },
        func: get_offers,
        args: [link]
    }, (results) => {
        if (results && results[0] && results[0].result) {
            let currentOffers = new Set(results[0].result);
            console.log(`Extracted Offers for ${link}:`, currentOffers);

            // If this is the first check for the link, store offers silently
            if (!stored.has(link)) {
                stored.set(link, currentOffers);
                console.log(`First-time check: Stored initial offers for ${link}`);
                return; // Exit function to avoid alerts
            }

            let previousOffers = stored.get(link); // Get previously stored offers for this link

            for (let offer of currentOffers) {
                if (!previousOffers.has(offer)) {
                    previousOffers.add(offer);
                    console.log("New offer detected:", offer);
                    alert(`New rental offer found on ${link}! 🚀`);
                }
            }

            stored.set(link, previousOffers); // Update stored offers for this link
        } else {
            console.warn(`No offers found on ${link}.`);
        }
    });
}


function get_offers(url) {
    let offers = [];

    if (url.toLowerCase().includes("maxireality")) {
        document.querySelectorAll(".estate").forEach(el => offers.push(el.innerText.trim()));
    } else if (url.toLowerCase().includes("reality.idnes")) {
        document.querySelectorAll(".c-products__inner").forEach(el => offers.push(el.innerText.trim()));
    } else if (url.toLowerCase().includes("realitymix")) {
        document.querySelectorAll(".advert-item__content").forEach(el => offers.push(el.innerText.trim()));
    } else {
        document.querySelectorAll("li[id^='estate-list-item']").forEach(el => offers.push(el.innerText.trim()));
    }

    return offers;
}
