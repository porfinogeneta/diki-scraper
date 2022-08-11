const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const puppeteer = require('puppeteer');

const app = express()

app.listen(PORT, () => console.log(`server running on PORT: ${PORT}`))

app.get('/', ( req, res ) => {
    const elementsToClickSelector = '.isDesktop.clearSearchForIosEnabled.isUserLoggedIn.pl_PL.doNotPopupDikiOnDoubleClick.dikibody > div:nth-child(3) > div > div > ul > li > a';

    (async () => {
        // const browser = await puppeteer.launch({headless: false})
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox']})
        const page = await browser.newPage()
        await page.goto('https://www.diki.pl/dictionary/last-searches-de')
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

        // const GetLinks = ['https://www.diki.pl/slownik-niemieckiego?q=feinster', 'https://www.diki.pl/slownik-niemieckiego?q=besagtem', 'https://www.diki.pl/slownik-niemieckiego?q=glich']

        // console.log(GetLinks)

        const GetWord = async () => {
            let w = document.querySelector('.hw')
            console.log(w)
            return {word: w.innerText}
        }

        let results = [];

        for (let i = 0; i < GetLinks.length; i++) {
            await page.goto(GetLinks[i], { waitUntil: 'networkidle0', timeout: 0 });

            const data = await page.evaluate(() => {
                let flashcards = [];
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
                const f = {
                    word: word.innerText,
                    // get maximally 3 words to translations
                    translation: translations.slice(0, 3 || translations.length),
                    sentence: sen
                }
                return f
            });
            results.push(data)
        }
        await browser.close()
        res.json(results)
    })();
})

app.get('/', ( req, res) => {

})

