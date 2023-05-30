const fs = require('fs');
const path = require('path');

exports.readFile = (file) =>{
    const data = fs.readFileSync(file, (err) =>{
        if (!err) return;

        console.log("There was an error while saving a json file");
        console.log(err);
    });

    return JSON.parse(data);
}

exports.fileExists = (file) =>{
    return fs.existsSync(file);
}

exports.makeDir = (dir) => {
    fs.mkdirSync(dir, {recursive: true}, (err) =>{
        if (!err) return;

        console.log("There was an error while making a directory");
        console.log(err);
    });

    console.log(`New directory created: ${dir}`)
}

exports.saveFile = (file, data = "") =>{
    // const dirname = path.dirname(file);

    // if (!this.fileExists(dirname))
    //     this.makeDir(dirname);

    fs.writeFile(file, data, (err) =>{
        if (!err) return;

        console.log("There was an error while saving a json file");
        console.log(err);
    });

    console.log(`New file created: ${file}`);
}