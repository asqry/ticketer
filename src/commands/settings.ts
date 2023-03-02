import 'dotenv/config'
import { ApplicationCommandOptionType, AutocompleteInteraction, ChannelType, Client, CommandInteraction, Guild } from "discord.js";
import config from "../config";
import { Command } from "../interfaces/command";
import utils, { DiscordEmbedType } from "../utils";
import axios, { AxiosRequestConfig } from 'axios'

export const Settings: Command = {
    name: 'settings',
    description: 'Manage your server settings.',
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'get',
            description: 'Get a config value.',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    name: 'option',
                    description: 'The option you want to get.',
                    required: true
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'set',
            description: 'Edit a config value.',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    name: 'option',
                    description: 'The option you want to edit.',
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.Channel,
                    name: 'channel',
                    description: 'A channel',
                    required: false,
                    channelTypes: [ChannelType.GuildText]
                },
                {
                    type: ApplicationCommandOptionType.Role,
                    name: 'role',
                    description: 'A role',
                    required: false
                },

            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'view',
            description: 'View your entire config.',
        }
    ],
    run: async (client: Client, interaction: CommandInteraction) => {
        let map: any = {
            'role': '<@&[id]>',
            'channel': '<#[id]>'
        }

        let baseURL = process.env.API_URL
        let subCommand = interaction.options.data[0]

        // DOES NOT NEED OPTIONS :(
        if (subCommand.name === 'view') {
            let viewPayload: AxiosRequestConfig = {
                method: 'GET',
                baseURL,
                url: `/guilds/${(interaction.guild as Guild).id}/config`,
                headers: {
                    'x-auth-token': process.env.TOKEN,
                    'Content-Type': 'application/json'
                }
            }

            axios(viewPayload).then(response => {
                let map = response.data.data.data.map
                if (!map) return interaction.reply({
                    embeds: [utils.embed(DiscordEmbedType.ERROR, `Failed to fetch config`)]
                })

                let channelMap = map.filter((x: any) => x.key.endsWith('_channel')).map((x: any) => `> \`${x.key}\`: ${x.value}\n`).join("")
                let roleMap = map.filter((x: any) => x.key.endsWith('_role')).map((x: any) => `> \`${x.key}\`: ${x.value}\n`).join("")

                interaction.reply({
                    embeds: [utils.embed(DiscordEmbedType.SUCCESS, `**__Channels__**\n${channelMap}\n\n**__Roles__**\n${roleMap}`, { title: `Config for: \`${interaction.guild?.name}\`` })]
                })
            }).catch(err => {
                interaction.reply({
                    embeds: [utils.embed(DiscordEmbedType.ERROR, `Failed to fetch config`)]
                })
            })
        }
        // DOES NOT NEED OPTIONS :(


        let options = subCommand.options
        let option = options?.find(o => o.name === 'option') as any
        if (options && !option) return;
        const choices: string[] = config.configurable_options.settings
        let optValue: string | null = choices.find(c => c.startsWith((option?.value as string).toLowerCase())) as string
        if (options && !optValue) return interaction.reply({
            embeds: [utils.embed(DiscordEmbedType.ERROR, `\`${option.value}\` is not a valid option`)]
        })
        let optionType = optValue.split('#')[1].toLowerCase()
        let optionName = optValue.split('#')[0].toLowerCase()

        let payload: AxiosRequestConfig = {
            method: 'GET',
            baseURL,
            url: `/guilds/${(interaction.guild as Guild).id}/config/${optValue.split("#")[0]}`,
            headers: {
                'x-auth-token': process.env.TOKEN,
                'Content-Type': 'application/json'
            }
        }

        if (subCommand.name === 'get') {
            let optionValue: any;

            try {
                optionValue = await axios(payload)

                interaction.reply({
                    embeds: [utils.embed(DiscordEmbedType.NEUTRAL, `The value of \`${optionName}\` is ${optionValue.data.data.data[optionName] !== null ? map[optionType].replace(/\[id\]/gim, optionValue.data.data.data[optionName]) : 'unset.'}`)]
                })
            } catch (err) {
                interaction.reply({
                    embeds: [utils.embed(DiscordEmbedType.ERROR, `The value of \`${optionName}\` is unset.`)]
                })
            }

        }

        if (subCommand.name === 'set') {
            let channel = interaction.options.get('channel')?.channel
            let role = interaction.options.get('role')?.role

            if (!channel && optionType === 'channel') return interaction.reply({ ephemeral: true, embeds: [utils.embed(DiscordEmbedType.ERROR, `\`${optionName}\` requires the \`${optionType}\` option to be set`)] })
            if (!role && optionType === 'role') return interaction.reply({ ephemeral: true, embeds: [utils.embed(DiscordEmbedType.ERROR, `\`${optionName}\` requires the \`${optionType}\` option to be set`)] })

            let payload: AxiosRequestConfig = {
                method: 'PATCH',
                baseURL,
                url: `/guilds/${(interaction.guild as Guild).id}/config/${optValue.split("#")[0]}`,
                headers: {
                    'x-auth-token': process.env.TOKEN,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    value: optionType === "channel" ? channel?.id : optionType === "role" ? role?.id : null,
                    editedBy: interaction.user.id
                })
            }

            axios(payload).then(() => {
                interaction.reply({
                    ephemeral: true,
                    embeds: [utils.embed(DiscordEmbedType.SUCCESS, `Successfully set \`${optionName}\` to ${map[optionType].replace(/\[id\]/gim, optionType === "channel" ? channel?.id : optionType === "role" ? role?.id : '')}`)]
                })
            }).catch(err => {
                interaction.reply({
                    embeds: [utils.embed(DiscordEmbedType.ERROR, `Unable to set \`${optionName}\``)]
                })
            })

        }

    },
    autocomplete: async (interaction: AutocompleteInteraction) => {

        let focusedOption = interaction.options.getFocused(true)

        if (focusedOption.name === 'option') {
            const choices: string[] = config.configurable_options.settings
            await interaction.respond(choices.map(choice => ({ name: choice.split('#')[0], value: choice })))
        }

    }
}