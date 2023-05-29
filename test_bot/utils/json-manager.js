const fs = require('fs');

exports.saveFile = () =>{

}

exports.loadFile = () =>{

}

exports.fileExists = (path) =>{
    return fs.existsSync(path);
}