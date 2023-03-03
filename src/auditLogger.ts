import { Client, GuildBasedChannel, GuildMember, Role, TextChannel } from "discord.js";
import { Panel } from "./server/models/panel";
import utils, { DiscordEmbedType } from "./utils";

interface ConfigEditLogEntryData {
    option: string
    oldValue: string
    newValue: string
    editedBy: string
}
export interface ConfigEditLogEntry {
    guildId: string
    data: ConfigEditLogEntryData
}

export interface PanelCreateEntry extends Panel {
    guildId: string
    id: string,
    embedChannelId: string
    ticketParentId: string
    createdBy: string
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


        let updatesChannel: TextChannel | undefined = await utils.configValues.getTextChannel(guild, 'audit_log_channel')
        if (!updatesChannel) return;


        updatesChannel.send({ embeds: [utils.embed(DiscordEmbedType.NEUTRAL, ``, { title: `Config value \`${option}\` was edited`, fields: [{ name: 'Set To', value: `${mentionable}`, inline: true }, { name: 'Set By', value: `${user}`, inline: true }], timestamp: (new Date()).toISOString() })] })
    },
    async logPanelCreate(client: Client, log: PanelCreateEntry): Promise<void> {
        let guild = client.guilds.cache.get(log.guildId)
        if (!guild) return;


        let { createdBy, name, id, embedChannelId } = log


        let user: GuildMember | undefined = guild.members.cache.get(createdBy)
        if (!user) return;

        let channel: GuildBasedChannel | undefined = guild.channels.cache.get(embedChannelId)
        if (!channel) return;


        let updatesChannel: TextChannel | undefined = await utils.configValues.getTextChannel(guild, 'audit_log_channel')
        if (!updatesChannel) return;


        updatesChannel.send({ embeds: [utils.embed(DiscordEmbedType.NEUTRAL, `_**Panel ID:** ${id}_`, { title: `A panel was created`, fields: [{ name: 'Name', value: `${name}`, inline: true }, { name: 'Created By', value: `${user}`, inline: true }, { name: 'Channel', value: `${channel}`, inline: true }], timestamp: (new Date()).toISOString() })] })
    }
}