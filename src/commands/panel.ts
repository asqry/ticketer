import "dotenv/config"
import axios, { AxiosRequestConfig } from "axios";
import { ActionRowBuilder, ApplicationCommandOptionType, AutocompleteInteraction, ButtonBuilder, ButtonStyle, Client, CommandInteraction } from "discord.js";
import { Command } from "../interfaces/command";
import utils, { DiscordEmbedOptions, DiscordEmbedType } from "../utils";
import { Panel as PanelModel } from "../server/models/panel";
import config from "../config";

export const Panel: Command = {
    name: 'panel',
    description: 'Manage your server\'s ticket panels',
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'info',
            description: "Get information about a panel",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    name: 'panel_id',
                    description: 'The panel\'s id',
                    required: true
                }
            ]
        }
    ],
    run(client: Client, interaction: CommandInteraction) {
        let baseURL = process.env.API_URL
        let replace: any = {
            'role': '<@&[id]>',
            'channel': '<#[id]>'
        }
        let subCommand = interaction.options.data[0]
        if (!subCommand) return;

        if (subCommand.name === 'info') {
            let panelId = subCommand.options?.find(o => o.name.toLowerCase() === 'panel_id')?.value

            let payload: AxiosRequestConfig = {
                method: 'GET',
                baseURL,
                url: `/guilds/${interaction.guildId}/panels/${panelId}`,
                headers: {
                    'x-auth-token': process.env.TOKEN,
                    'Content-Type': 'application/json'
                },
            }

            axios(payload).then(response => {

                let panel: PanelModel = response.data.data.data
                if (!panel) return interaction.reply({
                    embeds: [utils.embed(DiscordEmbedType.ERROR, `Could not find a panel with ID \`${panelId}\``)]
                })

                let bb = []
                bb.push(new ButtonBuilder().setStyle(ButtonStyle.Success).setCustomId(`send-${panel.id}-user_${interaction.user.id}`).setEmoji(config.messages.panel_embed_send_emoji).setLabel('Resend Embed'))
                bb.push(new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId(`edit-${panel.id}-user_${interaction.user.id}`).setEmoji(config.messages.panel_embed_edit_emoji).setLabel('Edit Panel'))
                bb.push(new ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId(`delete-${panel.id}-user_${interaction.user.id}`).setEmoji(config.messages.panel_embed_delete_emoji).setLabel('Delete Panel'))

                let row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(bb)

                let embedOptions: DiscordEmbedOptions = { fields: [] }

                let panelCategory = interaction.guild?.channels.cache.get(panel.ticketParentChannel)
                if (panel.color) embedOptions.color = panel.color
                if (panel.image) embedOptions.thumbnail = panel.image

                embedOptions.fields?.push({ name: 'Default Role', value: `${replace['role'].replace(/\[id\]/gim, panel.defaultRole)}`, inline: true })
                embedOptions.fields?.push({ name: 'Raised Role', value: `${panel.raisedRole ? replace['role'].replace(/\[id\]/gim, panel.raisedRole) : "None"}`, inline: true })
                embedOptions.fields?.push({ name: '\u200b', value: '\u200b', inline: true })
                embedOptions.fields?.push({ name: 'Channel', value: `${replace['channel'].replace(/\[id\]/gim, panel.embedChannel)}`, inline: true })
                if (panelCategory) embedOptions.fields?.push({ name: 'Tickets Open In', value: `<:Dropdown:1033200954830508032> ${panelCategory.name}`, inline: true })

                let embed = utils.embed(DiscordEmbedType.NEUTRAL, `Viewing panel \`${panel.name}\` *(${panel.id})*\n\n**Tickets**\n${panel.ticketTypes.map(t => `\`  ${t.emoji} ${t.name}  \` *type: ${t.type}*\n`).join("")}`, embedOptions)

                return interaction.reply({ embeds: [embed], components: [row] })
            }).catch(err => {
                interaction.reply({
                    embeds: [utils.embed(DiscordEmbedType.ERROR, `Could not find a panel with ID \`${panelId}\``)]
                })
            })

        }
    },
    autocomplete: async (interaction: AutocompleteInteraction) => {
        let baseURL = process.env.API_URL
        let payload: AxiosRequestConfig = {
            method: 'GET',
            baseURL,
            url: `/guilds/${interaction.guildId}/panels`,
            headers: {
                'x-auth-token': process.env.TOKEN,
                'Content-Type': 'application/json'
            },
        }

        let focusedOption = interaction.options.getFocused(true)
        let value = focusedOption.value


        let { data: choicesData } = await axios(payload)

        if (focusedOption.name === 'panel_id') {
            let choices = choicesData.data.data.map((choice: any) => ({ name: choice.id, value: choice.id }))

            await interaction.respond(choices)
        }

    }
}