"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const tslib_1 = require("tslib");
require("dotenv/config");
const discord_js_1 = require("discord.js");
const config_1 = tslib_1.__importDefault(require("../config"));
const utils_1 = tslib_1.__importStar(require("../utils"));
const axios_1 = tslib_1.__importDefault(require("axios"));
exports.Settings = {
    name: 'settings',
    description: 'Manage your server settings.',
    options: [
        {
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            name: 'get',
            description: 'Get a config value.',
            options: [
                {
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    autocomplete: true,
                    name: 'option',
                    description: 'The option you want to get.',
                    required: true
                }
            ]
        },
        {
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            name: 'set',
            description: 'Edit a config value.',
            options: [
                {
                    type: discord_js_1.ApplicationCommandOptionType.String,
                    autocomplete: true,
                    name: 'option',
                    description: 'The option you want to edit.',
                    required: true
                },
                {
                    type: discord_js_1.ApplicationCommandOptionType.Channel,
                    name: 'channel',
                    description: 'A channel',
                    required: false,
                    channelTypes: [discord_js_1.ChannelType.GuildText]
                },
                {
                    type: discord_js_1.ApplicationCommandOptionType.Role,
                    name: 'role',
                    description: 'A role',
                    required: false
                },
            ]
        },
        {
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            name: 'view',
            description: 'View your entire config.',
        }
    ],
    run: async (client, interaction) => {
        let map = {
            'role': '<@&[id]>',
            'channel': '<#[id]>'
        };
        let baseURL = process.env.API_URL;
        let subCommand = interaction.options.data[0];
        if (subCommand.name === 'view') {
            let viewPayload = {
                method: 'GET',
                baseURL,
                url: `/guilds/${interaction.guild.id}/config`,
                headers: {
                    'x-auth-token': process.env.TOKEN,
                    'Content-Type': 'application/json'
                }
            };
            (0, axios_1.default)(viewPayload).then(response => {
                let map = response.data.data.data.map;
                if (!map)
                    return interaction.reply({
                        embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, `Failed to fetch config`)]
                    });
                let channelMap = map.filter((x) => x.key.endsWith('_channel')).map((x) => `> \`${x.key}\`: ${x.value}\n`).join("");
                let roleMap = map.filter((x) => x.key.endsWith('_role')).map((x) => `> \`${x.key}\`: ${x.value}\n`).join("");
                interaction.reply({
                    embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.SUCCESS, `**__Channels__**\n${channelMap}\n\n**__Roles__**\n${roleMap}`, { title: `Config for: \`${interaction.guild?.name}\`` })]
                });
            }).catch(err => {
                interaction.reply({
                    embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, `Failed to fetch config`)]
                });
            });
        }
        let options = subCommand.options;
        let option = options?.find(o => o.name === 'option');
        if (options && !option)
            return;
        const choices = config_1.default.configurable_options.settings;
        let optValue = choices.find(c => c.startsWith(option?.value.toLowerCase()));
        if (options && !optValue)
            return interaction.reply({
                embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, `\`${option.value}\` is not a valid option`)]
            });
        let optionType = optValue.split('#')[1].toLowerCase();
        let optionName = optValue.split('#')[0].toLowerCase();
        let payload = {
            method: 'GET',
            baseURL,
            url: `/guilds/${interaction.guild.id}/config/${optValue.split("#")[0]}`,
            headers: {
                'x-auth-token': process.env.TOKEN,
                'Content-Type': 'application/json'
            }
        };
        if (subCommand.name === 'get') {
            let optionValue;
            try {
                optionValue = await (0, axios_1.default)(payload);
                interaction.reply({
                    embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.NEUTRAL, `The value of \`${optionName}\` is ${optionValue.data.data.data[optionName] !== null ? map[optionType].replace(/\[id\]/gim, optionValue.data.data.data[optionName]) : 'unset.'}`)]
                });
            }
            catch (err) {
                interaction.reply({
                    embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, `The value of \`${optionName}\` is unset.`)]
                });
            }
        }
        if (subCommand.name === 'set') {
            let channel = interaction.options.get('channel')?.channel;
            let role = interaction.options.get('role')?.role;
            if (!channel && optionType === 'channel')
                return interaction.reply({ ephemeral: true, embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, `\`${optionName}\` requires the \`${optionType}\` option to be set`)] });
            if (!role && optionType === 'role')
                return interaction.reply({ ephemeral: true, embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, `\`${optionName}\` requires the \`${optionType}\` option to be set`)] });
            let payload = {
                method: 'PATCH',
                baseURL,
                url: `/guilds/${interaction.guild.id}/config/${optValue.split("#")[0]}`,
                headers: {
                    'x-auth-token': process.env.TOKEN,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    value: optionType === "channel" ? channel?.id : optionType === "role" ? role?.id : null,
                    editedBy: interaction.user.id
                })
            };
            (0, axios_1.default)(payload).then(() => {
                interaction.reply({
                    ephemeral: true,
                    embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.SUCCESS, `Successfully set \`${optionName}\` to ${map[optionType].replace(/\[id\]/gim, optionType === "channel" ? channel?.id : optionType === "role" ? role?.id : '')}`)]
                });
            }).catch(err => {
                interaction.reply({
                    embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.ERROR, `Unable to set \`${optionName}\``)]
                });
            });
        }
    },
    autocomplete: async (interaction) => {
        let focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === 'option') {
            const choices = config_1.default.configurable_options.settings;
            await interaction.respond(choices.map(choice => ({ name: choice.split('#')[0], value: choice })));
        }
    }
};
