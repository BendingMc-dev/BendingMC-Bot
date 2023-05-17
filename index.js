const { Client, IntentsBitField, Partials, Events, Channel } = require('discord.js');
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

const ERROR_OUTPUT_CHANNEL_ID = "485946253931446287";

// Execute modules here
suggestions.test(client, Events);
suggestions.resolveSuggestion(client, Events);
space.ping(client, Events);

// Log in
const BOT_TOKEN = process.env.BOT_TOKEN;
client.login(BOT_TOKEN);

// Start console message
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});