const fs = require('fs');
const path = require('path');

exports.saveFile = (file, data = "") =>{
    try {
        fs.writeFileSync(file, data);
    } catch (err) {
        console.error("There was an error while saving a json file");
        console.error(err);
    }

    console.log(`New file created: ${file}`);
}

exports.readFile = (file) =>{

}

exports.fileExists = (file) =>{
    return fs.existsSync(file);
}

exports.makeDir = (dir) => {
    fs.mkdirSync(dir, {recursive: false}, (err) =>{
        console.error("There was an error while making a directory");
        console.error(err);
    });

    console.log(`New directory created: ${dir}`);
}