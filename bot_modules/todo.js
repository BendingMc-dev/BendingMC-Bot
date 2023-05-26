/*
    when user sends message with prefix ("?todo"), extract the content of the message
    if the channel already has a todo stored, add the message content to the todo
    if no message content, display the todo of the channel
*/
const mysql = require("../utils/mysql-manager.js");

const prefix = "?todo "; // added whitespace -> '?todo '

const database = { //FIXME create a new class in another file to handle database info of modules. New class constructor takes in table name and map of columns. Include function to output columns in query format
    table: "ChannelTodo",
    columns: new Map([
        ["Id","TEXT"],
        ["Todo","TEXT"],
    ]),
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
            console.log("Table columns: " + key + " " + value); //DEBUG
            if (tableColumns) {
                tableColumns += `, ${key} ${value}`;
            } else {
                tableColumns += `${key} ${value}`;
            }
        })

        console.log("Table columns in query would be: " + tableColumns); //DEBUG

        // fetch data from database

        let channelTodo;

        if (!channelTodo) {
            // create todo
            console.log("Creating todo entry for channel"); //DEBUG
        }


        let content = msg.content.split(prefix)[1];
        console.log("Message is: " + content); //DEBUG

        // check if message content exists after removing prefix
        if (!content) {
            // display todo of channel
            console.log("Displaying todo of channel") //DEBUG
        } else {
            // add todo to channel
            console.log("Adding new todo item to channel") //DEBUG
        }

        //FIXME add a way to remove todo item (at the start of each todo item, add a number as an id)
        //FIXME create embed manager
    })
}