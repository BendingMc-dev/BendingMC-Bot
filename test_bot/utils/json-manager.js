const fs = require('fs');
const path = require('path');

exports.saveFile = (file, data = "") =>{
    try {
        fs.writeFileSync(file, data);
        console.log(`New file created: ${file}`);
    } catch (err) {
        console.error("There was an error while saving a json file");
        console.error(err);
    }

}

exports.readFile = (file) =>{

}

exports.fileExists = (file) =>{
    return fs.existsSync(file);
}

exports.makeDir = (dir) => {
    fs.mkdirSync(dir, {recursive: true}, (err) =>{
        if (err){
            console.error("There was an error while making a directory");
            console.error(err);
        } else {
            console.log(`New directory created: ${dir}`)
        }
    });
}