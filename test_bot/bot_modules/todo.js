/*
    when user sends message with prefix ("?todo"), extract the content of the message
    if the channel already has a todo stored, add the message content to the todo
    if no message content, display the todo of the channel
*/
const mysql = require("../utils/mysql-manager.js");

const prefix = "?todo";

const database = { //FIXME create a new class in another file to handle database info of modules. New class constructor takes in table name and map of columns. Include function to output columns in query format
    table: "ChannelTodo",
    columns: new Map([
        ["Id","TEXT"],
        ["Todo","TEXT"],
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

function getChannelEntry(channelId){
    mysql.fetch(channelId, database.table).then((entry) =>{ 
        return entry;
    });
}

function createDBEntry(channelId){
    return new Promise( (resolve) =>{
        // fetch channel entry from database as 'entry'
        mysql.fetch(channelId, database.table).then((entry) =>{
            // console.log("Channel Todo: " + entry[0].Id); //DEBUG

            // check if channel has an entry in the database
            if (!entry.length) {
                console.log("Channel does not have todo, creating new entry in database"); //DEBUG

                mysql.insert(`${channelId}, ""`, database.table, database.getColumnNames()).then( () =>{
                    resolve();
                })

                // console.log("Columns of database: " + columnNames) //DEBUG
            } else {
                console.log("Channel already has entry. Skipping"); //DEBUG
            }
            
            resolve();
        });
    })
}

exports.newTodo = (client, Events) => {
    client.on(Events.MessageCreate, msg =>{
        // check if message was sent by the bot
        if (msg.author.id === client.user.id) return;

        // check if message has prefix
        if (!msg.content.startsWith(prefix)) return;

        console.log("--------- Start of Log ---------"); //DEBUG

        let channelId = msg.channel.id;

        // create table in database
        let tableColumns = "";

        database.columns.forEach((value, key, map) => { //FIXME put into function (create table)
            if (tableColumns) {
                tableColumns += `, ${key} ${value}`;
            } else {
                tableColumns += `${key} ${value}`;
            }

            // tableColumns += `${key} ${value}` (? :) 
        })

        mysql.createTable(database.table, tableColumns);

        createDBEntry(channelId).then(() =>{
            // fetch channel entry from database as 'entry'
            mysql.fetch(channelId, database.table).then((entry) =>{ //FIXME put into function (add/display todo)
                console.log("Channel entry: " + entry) //DEBUG
                console.log("Channel entry[0].Id: " + entry[0].Id) //DEBUG
                
                let channelTodo = entry[0].Todo;
                let content = msg.content.split(prefix + " ")[1];
                // let regex = new RegExp("(\', \", \`)");

                content = content.replaceAll("\\", "\\\\");
                content = content.replaceAll("\"", "\\\"");
                console.log("Message is: (" + content + ")"); //DEBUG

                // check if message content exists after removing prefix
                if (!content) {
                    //FIXME display todo of channel
                    console.log("Todo command has no content. Displaying todo of channel."); //DEBUG
                    console.log("Channel todo: " + channelTodo); //DEBUG
                } else {
                    //FIXME add todo to channel
                    console.log("Todo command has content. Adding new todo item to channel") //DEBUG
                    channelTodo += `"${content}",`;
                    mysql.update(database.table, "Todo", channelTodo, channelId);
                }

                //FIXME add a way to remove todo item (at the start of each todo item, add a number as an id)
                //FIXME create embed manager
            });
        })
    })
}