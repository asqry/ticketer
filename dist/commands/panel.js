"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Panel = void 0;
const tslib_1 = require("tslib");
require("dotenv/config");
const axios_1 = tslib_1.__importDefault(require("axios"));
const discord_js_1 = require("discord.js");
const utils_1 = tslib_1.__importStar(require("../utils"));
const config_1 = tslib_1.__importDefault(require("../config"));
exports.Panel = {
    name: 'panel',
    description: 'Manage your server\'s ticket panels',
    options: [
        {
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            name: 'list',
            description: "List all panels in a server",
        },
        {
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            name: 'info',
            description: "Get information about a panel",
            options: [
                {
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    autocomplete: true,
                    name: 'panel_id',
                    description: 'The panel\'s id',
                    required: true
                }
            ]
        },
        {
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            name: 'create',
            description: "Create a new ticket panel",
        }
    ],
    run(client, interaction) {
        let baseURL = process.env.API_URL;
        let replace = {
            'role': '<@&[id]>',
            'channel': '<#[id]>'
        };
        let subCommand = interaction.options.data[0];
        if (!subCommand)
            return;
        if (subCommand.name === 'info') {
            let panelId = subCommand.options?.find(o => o.name.toLowerCase() === 'panel_id')?.value;
            let payload = {
                method: 'GET',
                baseURL,
                url: `/guilds/${interaction.guildId}/panels/${panelId}`,
                headers: {
                    'x-auth-token': process.env.TOKEN,
                    'Content-Type': 'application/json'
                },
            };
            (0, axios_1.default)(payload).then(response => {
                let panel = response.data.data.data;
                if (!panel)
                    return interaction.reply({
                        embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, `Could not find a panel with ID \`${panelId}\``)]
                    });
                let bb = [];
                bb.push(new discord_js_1.ButtonBuilder().setStyle(discord_js_1.ButtonStyle.Success).setCustomId(`send-${panel.id}-user_${interaction.user.id}`).setEmoji(config_1.default.messages.panel_embed_send_emoji).setLabel('Resend Embed'));
                bb.push(new discord_js_1.ButtonBuilder().setStyle(discord_js_1.ButtonStyle.Danger).setCustomId(`delete-${panel.id}-user_${interaction.user.id}`).setEmoji(config_1.default.messages.panel_embed_delete_emoji).setLabel('Delete Panel'));
                let row = new discord_js_1.ActionRowBuilder().addComponents(bb);
                let embedOptions = { fields: [] };
                let panelCategory = interaction.guild?.channels.cache.get(panel.ticketParentChannel);
                if (panel.color)
                    embedOptions.color = panel.color;
                if (panel.image)
                    embedOptions.thumbnail = panel.image;
                embedOptions.fields?.push({ name: 'Default Role', value: `${replace['role'].replace(/\[id\]/gim, panel.defaultRole)}`, inline: true });
                embedOptions.fields?.push({ name: 'Raised Role', value: `${panel.raisedRole ? replace['role'].replace(/\[id\]/gim, panel.raisedRole) : "None"}`, inline: true });
                embedOptions.fields?.push({ name: '\u200b', value: '\u200b', inline: true });
                embedOptions.fields?.push({ name: 'Channel', value: `${replace['channel'].replace(/\[id\]/gim, panel.embedChannel)}`, inline: true });
                if (panelCategory)
                    embedOptions.fields?.push({ name: 'Tickets Open In', value: `<:Dropdown:1033200954830508032> ${panelCategory.name}`, inline: true });
                let embed = utils_1.default.embed(utils_1.DiscordEmbedType.NEUTRAL, `Viewing panel \`${panel.name}\` *(${panel.id})*\n\n**Tickets**\n${panel.ticketTypes.map(t => `\`  ${t.emoji} ${t.name}  \` *type: ${t.type}*\n`).join("")}`, embedOptions);
                return interaction.reply({ embeds: [embed], components: [row] });
            }).catch(err => {
                interaction.reply({
                    embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, `Could not find a panel with ID \`${panelId}\``)]
                });
            });
        }
        else if (subCommand.name === "list") {
            let payload = {
                method: 'GET',
                baseURL,
                url: `/guilds/${interaction.guildId}/panels`,
                headers: {
                    'x-auth-token': process.env.TOKEN,
                    'Content-Type': 'application/json'
                },
            };
            (0, axios_1.default)(payload).then(response => {
                let panelList = response.data.data.data;
                if (!panelList || panelList.length <= 0)
                    return interaction.reply({ ephemeral: true, embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, `This server has no panels. Run </panel create:${interaction.commandId}> to create one.`)] });
                let embed = utils_1.default.embed(utils_1.DiscordEmbedType.NEUTRAL, `**Panels in ${interaction.guild?.name} (${panelList.length})**\n\n${panelList.map((panel) => `\`${panel.id}\`: ${replace['channel'].replace(/\[id\]/gim, panel.embedChannel)}\n> [/panel info panel_id:${panel.id}](# "Copy and paste in the message box")`).join("")}`);
                interaction.reply({ ephemeral: true, embeds: [embed] });
            }).catch(err => {
                interaction.reply({ ephemeral: true, embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, `This server has no panels. Run </panel create:${interaction.commandId}> to create one.`)] });
            });
        }
    },
    autocomplete: async (interaction) => {
        let baseURL = process.env.API_URL;
        let payload = {
            method: 'GET',
            baseURL,
            url: `/guilds/${interaction.guildId}/panels`,
            headers: {
                'x-auth-token': process.env.TOKEN,
                'Content-Type': 'application/json'
            },
        };
        let focusedOption = interaction.options.getFocused(true);
        let value = focusedOption.value;
        (0, axios_1.default)(payload).then(async (response) => {
            let choicesData = response.data;
            if (!choicesData.data || !choicesData.successful)
                return;
            console.log("CHOICES DATA", choicesData);
            if (focusedOption.name === 'panel_id') {
                let choices = choicesData.data.data.map((choice) => ({ name: choice.id, value: choice.id }));
                await interaction.respond(choices);
            }
        }).catch(err => {
            return;
        });
    }
};
