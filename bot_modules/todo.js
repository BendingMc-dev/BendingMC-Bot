/*
    when user sends message with prefix ("?todo"), extract the content of the message
    if the channel already has a todo stored, add the message content to the todo
    if no message content, display the todo of the channel
*/
const mysql = require("../utils/mysql-manager.js");

const prefix = "?todo";

const database = {
    table: "",
    columns: new Map([
        ["key","value"],
    ]),
}

exports.onTodoMessage = (client, Events) => {
    client.on(Events.MessageCreate, msg =>{
        // check if message was sent by the bot
        if (msg.author.id === client.user.id) return;

        // check if message has prefix
        if (!msg.content.startsWith(prefix)) return;

        let channelId = msg.channel.id;

        // fetch data from database

        let channelTodo;

        if (!channelTodo) {
            // create todo
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
    })
}