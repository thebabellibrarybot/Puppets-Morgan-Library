const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// will find an image url with data
// param: str - the url of the page to scrape
async function scrapeData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const data = await page.evaluate(() => {
    const divElement = document.querySelector('div.col-sm-7.col-sm-push-3');
    const imgElement = divElement.querySelector('img');
    const firstImgUrl = imgElement ? imgElement.src : '';

    const pElements = Array.from(divElement.querySelectorAll('p'));
    const paragraphTexts = pElements.map((p) => p.textContent.trim());

    return {
      firstImgUrl,
      paragraphTexts,
    };
  });

  await browser.close();

  return data;
}

// Usage example
const pracUrl = 'http://ica.themorgan.org/manuscript/page/1/76787'
scrapeData(pracUrl)
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error('An error occurred:', error);
  });


// will download an image into the base dir
// param: str - the url of the page to scrape
async function scrapeTombHrefs(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const hrefs = await page.evaluate(() => {
    const colDivs = Array.from(document.querySelectorAll('div.col-xs-12.col-sm-2'));
    const links = [];

    colDivs.forEach((div) => {
      const divLinks = Array.from(div.querySelectorAll('a'));
      divLinks.forEach((link) => {
        links.push(link.href);
      });
    });

    return links;
  });

  await browser.close();

  if (outputFile) {
    const content = hrefs.join('\n');
    fs.writeFileSync(outputFile, content);
    console.log(`URLs saved to ${outputFile}`);
  }

  return hrefs;
}

// Usage example 
/*
const pracUrl = 'http://ica.themorgan.org/manuscript/thumbs/76787'
const outputFile = './tombs_images.txt'; // Replace with the desired output file path (optional)
scrapeTombHrefs(pracUrl, outputFile)
  .then((hrefs) => {
    console.log(hrefs);
  })
  .catch((error) => {
    console.error('An error occurred:', error);
  });
*/

// will scrape the hrefs from the page
// param: str - the url of the page to scrape
// param: outputPath - the path to the output file (optional)
async function scrapeMorganTable(url, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const hrefs = await page.evaluate(() => {
    const tbodyElements = document.querySelectorAll('tr');
    const hrefsArray = [];

    tbodyElements.forEach((tbody) => {
      const tdElement = tbody.querySelector('.views-field.views-field-field-collection-images-link');
      if (tdElement) {
        const href = tdElement.querySelector('a')?.href;
        if (href) {
          hrefsArray.push(href);
        }
      }
    });

    return hrefsArray;
  });

  await browser.close();

  if (outputPath) {
    const data = hrefs.join('\n');
    fs.writeFileSync(outputPath, data);
    console.log(`Scraped hrefs saved to: ${outputPath}`);
  } else {
    console.log(hrefs);
  }
}
// Usage example
//const outputFile = './tombs_w_images.txt'; // Replace with the desired output file path (optional)
//const targetUrl = 'https://www.themorgan.org/manuscripts/list'; // Replace with the desired URL
//scrapeMorganTable(targetUrl, outputFile);
