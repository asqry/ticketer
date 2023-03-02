"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("dotenv/config");
const utils_1 = tslib_1.__importStar(require("../utils"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const config_1 = tslib_1.__importDefault(require("../config"));
class GuildCreate {
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
            method: 'POST',
            baseURL,
            url: '/create',
            data: JSON.stringify({
                id: guild.id
            }),
            headers: {
                'x-auth-token': process.env.TOKEN,
                'Content-Type': 'application/json'
            }
        };
        (0, axios_1.default)(payload).then(async (response) => {
            let guildOwner = await guild.fetchOwner({ force: true });
            let systemChannel = await utils_1.default.getSystemChannel(guild, client);
            systemChannel?.send({ content: utils_1.default.formatMessage(config_1.default.messages.welcome_embed_content, guildOwner, guild, client), embeds: [utils_1.default.embed(utils_1.DiscordEmbedType.SUCCESS, utils_1.default.formatMessage(config_1.default.messages.welcome_embed_description, guildOwner, guild, client))] });
        }).catch(err => {
            console.log(err.response.data);
        });
    }
}
exports.default = GuildCreate;
