"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = tslib_1.__importStar(require("./utils"));
exports.default = {
    async logConfigEdit(client, log) {
        let guild = client.guilds.cache.get(log.guildId);
        if (!guild)
            return;
        let { option, editedBy } = log.data;
        let map = {
            'role': utils_1.default.configValues.getRole,
            'channel': utils_1.default.configValues.getTextChannel
        };
        let optionType = option.toLowerCase().endsWith("role") ? "role" : option.toLowerCase().endsWith("channel") ? 'channel' : null;
        if (!optionType || optionType == null)
            return;
        let user = guild.members.cache.get(editedBy);
        if (!user)
            return;
        let mentionable = await map[optionType](guild, option);
        if (!mentionable)
            return;
        let updatesChannel = await utils_1.default.configValues.getTextChannel(guild, 'audit_log_channel');
        if (!updatesChannel)
            return;
        updatesChannel.send({ embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.NEUTRAL, ``, { title: `Config value \`${option}\` was edited`, fields: [{ name: 'Set To', value: `${mentionable}`, inline: true }, { name: 'Edited By', value: `${user}`, inline: true }], timestamp: (new Date()).toISOString() })] });
    },
    async logPanelCreate(client, log) {
        let guild = client.guilds.cache.get(log.guildId);
        if (!guild)
            return;
        let { createdBy, name, id, embedChannel } = log;
        let user = guild.members.cache.get(createdBy);
        if (!user)
            return;
        let channel = guild.channels.cache.get(embedChannel);
        if (!channel)
            return;
        let updatesChannel = await utils_1.default.configValues.getTextChannel(guild, 'audit_log_channel');
        if (!updatesChannel)
            return;
        updatesChannel.send({ embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.NEUTRAL, `_**Panel ID:** ${id}_`, { title: `A panel was created`, fields: [{ name: 'Name', value: `${name}`, inline: true }, { name: 'Created By', value: `${user}`, inline: true }, { name: 'Channel', value: `${channel}`, inline: true }], timestamp: (new Date()).toISOString() })] });
    },
    async logPanelEdit(client, log) {
        let guild = client.guilds.cache.get(log.guildId);
        if (!guild)
            return;
        let { editedBy, id } = log;
        let user = guild.members.cache.get(editedBy);
        if (!user)
            return;
        let updatesChannel = await utils_1.default.configValues.getTextChannel(guild, 'audit_log_channel');
        if (!updatesChannel)
            return;
        let values = {};
        let replace = {
            'role': '<@&[id]>',
            'channel': '<#[id]>'
        };
        log.data.changedEntries.forEach(entry => {
            let oldValue = log.data.oldValue[entry];
            let newValue = log.data.newValue[entry];
            if (oldValue !== newValue)
                values[entry] = { type: entry.toLowerCase().endsWith('channel') ? 'channel' : entry.toLowerCase().endsWith('role') ? 'role' : 'base', oldValue, newValue };
        });
        let valueMap = Object.entries(values).map((entry) => `**${entry[0]}**\n> ${replace[entry[1].type] ? replace[entry[1].type].replace(/\[id\]/gim, entry[1].oldValue) : entry[1].oldValue} -> ${replace[entry[1].type] ? replace[entry[1].type].replace(/\[id\]/gim, entry[1].newValue) : entry[1].newValue}\n\n`).join("") || "None";
        updatesChannel.send({ embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.NEUTRAL, `_Changed **${log.data.changedEntries.length}** value${log.data.changedEntries.length == 1 ? '' : 's'}_\n\n__**Edited Values**__\n${valueMap}`, { title: `Panel \`${id}\` was edited`, fields: [{ name: 'Name', value: `${log.data.newValue.name}`, inline: true }, { name: 'Edited By', value: `${user}`, inline: true }], timestamp: (new Date()).toISOString() })] });
    }
};
