const png2icons = require('png2icons');
const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'public', 'icon.png');
const outputFile = path.join(__dirname, '..', 'public', 'icon.ico');

async function processIcon() {
    console.log(`Processing ${inputFile}...`);
    try {
        const image = await Jimp.read(inputFile);

        // Resize to 256x256
        image.resize({ w: 256, h: 256 });
        const buffer = await image.getBuffer('image/png');

        const ico = png2icons.createICO(buffer, png2icons.BICUBIC, 0, false);
        if (ico) {
            fs.writeFileSync(outputFile, ico);
            console.log(`Successfully created ${outputFile}`);
        } else {
            console.error('Failed to create ICO (png2icons returned null)');
            process.exit(1);
        }
    } catch (err) {
        console.error("Error processing icon:", err);
        process.exit(1);
    }
}

processIcon();

