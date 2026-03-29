const fs = require('fs');

try {
    const content = fs.readFileSync('server/index.js'); // Read as buffer to avoid encoding issues initially
    const contentStr = content.toString('utf-8'); // Try utf-8
    const lines = contentStr.split(/\r?\n/);

    const startIndex = lines.findIndex(l => l.includes('app.listen(PORT'));
    if (startIndex !== -1) {
        // Keep lines up to startup log + closing brace
        // Line 1: app.listen...
        // Line 2: console.log...
        // Line 3: });

        // We will slice up to startIndex + 3
        const cleanLines = lines.slice(0, startIndex + 3);
        const cleanContent = cleanLines.join('\n');

        fs.writeFileSync('server/index.js', cleanContent, 'utf-8');
        console.log('Fixed server/index.js');
    } else {
        console.error('Could not find app.listen block');
    }
} catch (e) {
    console.error('Error fixing file:', e);
}
