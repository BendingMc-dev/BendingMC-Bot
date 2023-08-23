const path = require("path");
const fs = require("fs");

function getFiles(path) {
    let files = [];
    let dirents = fs.readdirSync(path, {withFileTypes: true});

    for (let dirent of dirents) {
        console.log("(all) file name: " + dirent.name);

        // check if dirent is file
        let isFile = dirent.isFile();
        if (!isFile) continue;

        files.push(dirent);
    }

    return files;
}

module.exports = (client) => {
    // get all files in a folder
    // for each file, require a function inside of it
    
    let folderPath = path.join(__dirname, "bot_modules");

    console.log("folder path: " + folderPath);

    let files = getFiles(folderPath);

    for (let file of files) {
        // console.log("file name: " + file.name);
    }
}