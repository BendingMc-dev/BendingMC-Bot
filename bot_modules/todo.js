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
        this.columns.forEach((value, key, map) => {
            let tableColumns = "";

            if (!tableColumns) {
                tableColumns += `${key}`;
            } else {
                tableColumns += `, ${key}`;
            }

            return tableColumns;
        })
    }
}

exports.newTodo = (client, Events) => {
    client.on(Events.MessageCreate, msg =>{
        // check if message was sent by the bot
        if (msg.author.id === client.user.id) return;

        // check if message has prefix
        if (!msg.content.startsWith(prefix)) return;

        let channelId = msg.channel.id;

        // create table in database
        let tableColumns = "";

        database.columns.forEach((value, key, map) => {
            if (tableColumns) {
                tableColumns += `, ${key} ${value}`;
            } else {
                tableColumns += `${key} ${value}`;
            }
        })

        mysql.createTable(database.table, tableColumns);

        // fetch todo of channel from database
        let channelTodo = mysql.fetch(channelId, database.table);
        console.log("Channel Todo: " + channelTodo[0].Todo);

        // check if channel has a todo list
        if (!channelTodo) {
            // create todo
            console.log("Channel does not have todo, creating new entry in database"); //DEBUG

            mysql.insert(`${channelId}, ""`, database.table, database.getColumnNames());

            // console.log("Columns of database: " + columnNames) //DEBUG

            // mysql.insert()
        }

        let content = msg.content.split(prefix)[1];
        console.log("Message is: (" + content + ")"); //DEBUG

        // check if message content exists after removing prefix
        if (!content) {
            // display todo of channel
            console.log("Todo command has no content. Displaying todo of channel") //DEBUG
        } else {
            // add todo to channel
            console.log("Todo command has content. Adding new todo item to channel") //DEBUG
        }

        //FIXME add a way to remove todo item (at the start of each todo item, add a number as an id)
        //FIXME create embed manager
    })
}