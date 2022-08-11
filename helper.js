const puppeteer = require('puppeteer');

const elementsToClickSelector = 'body > div:nth-child(3) > div > div > ul > li > a';

let scrape = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.diki.pl/dictionary/last-searches-de');

    // login
     // redirect to login
    await page.click('.buttonVerticalAlignMiddle')
    // form filling
    // wait for form being visible
    await page.waitForSelector('#login', { visible: true, timeout: 0})
    await page.type('#login', 'szyman123drum@gmail.com')
    await page.type('#haslo', 'Zielony0103')
    // clicking Login
    await page.click('.buttonVerticalAlignMiddle')
    await page.waitForSelector('.dictionaryLastSearchesHistory', { visible: true, timeout: 0})

    // get all elements to be clicked
    let elementsToClick = await page.$$(elementsToClickSelector);
    console.log(`Elements to click: ${elementsToClick.length}`);

    for (let i = 0; i < elementsToClick.length; i++) {
        // click element
        await elementsToClick[i].click();
        await page.waitForSelector('hw');

        // generate result for the current page
        const GetWords = await page.evaluate(() => {
            let word = document.querySelector('.hw a').innerText;
            return { word };
        });
        console.log(GetWords); // do something with the result here...

        // go back one page and repopulate the elements
        await page.goBack();
        console.log('going back')
        // elementsToClick = await page.$$(elementsToClickSelector);
    }

    browser.close();
};

scrape();