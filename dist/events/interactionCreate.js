"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("dotenv/config");
const discord_js_1 = require("discord.js");
const commands_1 = require("../commands");
const utils_1 = tslib_1.__importStar(require("../utils"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const random_string_1 = tslib_1.__importDefault(require("random-string"));
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
        if (interaction.isButton())
            await handleButtonPress(client, interaction);
    }
}
exports.default = InteractionCreate;
const generateId = () => {
    let id = (0, random_string_1.default)({ length: 12, special: false, numeric: true, letters: true });
    return id;
};
const handleSlashCommand = async (client, interaction) => {
    const command = commands_1.Commands.find(c => c.name === interaction.command?.name);
    if (!command) {
        interaction.reply({ ephemeral: true, content: "An error occurred." });
        return;
    }
    if (!interaction.guild) {
        console.log();
        interaction.reply({ content: `Commands in DMs are not supported. Please re-run this command in a server. \n\n**Command Ran**: </${interaction.commandName} ${interaction.options.data[0].name}:${interaction.command?.id}>` });
        return;
    }
    command.run(client, interaction);
};
const handleAutoComplete = async (client, interaction) => {
    let apiCommand = interaction.client.application.commands.cache.get(interaction.commandId);
    let command = Object.values(require(`../commands/${apiCommand?.name}`))[0];
    if (!command)
        return;
    if (command.autocomplete)
        await command.autocomplete(interaction);
};
const handleButtonPress = async (client, interaction) => {
    let customId = interaction.customId;
    if (!customId)
        return;
    if (customId.match(/user\_[1-9].*/gim) && interaction.user.id !== customId.split(/user\_/gim)[1]) {
        interaction.reply({ ephemeral: true, embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, 'This is not your button')] });
        return;
    }
    else {
        let baseURL = process.env.API_URL;
        if (customId.startsWith('open-')) {
            let parsedPanel = customId.split("-");
            let action = parsedPanel[0];
            let panelId = parsedPanel[1];
            let ticketType = parsedPanel[2];
            let ticketName = parsedPanel[3];
            let payload = {
                method: 'GET',
                baseURL,
                url: `/guilds/${interaction.guildId}/panels/${panelId}`,
                headers: {
                    'x-auth-token': process.env.TOKEN,
                    'Content-Type': 'application/json'
                },
            };
            (0, axios_1.default)(payload).then(async (response) => {
                let panel = response.data.data.data;
                if (!panel)
                    return interaction.reply({
                        ephemeral: true,
                        embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, `An error occured. Please contact support.`)]
                    });
                interaction.guild?.channels.create({ name: `ticket-${generateId()}`, parent: panel.ticketParentChannel, permissionOverwrites: [{ type: discord_js_1.OverwriteType.Role, id: interaction.guild.id, deny: [discord_js_1.PermissionFlagsBits.ViewChannel] }, { type: discord_js_1.OverwriteType.Role, id: panel.defaultRole, allow: [discord_js_1.PermissionFlagsBits.ViewChannel] }] }).then(c => {
                    interaction.reply(`${c}`);
                });
            }).catch(async (err) => {
                await interaction.reply({
                    ephemeral: true,
                    embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, `An error occured. Please contact support.`)]
                });
            });
        }
    }
};
