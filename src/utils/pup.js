const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');


// gets the book title from the url
// param: str - the url of the page to scrape
function extractFilenameFromUrl(url) {
  const lastSlashIndex = url.lastIndexOf('/');
  const filenameWithExtension = url.substring(lastSlashIndex + 1);
  const filenameWithoutExtension = filenameWithExtension.replace('.jpg', '');

  return filenameWithoutExtension;
}

// append the data to a csv file
// param: obj - the data to appen
function appendToCSVFile(filePath, data) {
  const title = extractFilenameFromUrl(data.firstImgUrl);
  const csvRow = `${title},${data.firstImgUrl},${data.paragraphTexts[0]},${data.paragraphTexts[1]}\n`;

  if (!fs.existsSync(filePath)) {
    console.log('File does not exist, creating new file')
    const header = 'title,tomb,tomb_text,folio_text\n';
    fs.writeFileSync(filePath, header);
  }

  fs.appendFileSync(filePath, csvRow);
  console.log(`Data appended to ${filePath}`);
}

// will find an image url with data
// param: str - the url of the page to scrape
// return: obj - { firstImgUrl: str, paragraphTexts: [book_info, page_info] }
          // TODO: I CAN GET MARC DATA FROM THESE URLS!! 
async function scrapeFolioData(url, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const data = await page.evaluate(() => {
    const divElement = document.querySelector('div.col-sm-7.col-sm-push-3');
    const imgElement = divElement.querySelector('img');
    const firstImgUrl = imgElement ? imgElement.src : '';

    const pElements = Array.from(divElement.querySelectorAll('p'));
    const paragraphTexts = pElements
      .filter((p) => p.textContent.trim() !== '' && p.textContent.trim() !== 'See more information »')
      .map((p) => p.textContent.trim());

    return {
      firstImgUrl,
      paragraphTexts,
    };
  });

  await browser.close();

  if (outputPath) {
    const outputText = JSON.stringify(data.firstImgUrl) + '\n';
    fs.appendFile(outputPath, outputText, (err) => {
      if (err) {
        console.error('Error appending to file:', err);
      } else {
        console.log(`Data appended to ${outputPath}`);
      }
    });
  }

  return data;
}

// will find all image pages for a given manuscript
// param: str - the url of the page to scrape
async function scrapeTombHrefs(url, outputFile) {
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
};

// will scrape the hrefs from the MAIN table page
// param: str - the url of the page to scrape
// param: outputPath - the path to the output file (optional)
async function scrapeMorganTable(url, outputPath) {
  console.log('launcing')
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
  return hrefs;
};

module.exports = {
  scrapeMorganTable,
  scrapeTombHrefs,
  scrapeFolioData,
  appendToCSVFile
};