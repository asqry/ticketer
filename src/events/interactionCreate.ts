import { Client, Interaction, CommandInteraction, AutocompleteInteraction } from 'discord.js';
import { Command } from '../interfaces/command';
import { Commands } from '../commands';


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

  }
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
  if (interaction.commandName === 'settings') {
    let apiCommand = interaction.client.application.commands.cache.get(interaction.commandId)
    let command: Command = Object.values(require(`../commands/${apiCommand?.name}`))[0] as Command
    if (!command) return;

    if (command.autocomplete) await command.autocomplete(interaction);
  }
}