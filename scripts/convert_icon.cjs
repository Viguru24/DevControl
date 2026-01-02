const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

// Fix path: go up one level from scripts to root, then public
const inputFile = path.join(__dirname, '..', 'public', 'icon.png');
const outputFile = path.join(__dirname, '..', 'public', 'icon.ico');

console.log(`Converting ${inputFile} to ${outputFile}...`);

// Handle potential default export
const converter = pngToIco.default || pngToIco;

if (typeof converter !== 'function') {
    console.error('png-to-ico export is not a function:', converter);
    process.exit(1);
}

converter(inputFile)
    .then(buf => {
        fs.writeFileSync(outputFile, buf);
        console.log('Successfully created icon.ico');
    })
    .catch(err => {
        console.error('Error converting icon:', err);
        process.exit(1);
    });
