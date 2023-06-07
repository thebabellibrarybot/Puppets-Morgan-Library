const utils = require('./src/utils/pup.js');
const fs = require('fs');


const url = 'https://www.themorgan.org/manuscripts/list';

async function mkMorganCSV() {

  //const hrefs = await utils.scrapeMorganTable(url);

  // space saver
  const text = `./src/utils/tombs_w_images.txt`;
  const fileData = fs.readFileSync(text, 'utf-8');

    const hrefs = fileData.split('\n');

  for (let i = 0; i < hrefs.length; i++) {
    
    const tombHref = await utils.scrapeTombHrefs(hrefs[i]);
    for (let j = 0; j < tombHref.length; j++) {
      const folioData = await utils.scrapeFolioData(tombHref[j]);
      console.log(folioData, 'scraped')
      utils.appendToCSVFile('data.csv', folioData);
      console.log(folioData.firstImgUrl, 'added to csv')
    }
  }

}

mkMorganCSV();