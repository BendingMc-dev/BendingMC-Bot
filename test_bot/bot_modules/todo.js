/*
    when user sends message with prefix ("?todo"), extract the content of the message
    if the channel already has a todo stored, add the message content to the todo
    if no message content, display the todo of the channel
*/
const mysql = require("../utils/mysql-manager.js");
const fs = require("../utils/json-manager.js");

const prefix = "?todo";

const database = { //FIXME create a new class in another file to handle database info of modules. New class constructor takes in table name and map of columns. Include function to output columns in query format
    table: "ChannelTodo",
    columns: new Map([
        ["Id","TEXT"],
        ["Todo","JSON"],
    ]),

    getColumnNames: function (){
        let tableColumns = "";
        
        this.columns.forEach((value, key, map) => {
            if (!tableColumns) {
                tableColumns += `${key}`;
            } else {
                tableColumns += `, ${key}`;
            }
        });

        return tableColumns;
    }
}

const files = {
    // mainPath: __dirname + "/data/todo-lists/"
    // mainPath: "data/"
    mainPath: "data/test/todo_lists/"
}

class TodoList{
    toJSON(){
        return {
            todo: []
        }
    }
}

class TodoItem {
    constructor(count, content){
        this.count = count;
        this.content = content;
    }

    toJSON() {
        return  {
            count: this.count,
            content: this.content
        }
    }
}

exports.newTodo = (client, Events) =>{
    client.on(Events.MessageCreate, msg =>{
        // check if message was sent by the bot
        if (msg.author.id === client.user.id) return;

        // check if message has prefix
        if (!msg.content.startsWith(prefix)) return;

        console.log("--------- Start of Log ---------"); //DEBUG

        const channelId = msg.channel.id;
        const dirName = files.mainPath;
        const fileName = channelId + ".json";
        const filePath = dirName + fileName;

        // check if folder exists
        if (!fs.fileExists(filePath)){
            fs.makeDir(dirName);

            const todoList = new TodoList();
            let jsonTodoList = JSON.stringify(todoList);
            console.log("New file created with the json: " + jsonTodoList); //DEBUG

            fs.saveFile(filePath, jsonTodoList);
        }

        // check if message exists
        let messageContent = (msg.content.split(prefix + " ")[1] === undefined ? msg.content.split(prefix)[1] : msg.content.split(prefix + " ")[1]);

        const fileContent = fs.readFile(filePath);

        if (messageContent){
            console.log("Message has todo item. Saving todo in file"); //DEBUG
            const todoItem = new TodoItem(1, messageContent);
            let jsonTodoItem = JSON.stringify(todoItem);
            let newFileContent = fileContent.todo.push(jsonTodoItem);
            let jsonFileContent = JSON.stringify(fileContent);
            console.log("Object as json is: " + jsonTodoItem);
            console.log("Writing file with json: " + newFileContent);
            fs.saveFile(filePath, jsonFileContent);
            // send message in channel
        } else {
            console.log("Message does not have todo item. Displaying todo list of channel"); //DEBUG
            for (let todoItem of fileContent.todo){
                console.log("Todo item of channel: " + todoItem.count + " -> " + todoItem.content);
            }
            // read file
            // send message in channel
        }

        // send response

        console.log("--------- End of Log ---------"); //DEBUG
        console.log(" "); //DEBUG
    })    
}

// exports.newTodos = (client, Events) => {
//     client.on(Events.MessageCreate, msg =>{
//         // check if message was sent by the bot
//         if (msg.author.id === client.user.id) return;

//         // check if message has prefix
//         if (!msg.content.startsWith(prefix)) return;

//         console.log("--------- Start of Log ---------"); //DEBUG

//         let channelId = msg.channel.id;

//         // create table in database
//         let tableColumns = "";

//         database.columns.forEach((value, key, map) => { //FIXME put into function (create table)
//             if (tableColumns) {
//                 tableColumns += `, ${key} ${value}`;
//             } else {
//                 tableColumns += `${key} ${value}`;
//             }

//             // tableColumns += `${key} ${value}` (? :) 
//         })

//         mysql.createTable(database.table, tableColumns).then( ()=>{
//             createDBEntry(channelId).then(() =>{
//                 // fetch channel entry from database as 'entry'
//                 mysql.fetch(channelId, database.table).then((entry) =>{ //FIXME put into function (add/display todo)
//                     // console.log("Channel entry: " + entry) //DEBUG
//                     // console.log("Channel entry[0].Id: " + entry[0].Id) //DEBUG
                    
//                     // let channelTodo = entry[0].Todo;
//                     // let content = (msg.content.split(prefix + " ")[1] === undefined ? msg.content.split(prefix)[1] : msg.content.split(prefix + " ")[1]);
//                     // // let regex = new RegExp("(\', \", \`)");

//                     // content = content.replaceAll("\\", "\\\\");
//                     // content = content.replaceAll("\"", "\\\"");
//                     // console.log("Message is: (" + content + ")"); //DEBUG

//                     // // check if message content exists after removing prefix
//                     // if (!content) {
//                     //     //FIXME display todo of channel
//                     //     console.log("Todo command has no content. Displaying todo of channel."); //DEBUG
//                     //     console.log("Channel todo: " + channelTodo); //DEBUG
//                     // } else {
//                     //     //FIXME add todo to channel
//                     //     console.log("Todo command has content. Adding new todo item to channel") //DEBUG
//                     //     channelTodo += `"${content}",`;
//                     //     mysql.update(database.table, "Todo", channelTodo, channelId);
//                     // }

//                     let messageContent = (msg.content.split(prefix + " ")[1] === undefined ? msg.content.split(prefix)[1] : msg.content.split(prefix + " ")[1]);

//                     if (!messageContent){
//                         //FIXME display todo of channel
//                         console.log("message doesn't have any todo items. Displaying channel todo: " + entry[0].Todo); //DEBUG
//                     } else {
//                         //FIXME add todo item to channel
//                         console.log("message has todo item. Adding item to the database"); //DEBUG
//                         let todoItem = new TodoItem(1, messageContent);
//                         let jsonTodoItem = JSON.stringify(todoItem);
//                         console.log("Todo item object as json: " + jsonTodoItem); //DEBUG
//                     }

//                     //FIXME add a way to remove todo item (at the start of each todo item, add a number as an id)
//                     //FIXME create embed manager
//                 });
//             })
//         })
//     })
// }