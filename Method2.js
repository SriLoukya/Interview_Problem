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

    let all_elements_initial_null = await page.$$('body *');
    let all_elements_initial = [];
    for (let i = 0; i < all_elements_initial_null.length; i++) {
        const element = all_elements_initial_null[i];
        const box = await element.boundingBox();
        if (box !== null) {
            all_elements_initial.push(element);
        }

    }
    const elements = await page.$$('button, a, input');
    let screenshots_taken = []
    let i = 0
    for (let k = 0; k < elements.length; k++) {
        const element = elements[k];

        const box = await element.boundingBox();
        if (box === null) continue;
        if (!fs.existsSync('./screenshots6')) {
            fs.mkdirSync('./screenshots6');
        }
        // take screenshot
        let found = false;
        // check if screenshot is already taken
        for (let j = 0; j < screenshots_taken.length; j++) {
            const element2 = screenshots_taken[j];
            const equal = await page.evaluate((element2, element) => element === element2, element, element2);
            if (equal === true) {
                found = true;
            }
        }
        if (found === false) {
            await element.screenshot({ path: `./screenshots6/screenshot-${i}.png` });
            screenshots_taken.push(element);
            i=i+1;
        }


    }
    /////////////////////////////////////////////////////////////////

    const input_elements = await page.$$('input');
    // let all_search_elements = []
    for (let j = 0; j < input_elements.length; j++) {
        let input_element = input_elements[j];
        await page.waitForTimeout(2000);
        await input_element.click();
        await page.waitForTimeout(2000);
        // all_search_elements = await page.$$('button, a, input');
        let all_elements_new_null = await page.$$('body *');
        let all_elements_new = [];
        for (let i = 0; i < all_elements_new_null.length; i++) {
            const element = all_elements_new_null[i];
            const box = await element.boundingBox();
            if (box !== null) {
                all_elements_new.push(element);
            }

        }

        let newly_added_elements = []


        // for (let k = 0; k < all_search_elements.length; k++) {
        //     const element = all_search_elements[k];
        //     let found = false;
        //     for (let l = 0; l < elements.length; l++) {
        //         const element2 = elements[l];
        //         const equal = await page.evaluate((element2, element) => element === element2, element, element2);
        //         if (equal === true) {
        //             found = true;
        //         }
        //     }
        //     if (found === false) {
        //         unique_elements.push(element);
        //     }
        // }
        used = []
        // find parent of unique elements recursively until you find a ul or ol

        for (let l = 0; l < newly_added_elements.length; l++) {
            const element = newly_added_elements[l];
            let parent = await page.evaluateHandle((element) => element.parentElement, element);
            let prev_parent = parent;
            let parent_tag = await page.evaluate((parent) => parent.tagName, parent);
            let prev_parent_tag = parent_tag;
            while (parent_tag !== 'BODY') {
                prev_parent = parent;
                prev_parent_tag = parent_tag;
                parent = await page.evaluateHandle((parent) => parent.parentElement, parent);
                parent_tag = await page.evaluate((parent) => parent.tagName, parent);

                // check if parent is present in all_elements_initial
                let found = false;
                for (let j = 0; j < all_elements_initial.length; j++) {
                    const element2 = all_elements_initial[j];
                    const equal = await page.evaluate((element2, parent) => element2 === parent, element2, parent);
                    if (equal === true) {
                        found = true;
                    }
                }
                if (found === true) {
                    break;
                }

            }
            parent = prev_parent;
            parent_tag = prev_parent_tag;
            let found = false;
            for (let j = 0; j < used.length; j++) {
                const element2 = used[j];
                const equal = await page.evaluate((element2, parent) => element2 === parent, element2, parent);
                if (equal === true) {
                    found = true;
                }
            }
            if (found === true) continue;
            used.push(parent);
            const box = await parent.boundingBox();
            if (box === null) continue;
            if (!fs.existsSync('./screenshots6')) {
                fs.mkdirSync('./screenshots6');
            }
            if (parent_tag !== 'BODY') {
                let found = false;
                for (let j = 0; j < screenshots_taken.length; j++) {
                    const element2 = screenshots_taken[j];
                    const equal = await page.evaluate((element2, parent) => element2 === parent, element2, parent);
                    if (equal === true) {
                        found = true;
                    }
                }
                if (found === false) {
                    await parent.screenshot({ path: `./screenshots6/screenshot-${i}.png` });
                    let box = await parent.boundingBox();
                    console.log(box);
                    screenshots_taken.push(parent);
                    i = i + 1;
                }
            }
        }

        await page.mouse.click(0, 0);

    }






    ////////////////////////////////////////////////////////////////////////////////
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
    // get all eleem

    // let i = 0

    for (let m = 0; m < newSelectors.length; m++) {
        console.log("m", newSelectors[m])
        const elements_hov_un = await page.$$(newSelectors[m])
        // console.log(elements_hov.length)
        var elements_hov = [];
        for (let i = 0; i < elements_hov_un.length; i++) {
            if (elements_hov_un[i] !== undefined) {
                elements_hov.push(elements_hov_un[i]);
                // console.log("element hov un", elements_hov_un[i])


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

            let all_elements_new_null = await page.$$('body *');
            let all_elements_new = [];
            for (let i = 0; i < all_elements_new_null.length; i++) {
                const element = all_elements_new_null[i];
                const box = await element.boundingBox();
                if (box !== null) {
                    all_elements_new.push(element);
                }

            }


            // console.log("atags",a_tags.length)

            let unique_elements = [];
            for (let k = 0; k < all_elements_new.length; k++) {
                const element = all_elements_new[k];
                let found = false;
                for (let l = 0; l < all_elements_initial.length; l++) {
                    const initial_element = all_elements_initial[l];
                    const equal = await page.evaluate((initial_element, element) => initial_element === element, initial_element, element);
                    if (equal) {
                        found = true;
                    }
                }
                if (!found) {
                    const box = await element.boundingBox();
                    // if (box !== null)
                    unique_elements.push(element);
                }
            }
            console.log("uq", unique_elements.length)
            used = []
            for (let k = 0; k < unique_elements.length; k++) {
                const element = unique_elements[k];

                let parent = await page.evaluateHandle((element) => element.parentElement, element);
                let prev_parent = parent;

                if (parent === null) continue;
                let parent_tag = await page.evaluate((parent) => parent.tagName, parent);
                let prev_parent_tag = parent_tag;
                // text in element
                console.log(await element.evaluate(x => x.textContent));
                while (parent_tag !== 'BODY') {
                    prev_parent = parent;
                    prev_parent_tag = parent_tag;
                    parent = await page.evaluateHandle((parent) => parent.parentElement, parent);
                    if (parent === null)
                        break;
                    parent_tag = await page.evaluate((parent) => parent.tagName, parent);
                    // check if parent is in all_elements_initial
                    let found = false;
                    for (let l = 0; l < all_elements_initial.length; l++) {
                        const initial_element = all_elements_initial[l];
                        const equal = await page.evaluate((initial_element, parent) => initial_element === parent, initial_element, parent);
                        if (equal) {
                            found = true;
                        }
                    }
                    if (found) {
                        break;
                    }

                }
                parent = prev_parent;
                parent_tag = prev_parent_tag;

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
                if (found === true)
                    continue;

                used.push(parent);
                const box1 = await parent.boundingBox();
                console.log(box1)

                if (box === null) continue;
                if (!fs.existsSync('./screenshots6')) {
                    fs.mkdirSync('./screenshots6');
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
                        // check if box is null or any of them is less than or equal to zero
                        if (box1 === null || box1.width <= 0 || box1.height <= 0) continue;
                        await parent.screenshot({ path: `./screenshots6/screenshot-${i}.png` });
                        console.log("screenshot taken33")

                        screenshots_taken.push(parent);

                        i = i + 1;
                    }
                }

            }


        }
    }
    await browser.close();
})();