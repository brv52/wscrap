let stored = new Set();

function get_offers(link)
{
    if (link === "maxreality")
    {
        let got = document.querySelectorAll("estate");
        return Array.from(got).map(got => got.innerText.trim());
    }
    else if (link === "realityidnes")
    {
        let got = document.querySelectorAll("c-products__inner");
        return Array.from(got).map(got => got.innerText.trim());
    }
    else if (link === "realitymix")
    {
        let got = document.querySelectorAll("advert-item__content");
        return Array.from(got).map(got => got.innerText.trim());
    }
    else
    {
        let got = document.querySelectorAll("li[id^='estate-list-item']");
        return Array.from(got).map(got => got.innerText.trim());
    } 
}

function check_new(link)
{
    let current = new Set(get_offers(link));

    for (let offer of current)
    {
        if (!stored.has(offer))
        {
            console.log("New offer detected:", offer);
            alert("New rental offer found! 🚀");
        }
    }
    stored = current;
}