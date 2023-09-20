require('dotenv').config();
const { Client, IntentsBitField, Partials, Events, Channel } = require('discord.js');

exports.main = () => {
    console.log(`Initiating client...`);

    const client = buildClient();

    login(client);

    console.log(`Client ready! Logged in as ${client.user.tag}`);
}

exports.restart = async (client) => {
    let clientExists = client.isReady();

    if (!clientExists) return;

    await client.destroy();

    console.log("Client logged out.");

    this.main();
}

function buildClient() {
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

    return client;
}

async function login(client) {
    const BOT_TOKEN = process.env.TEST_BOT_TOKEN;

    console.log("(before await)"); //debug

    await client?.login(BOT_TOKEN);

    console.log("(after await)"); //debug
}

function registerEvents() {

}