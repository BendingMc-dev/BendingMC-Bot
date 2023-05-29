const fs = require('fs');
const path = require('path');

exports.saveFile = (file, data = "") =>{
    const dirname = path.dirname(file);

    // check if directory of file exists
    if (!this.fileExists(dirname))
        this.makeDir(dirname);
    
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