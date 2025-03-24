document.addEventListener("DOMContentLoaded", () => {
    console.log("Popup script loaded");
    document.getElementById("toggle").addEventListener("click", () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length > 0)
            {
                chrome.storage.local.get("m_tabs", (data) => {
                    let m_tabs = data.m_tabs || [];
                    if (!m_tabs.includes(tabs[0].id))
                    {
                        m_tabs.push(tabs[0].id);
                        chrome.storage.local.set({m_tabs: m_tabs}).then(() => {
                            console.log("Tab added to monitored list:", tabs[0].id);
                        })
                    }
                    else
                    {
                        console.log("Tab is already in the monitored list.");
                    }
                });
            }
        });
    });
})
