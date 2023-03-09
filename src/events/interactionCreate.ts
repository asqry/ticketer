import 'dotenv/config'
import { Client, Interaction, CommandInteraction, AutocompleteInteraction, ButtonInteraction, PermissionFlagsBits, OverwriteType } from 'discord.js';
import { Command } from '../interfaces/command';
import { Commands } from '../commands';
import utils, { DiscordEmbedType } from '../utils';
import axios, { AxiosRequestConfig } from 'axios';
import { Panel } from '../server/models/panel';
import rs from "random-string"



export default class InteractionCreate {
  client: Client
  enabled: Boolean

  constructor(client: Client) {
    this.client = client
    this.enabled = true;
  }

  async run(interaction: Interaction) {
    let client = this.client
    if (!client.user || !client.application) return;
    if (!interaction) return;

    if (interaction.isAutocomplete()) await handleAutoComplete(client, interaction)
    if (interaction.isCommand()) await handleSlashCommand(client, interaction)
    if (interaction.isButton()) await handleButtonPress(client, interaction)

  }
}

const generateId = (): string => {
  let id = rs({ length: 12, special: false, numeric: true, letters: true })
  return id;
}

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
  const command = Commands.find(c => c.name === interaction.command?.name)
  if (!command) {
    interaction.reply({ ephemeral: true, content: "An error occurred." });
    return;
  }

  if (!interaction.guild) {
    console.log()
    interaction.reply({ content: `Commands in DMs are not supported. Please re-run this command in a server. \n\n**Command Ran**: </${interaction.commandName} ${interaction.options.data[0].name}:${interaction.command?.id}>` });
    return;
  }

  // await interaction.deferReply({ ephemeral: true })

  command.run(client, interaction)
}

const handleAutoComplete = async (client: Client, interaction: AutocompleteInteraction): Promise<void> => {

  let apiCommand = interaction.client.application.commands.cache.get(interaction.commandId)
  let command: Command = Object.values(require(`../commands/${apiCommand?.name}`))[0] as Command
  if (!command) return;

  if (command.autocomplete) await command.autocomplete(interaction);
}

const handleButtonPress = async (client: Client, interaction: ButtonInteraction): Promise<void> => {
  let customId = interaction.customId
  if (!customId) return;
  if (customId.match(/user\_[1-9].*/gim) && interaction.user.id !== customId.split(/user\_/gim)[1]) {
    interaction.reply({ ephemeral: true, embeds: [utils.embed(DiscordEmbedType.ERROR, 'This is not your button')] });
    return;
  } else {
    let baseURL = process.env.API_URL
    if (customId.startsWith('open-')) {
      let parsedPanel = customId.split("-")
      let action = parsedPanel[0]
      let panelId = parsedPanel[1]
      let ticketType = parsedPanel[2]
      let ticketName = parsedPanel[3]

      let payload: AxiosRequestConfig = {
        method: 'GET',
        baseURL,
        url: `/guilds/${interaction.guildId}/panels/${panelId}`,
        headers: {
          'x-auth-token': process.env.TOKEN,
          'Content-Type': 'application/json'
        },
      }

      axios(payload).then(async response => {
        let panel: Panel = response.data.data.data
        if (!panel) return interaction.reply({
          ephemeral: true,
          embeds: [utils.embed(DiscordEmbedType.ERROR, `An error occured. Please contact support.`)]
        })

        interaction.guild?.channels.create({ name: `ticket-${generateId()}`, parent: panel.ticketParentChannel, permissionOverwrites: [{ type: OverwriteType.Role, id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { type: OverwriteType.Role, id: panel.defaultRole as string, allow: [PermissionFlagsBits.ViewChannel] }] }).then(c => {

          interaction.reply(`${c}`)
        })

      }).catch(async err => {
        await interaction.reply({
          ephemeral: true,
          embeds: [utils.embed(DiscordEmbedType.ERROR, `An error occured. Please contact support.`)]
        })
      })


    }
  }
}