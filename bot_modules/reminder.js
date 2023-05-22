const mysql = require("../utils/mysql-manager.js");

function setTimer(){

}

exports.setReminder = (client, msg) => { //FIXME implement event listener (onCommand(); case "reminder": onReminder()) and rename this to something like onReminder()
    // check if message was sent by the bot
    if (msg.author.id === client.user.id) return;
    
    let prefix = "?reminder"; //FIXME add global prefix ("?") and implement "command name"

    if (!msg.content.startsWith(prefix)) return;

    msg.reply("Setting reminder to 5 seconds.");

    // create reminders table
    console.log("Creating new table for reminders") //DEBUG

    const tableName = "Reminders";
    const tableColumns = "Id TEXT, Author TEXT, Message TEXT, Channel TEXT";

    mysql.createTable(tableName, tableColumns);
    
    // make new db entry with msg author, channel id, and message
    console.log("Inserting message author into db: " + msg.author.id); //DEBUG

    const reminderId = Date.now();
    let insert = `${reminderId}, ${msg.author.id}, ${msg.content}, ${msg.channel.id}`;

    mysql.insert(insert, tableName);

    console.log("Checking if entry was inserted correctly. Id of reminder: " + reminderId);
    let entry = mysql.fetch(reminderId, tableName);
    console.log("Fetched entry: " + entry);

    // set timer
    // when timer is up, ping author in channel with message content

    let duration = 5;

    let interval = setInterval(() =>{
        duration--;

        if (duration == 0){
            msg.reply("This is a reminder!");
            clearInterval(interval);
        }
    }, 1000);
}