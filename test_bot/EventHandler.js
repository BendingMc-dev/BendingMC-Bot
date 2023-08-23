const path = require("path");
const fs = require("fs");

/* 
    options = {
        foldersOnly: bool, - only returns folders
        customPath: any, - if defined, return files with the defined path instead of full path
    }
*/
function getFiles(directory, options) {
    let files = [];
    let dirents = fs.readdirSync(directory, {withFileTypes: true});

    for (let dirent of dirents) {
        let filePath;
        let customPath = options.customPath;
        
        // if customPath is set, return files with that path instead of the full path
        let isCustomPath = customPath != null;
        if (isCustomPath) {
            filePath = customPath + "/" + dirent.name;
        } else {
            filePath = path.join(directory, dirent.name);
        }

        // if folders only is true, this function will only return folders. Otherwise, it will only return file paths
        let foldersOnly = options.foldersOnly === true;
        if (foldersOnly) {
            let isFolder = dirent.isDirectory();
            if (!isFolder) continue;

            files.push(filePath);
        } else {
            let isFile = dirent.isFile();
            if (!isFile) continue;

            files.push(filePath);
        }
    }

    return files;
}

module.exports = (client) => {
    // get all files in a folder
    // for each file, require a function inside of it
    
    // const modulesFolder = "bot_modules";
    const folderPath = path.join(__dirname, "bot_modules");
    const modulesPath = "./bot_modules";
    
    // console.log(`Dirname: (${__dirname}). Concat: ${__dirname + "/" + modulesFolder}`);

    let moduleFolders = getFiles(folderPath, {foldersOnly: true, customPath: modulesPath});

    for (let folder of moduleFolders) {
        let files = getFiles(folderPath, {customPath: modulesPath});

        for (let file of files) {
            console.log("file: " + file);

            let module = require(file);

            module.main();
        }
    }
}