const fs = require('fs');

exports.saveFile = () =>{

}

exports.loadFile = () =>{

}

exports.fileExists = (path) =>{
    try {
        const data = fs.readFileSync(path);
    } catch (err) {
        console.log("There was an error while fetching a json file: " + err);
    }

    const obj = JSON.parse(data);

    console.log("Json object retreieved: " + obj);

    return obj !== null;
}