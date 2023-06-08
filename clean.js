const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function removeDuplicates(inputFile, outputFile) {
  const seenFolios = new Set();
  const cleanedRows = [];

  // Read input CSV file and remove duplicates
  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', (row) => {
      const folio = row.folio;

      // Skip the row if the folio value has been seen before
      if (seenFolios.has(folio)) {
        return;
      }

      // Add the folio value to the set of seen folios
      seenFolios.add(folio);
      cleanedRows.push(row);
    })
    .on('end', () => {
      // Write cleaned data to output CSV file
      const csvWriter = createCsvWriter({
        path: outputFile,
        header: Object.keys(cleanedRows[0]).map((key) => ({ id: key, title: key })),
      });
      csvWriter
        .writeRecords(cleanedRows)
        .then(() => {
          console.log('Duplicates removed. Cleaned data saved to ' + outputFile);
        })
        .catch((error) => {
          console.error('Error writing cleaned data to CSV:', error);
        });
    });
}

// Usage example
removeDuplicates('data.csv', 'o_data.csv');
