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
    embedChannel: string
    ticketParentChannel: string
    createdBy: string
}

interface PanelEditEntryData {
    oldValue: Panel
    newValue: Panel
    changedEntries: string[]
}

export interface PanelEditEntry extends Panel {
    guildId: string
    id: string
    editedBy: string
    data: PanelEditEntryData

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


        updatesChannel.send({ embeds: [utils.embed(DiscordEmbedType.NEUTRAL, ``, { title: `Config value \`${option}\` was edited`, fields: [{ name: 'Set To', value: `${mentionable}`, inline: true }, { name: 'Edited By', value: `${user}`, inline: true }], timestamp: (new Date()).toISOString() })] })
    },
    async logPanelCreate(client: Client, log: PanelCreateEntry): Promise<void> {
        let guild = client.guilds.cache.get(log.guildId)
        if (!guild) return;


        let { createdBy, name, id, embedChannel } = log


        let user: GuildMember | undefined = guild.members.cache.get(createdBy)
        if (!user) return;

        let channel: GuildBasedChannel | undefined = guild.channels.cache.get(embedChannel)
        if (!channel) return;


        let updatesChannel: TextChannel | undefined = await utils.configValues.getTextChannel(guild, 'audit_log_channel')
        if (!updatesChannel) return;


        updatesChannel.send({ embeds: [utils.embed(DiscordEmbedType.NEUTRAL, `_**Panel ID:** ${id}_`, { title: `A panel was created`, fields: [{ name: 'Name', value: `${name}`, inline: true }, { name: 'Created By', value: `${user}`, inline: true }, { name: 'Channel', value: `${channel}`, inline: true }], timestamp: (new Date()).toISOString() })] })
    },
    async logPanelEdit(client: Client, log: PanelEditEntry): Promise<void> {
        let guild = client.guilds.cache.get(log.guildId)
        if (!guild) return;


        let { editedBy, id } = log


        let user: GuildMember | undefined = guild.members.cache.get(editedBy)
        if (!user) return;


        let updatesChannel: TextChannel | undefined = await utils.configValues.getTextChannel(guild, 'audit_log_channel')
        if (!updatesChannel) return;

        let values: any = {}

        let replace: any = {
            'role': '<@&[id]>',
            'channel': '<#[id]>'
        }

        log.data.changedEntries.forEach(entry => {
            let oldValue = (log.data.oldValue as any)[entry]
            let newValue = (log.data.newValue as any)[entry]

            if (oldValue !== newValue) values[entry] = { type: entry.toLowerCase().endsWith('channel') ? 'channel' : entry.toLowerCase().endsWith('role') ? 'role' : 'base', oldValue, newValue }

        })

        let valueMap = Object.entries(values).map((entry: any) => `**${entry[0]}**\n> ${replace[entry[1].type] ? replace[entry[1].type].replace(/\[id\]/gim, entry[1].oldValue) : entry[1].oldValue} -> ${replace[entry[1].type] ? replace[entry[1].type].replace(/\[id\]/gim, entry[1].newValue) : entry[1].newValue}\n\n`).join("") || "None"


        updatesChannel.send({ embeds: [utils.embed(DiscordEmbedType.NEUTRAL, `_Changed **${log.data.changedEntries.length}** value${log.data.changedEntries.length == 1 ? '' : 's'}_\n\n__**Edited Values**__\n${valueMap}`, { title: `Panel \`${id}\` was edited`, fields: [{ name: 'Name', value: `${log.data.newValue.name}`, inline: true }, { name: 'Edited By', value: `${user}`, inline: true }], timestamp: (new Date()).toISOString() })] })
    }
}