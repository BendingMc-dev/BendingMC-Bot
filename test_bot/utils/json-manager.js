const fs = require('fs');

exports.saveFile = (file, data = "") =>{
    try {
        const dirname = path.dirname(file);

        // check if directory of file exists
        if (!fileExists(dirname)){
            fs.mkdirSync(dirname, {recursive: false}, (err) =>{
                console.error("There was an error while making a directory");
                console.error(err);
            });
        }

        // write file
        fs.writeFileSync(file, data);
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