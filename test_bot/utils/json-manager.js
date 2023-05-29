const fs = require('fs');
const path = require('path');

exports.saveFile = (file, data = "") =>{
    try {
        const dirname = path.dirname(file);

        // check if directory of file exists
        if (!this.fileExists(dirname)){
            fs.mkdirSync(dirname, {recursive: false}, (err) =>{
                console.error("There was an error while making a directory");
                console.error(err);
            });

            console.log("Creating folder for file");
        }

        // write file
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