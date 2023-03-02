import { Client, GuildMember, Role, TextChannel } from "discord.js";
import utils, { DiscordEmbedType } from "./utils";

interface ConfigEditLogEntryData {
    option: string
    oldValue: string
    newValue: string
    editedBy: string
}
interface ConfigEditLogEntry {
    guildId: string
    data: ConfigEditLogEntryData
}

export default {
    async logConfigEdit(client: Client, log: ConfigEditLogEntry): Promise<void> {
        let guild = client.guilds.cache.get(log.guildId)
        if (!guild) return;


        let { option, editedBy } = log.data

        let map: any = {
            'role': utils.configValues.getRole,
            'channel': utils.configValues.getTextChannel
        }

        let optionType: string | null = option.toLowerCase().endsWith("role") ? "role" : option.toLowerCase().endsWith("channel") ? 'channel' : null
        if (!optionType || optionType == null) return;

        let user: GuildMember | undefined = guild.members.cache.get(editedBy)
        if (!user) return;


        let mentionable: TextChannel | Role | undefined = await map[optionType](guild, option)
        if (!mentionable) return;


        let updatesChannel: TextChannel | undefined = await utils.configValues.getTextChannel(guild, 'updates_channel')
        if (!updatesChannel) return;


        updatesChannel.send({ embeds: [utils.embed(DiscordEmbedType.NEUTRAL, ``, { title: `Config value \`${option}\` was edited`, fields: [{ name: 'Set To', value: `${mentionable}`, inline: true }, { name: 'Set By', value: `${user}`, inline: true }], timestamp: (new Date()).toISOString() })] })
    }
}