exports.ping = (client, Events) =>{
    // Debug message event listener
    client.on(Events.MessageCreate, msg => {
        if (msg.content === "bot") {
            msg.reply("yes?");
        }
    })
}