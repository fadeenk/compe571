const fs = require('fs');

const buf = Buffer.alloc(500000000, 'Why do programmers always mix up Halloween and Christmas? Because Oct 31 == Dec 25');
// Save with a buffer as content from a base64 image
fs.writeFile('sampleFile', buf, (err) => {
    if (err) throw err;

    console.log("The file was succesfully saved!");
});
