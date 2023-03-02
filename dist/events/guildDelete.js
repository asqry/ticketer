"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("dotenv/config");
const utils_1 = tslib_1.__importStar(require("../utils"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const config_1 = tslib_1.__importDefault(require("../config"));
class GuildDelete {
    client;
    enabled;
    constructor(client) {
        this.client = client;
        this.enabled = true;
    }
    async run(guild) {
        let baseURL = process.env.API_URL + '/guilds';
        let client = this.client;
        if (!client.user || !client.application)
            return;
        let payload = {
            method: 'DELETE',
            baseURL,
            url: '/delete/' + guild.id,
            headers: {
                'x-auth-token': process.env.TOKEN,
            }
        };
        (0, axios_1.default)(payload).then(async (response) => {
            const guildOwner = client.users.cache.get(guild.ownerId);
            if (!guildOwner)
                return;
            guildOwner.send({ content: utils_1.default.formatMessage(config_1.default.messages.goodbye_embed_content, guildOwner, guild, client), embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.SUCCESS, utils_1.default.formatMessage(config_1.default.messages.goodbye_embed_description, guildOwner, guild, client))] }).catch(err => {
                utils_1.default.log(utils_1.Log.WARNING, "Couldn't message the Guild Owner.");
            });
        }).catch(err => {
            utils_1.default.log(utils_1.Log.NEUTRAL, err);
        });
    }
}
exports.default = GuildDelete;
