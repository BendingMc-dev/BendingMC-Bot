const path = require("path");
const fs = require("fs");

module.exports = (client) => {
    // get all files in a folder
    // for each file, require a function inside of it
    
    let folderPath = path.join(__dirname, "bot_modules");

    console.log("folder path: " + folderPath);

    let files = fs.readdirSync(folderPath, {withFileTypes: true});

    for (let file of files) {
        console.log("name of file: " + file.name);
    }
}