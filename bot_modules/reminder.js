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
    const tableName = "Reminders";
    const createTableColumns = "Id TEXT, Author TEXT, Message TEXT, Channel TEXT";
    const tableColumns = "Id, Author, Message, Channel";

    mysql.createTable(tableName, createTableColumns);
    
    // make new db entry with msg author, channel id, and message
    const reminderId = Date.now();
    let insert = `'${reminderId}', '${msg.author.id}', '${msg.content}', '${msg.channel.id}'`;

    mysql.insert(insert, tableName, tableColumns);

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