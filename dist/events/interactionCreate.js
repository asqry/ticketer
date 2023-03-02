"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = require("../commands");
class InteractionCreate {
    client;
    enabled;
    constructor(client) {
        this.client = client;
        this.enabled = true;
    }
    async run(interaction) {
        let client = this.client;
        if (!client.user || !client.application)
            return;
        if (!interaction)
            return;
        if (interaction.isAutocomplete())
            await handleAutoComplete(client, interaction);
        if (interaction.isCommand())
            await handleSlashCommand(client, interaction);
    }
}
exports.default = InteractionCreate;
const handleSlashCommand = async (client, interaction) => {
    const command = commands_1.Commands.find(c => c.name === interaction.command?.name);
    if (!command) {
        interaction.reply({ ephemeral: true, content: "An error occurred." });
        return;
    }
    command.run(client, interaction);
};
const handleAutoComplete = async (client, interaction) => {
    if (interaction.commandName === 'settings') {
        let apiCommand = interaction.client.application.commands.cache.get(interaction.commandId);
        let command = Object.values(require(`../commands/${apiCommand?.name}`))[0];
        if (!command)
            return;
        if (command.autocomplete)
            await command.autocomplete(interaction);
    }
};
