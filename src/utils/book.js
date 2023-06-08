const fs = require('fs');
const csv = require('csv-parser');

const countries = [
    // Europe
    'Albania',
    'East Anglia',
    'Andorra',
    'Armenia',
    'Austria',
    'Azerbaijan',
    'Belarus',
    'Belgium',
    'Bosnia and Herzegovina',
    'Bulgaria',
    'Croatia',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Estonia',
    'Finland',
    'France',
    'Georgia',
    'Germany',
    'Greece',
    'Hungary',
    'Iceland',
    'Ireland',
    'Italy',
    'Kazakhstan',
    'Kosovo',
    'Latvia',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Malta',
    'Moldova',
    'Monaco',
    'Montenegro',
    'Netherlands',
    'North Macedonia',
    'Norway',
    'Poland',
    'Portugal',
    'Romania',
    'Russia',
    'San Marino',
    'Serbia',
    'Slovakia',
    'Slovenia',
    'Spain',
    'Sweden',
    'Switzerland',
    'Turkey',
    'Ukraine',
    'United Kingdom',
    'Vatican City',
  
    // East Europe
    'Albania',
    'Bosnia and Herzegovina',
    'Bulgaria',
    'Croatia',
    'Czech Republic',
    'Estonia',
    'Hungary',
    'Kosovo',
    'Latvia',
    'Lithuania',
    'Montenegro',
    'North Macedonia',
    'Poland',
    'Romania',
    'Russia',
    'Serbia',
    'Slovakia',
    'Slovenia',
    'Ukraine',
  
    // Mediterranean
    'Albania',
    'Algeria',
    'Cyprus',
    'Egypt',
    'France',
    'Greece',
    'Israel',
    'Italy',
    'Lebanon',
    'Libya',
    'Malta',
    'Monaco',
    'Montenegro',
    'Morocco',
    'Slovenia',
    'Spain',
    'Syria',
    'Tunisia',
    'Turkey',
    'England',
  
    // Middle East
    'Bahrain',
    'Cyprus',
    'Egypt',
    'Iran',
    'Iraq',
    'Israel',
    'Jordan',
    'Kuwait',
    'Lebanon',
    'Oman',
    'Palestine',
    'Qatar',
    'Saudi Arabia',
    'Syria',
    'Turkey',
    'United Arab Emirates',
    'Yemen'
  ];
  

// gets locations
function extractCountry(str) {
    const lowerCaseStr = str.toLowerCase();
    const matchingCountries = countries.filter((country) =>
      lowerCaseStr.includes(country.toLowerCase())
    );
  
    if (matchingCountries.length > 0) {
      // Return the first matching country found
      const found = matchingCountries[0];
      const text = str.split(found)[0];
      return {found, text}
    }
    const found = '';
    const text = str.split('/')[0];
    return {found, text}; // No country found
  }
  

// turns substring into date
function findCenturyPhrases(str) {
    const centuryRegex = /\b(\d+)(?:st|nd|rd|th)\s+century\b/gi;
    const yearRegex = /\b(\d{4})\b/g;
    
    const centuryMatches = str.match(centuryRegex) || [];
    const yearMatches = str.match(yearRegex) || [];
  
    const replacedPhrases = centuryMatches.map(match => {
      const centuryNumber = parseInt(match.match(/\d+/)[0]);
      const year = (centuryNumber - 1) * 100;
      return year.toString();
    });
  
    return [...replacedPhrases, ...yearMatches];
  }
  

// gets the substring after ca/ aka the date
function getSubstringAfterCa(str) {
    const caIndex = str.indexOf('ca/');
    if (caIndex !== -1) {
      return findCenturyPhrases(str.substring(caIndex + 3));
    } else {
      return findCenturyPhrases(str);
    }
  }

// cleans the tomb_text for MS"
function splitAndRemoveMS(str) {
    const splitIndex = str.indexOf('MS ');
      const splitString = str.substring(0, splitIndex);
      return splitString;
  }
  

// Reads a CSV file and processes each row
function processCSVFile(filePath, outfile) {

    const editedRows = [];
    fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
        // Process each row of the CSV file
        const tomb_id = row.tombId;
        const clean = splitAndRemoveMS(row.tomb_text);
        const book_date = getSubstringAfterCa(clean).join(',');
        const foundInfo = extractCountry(clean);
        const book_location = foundInfo.found;
        const book_type = foundInfo.text;
        // Perform additional operations on the row as needed
        editedRows.push({ tomb_id, book_date, book_location, book_type });
    })
    .on('end', () => {
        console.log('Finished processing the CSV file');
        if (!fs.existsSync(outfile)) {
            console.log('File does not exist, creating new file')
            const header = 'tomb_id,book_type,book_location,book_date\n';
            fs.writeFileSync(outfile, header);
            // Write the edited rows to the output file
            editedRows.forEach((row) => {
                const csvRow = `${row.tomb_id},${row.book_type},${row.book_location},${row.book_date}\n`;
                console.log(row, 'row');
              
                const fileData = fs.readFileSync(outfile, 'utf8');
                if (!fileData.includes(row.tomb_id)) {
                  fs.appendFileSync(outfile, csvRow);
                  console.log(`Data appended to ${outfile}`);
                } else {
                  console.log(`Skipped appending data for tomb_id ${row.tomb_id} as it already exists in the CSV file`);
                }
              });
        }
    })
    .on('error', (error) => {
        console.error('An error occurred while processing the CSV file:', error);
    });
}

// Usage example
const filePath = '../../data.csv';
const outfile = 'book.csv';
processCSVFile(filePath, outfile);