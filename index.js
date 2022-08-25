const puppeteer = require('puppeteer-extra');
// plugin to hide puppeteer
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())

// AdBlock plugin to increase speed
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({blockTrackers: true}))

const createFlashcards = async () => {
    // const browser = await puppeteer.launch({headless: false})
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox']})
    const page = await browser.newPage()
    await page.goto('https://www.diki.pl/dictionary/last-searches-de')
    // redirect to login
    await page.click('.buttonVerticalAlignMiddle')
    // form filling
    // wait for form being visible
    await page.waitForSelector('#login', { visible: false, timeout: 0})
    await page.type('#login', 'szyman123drum@gmail.com')
    await page.type('#haslo', 'Zielony0103')
    // clicking Login
    await page.click('.buttonVerticalAlignMiddle')
    await page.waitForSelector('.dictionaryLastSearchesHistory', { visible: true, timeout: 0})


    // creating list with links
    const GetLinks = await page.evaluate(() => {
        const words = document.querySelectorAll('.dikicolumn ul li')
        let links = []
        words.forEach((word) => {
            let l = word.querySelector("a")
            // get proper link
            links.push(`https://www.diki.pl${l.getAttribute('href')}`)
        })
        return links
    })

    let results = [];

    // get list with non-repetitioning words indexes, the amount of indexes is 10
    const randomArray = () => {
        let indexesToDownload = []
        for (let i = 0; i < 15; i++) {
            const index = Math.round(Math.random() * GetLinks.length)
            indexesToDownload.push(index)
            if (!indexesToDownload.includes(index)) {
                indexesToDownload.push(index)
            }
        }
        return indexesToDownload
    }

    const arr = randomArray()

    for (let i = 0; i < arr.length; i++) {
        let index = arr[i]
        await page.goto(GetLinks[index], { waitUntil: 'networkidle0', timeout: 0 });

        const data = await page.evaluate(() => {
            // get main word
            const word = document.querySelector('h1 .hw')
            // get one example sentence
            const senTag = document.querySelector('.exampleSentence')
            const sen = senTag != null ? senTag.innerText : null
            // get all hv from ol list
            const translationTags = document.querySelectorAll('ol li .hw')
            let translations = []
            translationTags.forEach((tag) => {
                translations.push(tag.innerText)
            })
            // create flashcard
            return {
                id: i,
                word: word.innerText,
                // get maximally 3 words to translations
                translation: translations.slice(0, 3 || translations.length),
                sentence: sen
            }
        });
        results.push(data)
    }
    await browser.close()
    return results
}

module.exports = createFlashcards
