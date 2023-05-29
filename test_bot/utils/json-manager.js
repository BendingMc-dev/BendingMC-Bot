const fs = require('fs');

exports.saveFile = (path, data = "") =>{
    try {
        fs.writeFileSync(path, data);
    } catch (err) {
        console.error("There was an error while saving a json file");
        console.error(err);
    }

    console.log(`New file created: ${path}`);
}

exports.readFile = (path) =>{

}

exports.fileExists = (path) =>{
    return fs.existsSync(path);
}