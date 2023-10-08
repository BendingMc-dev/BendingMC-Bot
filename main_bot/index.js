const { Client, IntentsBitField, Partials, Events, Channel } = require('discord.js');
// const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');

const suggestions = require("./bot_modules/suggestions.js");
const bugreports = require("./bot_modules/bugreports.js");
// const reminder = require("./bot_modules/reminder.js");
const todo = require("./bot_modules/todo.js");

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
client.on(Events.MessageCreate, msg => {
	// let authorIsBera = msg.author.id === "316672056005492748";
	let memberExists = msg.member != null;

	if (!memberExists) return;
	
	let authorIsAuthorized = msg.member.roles.cache.has("398732282229293059");

	if (!authorIsAuthorized) return;

	// if (!authorIsBera) return;
	
	let messageExists = msg.content != null;

	if (!messageExists) return;

	let prefix = "?forward";
	let isForwardingMessage = msg.content.startsWith(prefix);

	if (!isForwardingMessage) return;

	let content = msg.content.split(/\?forward /)[1];
	let channelId = content.split(" ")[0];
	let message = content.split(/\d+ /)[1];

	let channel = client.channels.cache.get(channelId);
	let channelExists = channel != null;

	if (!channelExists) return;

	channel.send(message);
});

client.on(Events.MessageCreate, msg => {
	// let authorIsBera = msg.author.id === "316672056005492748";
	let memberExists = msg.member != null;

	if (!memberExists) return;
	
	let authorIsAuthorized = msg.member.roles.cache.has("398732282229293059");

	if (!authorIsAuthorized) return;
	
	let messageExists = msg.content != null;

	if (!messageExists) return;

	let prefix = "?bugryan";
	let isForwardingMessage = msg.content.startsWith(prefix);

	if (!isForwardingMessage) return;

	let content = msg.content.split(/\?bugryan /)[1];
	let channelId = content.split(" ")[0];
	let message = content.split(/\d+ /)[1];

	let channel = client.channels.cache.get(channelId);
	let channelExists = channel != null;

	if (!channelExists) return;

	const ryanUserId = "497240013051002890";

	channel.send("<@" + ryanUserId + "> " + message);

	const Ryan = client.users.cache.get(ryanUserId);
	let ryanExists = Ryan != null;

	if (!ryanExists) return;

	Ryan.send(message);
});

// client.on(Events.MessageCreate, msg => {
// 	let authorIsRyan = msg.author.id === "497240013051002890";

// 	if (!authorIsRyan) return;
	
// 	let messageExists = msg.content != null;

// 	if (!messageExists) return;

// 	// msg.reply("Shut up.");
// 	msg.author.send(msg.content);
// 	msg.author.send("Please just shut up.");
// 	msg.author.send("Please just shut up.");
// 	msg.author.send("Please just shut up.");
// }); 

client.on(Events.MessageCreate, msg =>{
	if (msg.author.id === client.user.id){
		return
	}

	if (msg.content === "ping"){
		msg.reply("pong!");
	}
})

// Execute modules based on events
//FIXME implement event manager
suggestions.resolveSuggestion(client, Events); //FIXME use the function after the event is triggered instead -> "on new message, function()"
bugreports.resolveBugReport(client, Events); //FIXME use the function after the event is triggered instead -> "on new message, function()"
todo.onTodoCommand(client, Events);

client.on(Events.MessageCreate, msg =>{
	suggestions.onNewSuggestion(client, msg);
	bugreports.onNewBugReport(client, msg);
	// reminder.setReminder(client, msg);
})

// Log in
const BOT_TOKEN = process.env.BOT_TOKEN;
client.login(BOT_TOKEN);

// Start console message
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});