const fs = require('node:fs');
const path = require('node:path');
const { Collection, Events, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');

const config = {
    commandsFolder: "bot_commands"
}

function getCommands() {
    const commandsFolder = path.join(__dirname, config.commandsFolder);
    const commandFiles = fs.readdirSync(commandsFolder).filter(file => file.endsWith('.js'));
    const commands = [];

    for (const file of commandFiles) {
        const filePath = path.join(commandsFolder, file);
        const command = require(filePath);
        
        commands.push(command);
    }

    return commands;
}

module.exports.registerCommands = (client) => {
    const botCommands = getCommands();
    client.commands = new Collection();

    for (const botCommand of botCommands) {
        const command = new SlashCommandBuilder();
        let commandName = botCommand.getName();
        let commandDescription = botCommand.getDescription();

        command.setName(commandName);
        command.setDescription(commandDescription);

        client.commands.set(commandName, command);
    }
}

module.exports.executeCommand = async (client, interaction) => {
    let interactionName = interaction.commandName;
    const command = client.commands.get(interactionName);

    if (!command) return;

    await command.execute(interaction);
}