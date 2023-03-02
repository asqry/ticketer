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
        let updatesChannel = await utils_1.default.configValues.getTextChannel(guild, 'updates_channel');
        if (!updatesChannel)
            return;
        updatesChannel.send({ embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.NEUTRAL, ``, { title: `Config value \`${option}\` was edited`, fields: [{ name: 'Set To', value: `${mentionable}`, inline: true }, { name: 'Set By', value: `${user}`, inline: true }], timestamp: (new Date()).toISOString() })] });
    }
};
