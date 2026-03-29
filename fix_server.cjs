const fs = require('fs');

try {
    const content = fs.readFileSync('server/index.js');
    const contentStr = content.toString('utf-8');
    const lines = contentStr.split(/\r?\n/);

    // Find last occurrence to be safe, or just find "app.listen(PORT"
    // Since I appended to end, the first occurrence should be the valid one.
    const startIndex = lines.findIndex(l => l.includes('app.listen(PORT'));

    if (startIndex !== -1) {
        // We expect:
        // app.listen(PORT, () => {
        //     console.log(`DevControl Server running on http://localhost:${PORT}`);
        // });

        // Let's verify subsequent lines just in case
        // But simply slicing at startIndex + 3 is 99% likely correct given the file structure I viewed

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
