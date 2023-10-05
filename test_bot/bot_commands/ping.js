class PingCommand extends Command {
    constructor(name, description) {
        super(name, description);
    }

    async execute(interaction) {
        await interaction.reply("Pong!");
    }
}

module.exports = () => {
    return new PingCommand("ping", "testing command");
}