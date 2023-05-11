const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    const cssFiles = new Set();
    page.on('response', async response => {
        if (response.request().resourceType() === 'stylesheet') {
            const cssText = await response.text();
            cssFiles.add(cssText);
        }
    });

    await page.goto('https://www.octoparse.com/product');
    // view port
    await page.setViewport({ width: 2000, height: 2000 });
    const elements = await page.$$('button, a, input');
    let screenshots_taken = []
    let i = 0
    for (i = 0; i < elements.length; i++) {
        const element = elements[i];

        const box = await element.boundingBox();
        if (box === null) continue;
        if (!fs.existsSync('./screenshots4')) {
            fs.mkdirSync('./screenshots4');
        }
        // take screenshot
        await element.screenshot({ path: `./screenshots4/screenshot-${i}.png` });
        screenshots_taken.push(element);
        await page.waitForTimeout(100);


    }
    const input_elements = await page.$$('input');
    let all_search_elements = []
    for (let j = 0; j < input_elements.length; j++) {
        let input_element = input_elements[j];
        await page.waitForTimeout(2000);
        await input_element.click();
        await page.waitForTimeout(2000);
        all_search_elements = await page.$$('button, a, input');

        unique_elements = []
        for (let k = 0; k < all_search_elements.length; k++) {
            const element = all_search_elements[k];
            let found = false;
            for (let l = 0; l < elements.length; l++) {
                const element2 = elements[l];
                const equal = await page.evaluate((element2, element) => element === element2, element, element2);
                if (equal === true) {
                    found = true;
                }
            }
            if (found === false) {
                unique_elements.push(element);
            }
        }
        used = []
        // find parent of unique elements recursively until you find a ul or ol
        for (let l = 0; l < unique_elements.length; l++) {
            const element = unique_elements[l];
            let parent = await page.evaluateHandle((element) => element.parentElement, element);
            let parent_tag = await page.evaluate((parent) => parent.tagName, parent);
            while (parent_tag !== 'UL' && parent_tag !== 'OL' && parent_tag !== 'DIV') {
            // while (parent_tag !== 'DIV') {

                parent = await page.evaluateHandle((parent) => parent.parentElement, parent);
                parent_tag = await page.evaluate((parent) => parent.tagName, parent);
            }
            // if (used.includes(parent)) continue;
            let found = false;
            for (let k = 0; k < used.length; k++) {
                const element2 = used[k];
                const equal = await page.evaluate((element2, parent) => element2 === parent, element2, parent);
                if (equal === true) {
                    found = true;
                }
            }
            if (found === true) continue;

            used.push(parent);
            const box = await parent.boundingBox();
            if (box === null) continue;
            if (!fs.existsSync('./screenshots4')) {
                fs.mkdirSync('./screenshots4');
            }
            await parent.screenshot({ path: `./screenshots4/screenshot-${i}.png` });
            screenshots_taken.push(parent);
            i = i + 1;
        }

        await page.mouse.click(0, 0);

    }
    let newSelectors = [];
    for (const cssText of cssFiles) {

        const hoverClasses = await page.evaluate(cssText => {
            const hoverClasses = [];
            const rules = document.styleSheets[0].cssRules;
            for (let i = 0; i < rules.length; i++) {

                const rule = rules[i];
                if (rule.selectorText && rule.selectorText.includes(":hover")) {
                    hoverClasses.push(rule.selectorText);
                }
            }

            return hoverClasses;
        }, cssText);

        newSelectors = hoverClasses.map(selector => {
            const hoverIndex = selector.indexOf(":hover");

            if (hoverIndex !== -1) {
                return selector.substring(0, hoverIndex);
            }

            return selector;
        });

    }
    const initial_cickables_null = await page.$$('button, a, input');
    let initial_cickables = [];
    for (let i = 0; i < initial_cickables_null.length; i++) {
        const element = initial_cickables_null[i];
        const box = await element.boundingBox();
        if (box !== null) {
            initial_cickables.push(element);
        }

    }
    // let i = 0

    for (let m = 0; m < newSelectors.length; m++) {
        console.log("m", newSelectors[m])
        const elements_hov_un = await page.$$(newSelectors[m])
        // console.log(elements_hov.length)
        var elements_hov = [];
        for (let i = 0; i < elements_hov_un.length; i++) {
            if (elements_hov_un[i] !== undefined) {
                elements_hov.push(elements_hov_un[i]);
                console.log("element hov un", elements_hov_un[i])


            }
        }
        console.log("hi")
        console.log(elements_hov.length)
        for (let j = 0; j < elements_hov.length; j++) {
            const hov_element = elements_hov[j];
            console.log("hov element : ", elements_hov[j])
            if (hov_element === undefined) continue;
            console.log(j)
            // text content
            console.log(hov_element)
            console.log(await hov_element.evaluate(x => x.textContent));
            if (await hov_element.boundingBox() === null) continue;
            await hov_element.hover();

            let a_tags = await page.$$('a');

            // console.log("atags",a_tags.length)

            let unique_elements = [];
            for (let k = 0; k < a_tags.length; k++) {
                const a_tag = a_tags[k];
                let found = false;
                for (let l = 0; l < initial_cickables.length; l++) {
                    const initial_clickable = initial_cickables[l];
                    const equal = await page.evaluate((initial_clickable, a_tag) => initial_clickable === a_tag, initial_clickable, a_tag);
                    if (equal) {
                        found = true;
                    }
                }
                if (!found) {
                    const box = await a_tag.boundingBox();
                    // if(box!==null) 
                    unique_elements.push(a_tag);
                }
            }
            console.log("uq", unique_elements.length)
            used = []
            for (let k = 0; k < unique_elements.length; k++) {
                const element = unique_elements[k];
                let parent = await page.evaluateHandle((element) => element.parentElement, element);
                if (parent === null) continue;
                let parent_tag = await page.evaluate((parent) => parent.tagName, parent);
                // text in element
                console.log(await element.evaluate(x => x.textContent));
                while (parent_tag !== 'UL' && parent_tag !== 'OL' && parent_tag !== 'BODY') {

                    parent = await page.evaluateHandle((parent) => parent.parentElement, parent);
                    if (parent === null) break;
                    parent_tag = await page.evaluate((parent) => parent.tagName, parent);
                    console.log(parent_tag, k);
                }
                // if (parent_tag==='BODY') continue;
                let found = false;
                for (let l = 0; l < used.length; l++) {
                    const used_element = used[l];
                    const equal = await page.evaluate((used_element, parent) => used_element === parent, used_element, parent);
                    if (equal) {
                        found = true;
                    }
                }
                await hov_element.hover();
                const box = await parent.boundingBox();
                console.log(box)
                if (found === true) continue;

                used.push(parent);
                const box1 = await parent.boundingBox();
                console.log(box1)

                if (box === null) continue;
                if (!fs.existsSync('./screenshots4')) {
                    fs.mkdirSync('./screenshots4');
                }
                // take screenshot
                await hov_element.hover();
                if (parent_tag !== 'BODY') {
                    // check if parent is present in the screenshots
                    let found = false;
                    for (let l = 0; l < screenshots_taken.length; l++) {
                        const screenshot_taken = screenshots_taken[l];
                        const equal = await page.evaluate((screenshot_taken, parent) => screenshot_taken === parent, screenshot_taken, parent);
                        if (equal) {
                            found = true;
                        }
                    }
                    if (found === false) {
                        await parent.screenshot({ path: `./screenshots4/screenshot-${i}.png` });
                        screenshots_taken.push(parent);

                        i = i + 1;
                    }
                }

            }


        }
    }
    await browser.close();
})();