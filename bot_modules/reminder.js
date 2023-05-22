function checkTimer(){

}

function setTimer(){

}

exports.setReminder = (client, msg) => { //FIXME implement event listener (onCommand(); case "reminder": onReminder()) and rename this to something like onReminder()
    // check if message was sent by the bot
    if (msg.author.id === client.user.id) return;
    
    let prefix = "?reminder"; //FIXME add global prefix ("?") and implement "command name"

    if (!msg.content.startsWith(prefix)) return;

    msg.reply("Setting reminder to 5 seconds.");

    let duration = 5;

    let interval = setInterval(() =>{
        duration--;

        if (duration == 0){
            msg.reply("This is a reminder!");
            clearInterval(interval);
        }
    }, 1000)
}