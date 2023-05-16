const { Client, IntentsBitField, Partials, Events } = require('discord.js');
// const keepAlive = require("./server.js");
const space = require("./space.js");
const suggestions = require("./modules/suggestions.js");
require('dotenv').config();

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildMessageReactions
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction
	]
});

// Debug message event listener
client.on(Events.MessageCreate, msg =>{
	if (msg.author.id === client.user.id){
		return
	}
	
	if (msg.content === "ping"){
		msg.reply("pong!");
	}
})

// Execute modules here
suggestions.newSuggestion(client, Events);
suggestions.resolveSuggestion(client, Events);
space.ping(client, Events);

// Log in
client.login(process.env.BOT_TOKEN);