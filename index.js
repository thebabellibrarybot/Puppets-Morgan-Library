const utils = require('./src/utils/pup.js');

const url = 'https://www.themorgan.org/manuscripts/list';

async function mkMorganXML() {

  const hrefs = await utils.scrapeMorganTable(url);

  for (let i = 0; i < hrefs.length; i++) {
    const tombHref = await utils.scrapeTombHrefs(hrefs[i]);
    for (let j = 0; j < tombHref.length; j++) {
      const folioData = await utils.scrapeFolioData(tombHref[j]);
      utils.appendToCSVFile('data.csv', folioData);
      console.log(folioData.firstImgUrl, 'added to csv')
    }
  }

}

mkMorganXML();