const fs = require('fs');
const data = 'Why do programmers always mix up Halloween and Christmas? Because Oct 31 == Dec 25';
const buf = Buffer.alloc(500000000, data);
// Save with a buffer as content from the data string
fs.writeFile('sampleFile', buf, (err) => {
    if (err) throw err;
    console.log("The file was succesfully saved!");
});
