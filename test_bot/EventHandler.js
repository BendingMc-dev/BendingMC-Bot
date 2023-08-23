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
        let filePath = path.join(directory, dirent.name);
        let customPath = options.customPath;
        
        // if customPath is set, return files with that path instead of the full path
        let isCustomPath = customPath != null;
        if (isCustomPath) {
            let splitCustomPath = filePath.split(customPath)[1];
            filePath = "." + customPath + splitCustomPath;
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
    // const modulesFolder = "bot_modules";
    const folderPath = path.join(__dirname, "bot_modules");
    const modulesPath = "/bot_modules";
    
    // console.log(`Dirname: (${__dirname}). Concat: ${__dirname + "/" + modulesFolder}`);

    let moduleFolders = getFiles(folderPath, {foldersOnly: true, customPath: modulesPath});

    for (let folder of moduleFolders) {
        let files = getFiles(folderPath, {customPath: modulesPath});

        for (let file of files) {
            let fileName = file.split("/").pop();
            let botModule = require(file);

            try {
                botModule.main();
            } catch {
                console.log(`The module ${fileName} but had no 'main' function! At ${file}`);
            }
        }
    }
}