"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("dotenv/config");
const discord_js_1 = require("discord.js");
const utils_1 = tslib_1.__importStar(require("../utils"));
const axios_1 = tslib_1.__importDefault(require("axios"));
var MakePayloadMethod;
(function (MakePayloadMethod) {
    MakePayloadMethod["GET"] = "GET";
    MakePayloadMethod["POST"] = "POST";
    MakePayloadMethod["PATCH"] = "PATCH";
})(MakePayloadMethod || (MakePayloadMethod = {}));
class PanelManager {
    client;
    guild;
    panel;
    constructor(client, guild, panel) {
        this.client = client;
        this.guild = guild;
        this.panel = panel;
    }
    channel() {
        let channel = this.guild.channels.cache.get(this.panel.embedChannel);
        if (!channel)
            return null;
        return channel;
    }
    get name() {
        return this.panel.name;
    }
    get color() {
        return this.panel.color;
    }
    get imageUrl() {
        return this.panel.image;
    }
    get tickets() {
        return this.panel.ticketTypes;
    }
    get messageId() {
        return this.panel.embedMessage;
    }
    makePayload(method, endpoint, data) {
        let baseURL = process.env.API_URL;
        return {
            method,
            baseURL,
            url: `/guilds/${this.panel.guildId}${endpoint}`,
            headers: {
                'x-auth-token': process.env.TOKEN,
                'Content-Type': 'application/json',
                'x-anonymous': 1
            },
            data: JSON.stringify(data)
        };
    }
    async setMessageId(message) {
        (0, axios_1.default)(this.makePayload(MakePayloadMethod.PATCH, `/panels/${this.panel.id}`, { embedMessage: message.id })).then(response => {
            console.log(response);
        }).catch(err => {
            utils_1.default.log(utils_1.Log.ERROR, err);
        });
    }
    buildButtons() {
        let t = [];
        this.tickets.forEach((ticket) => {
            let bb = new discord_js_1.ButtonBuilder();
            bb.setStyle(discord_js_1.ButtonStyle.Secondary).setCustomId(`open-${this.panel.id}-${ticket.type}-${ticket.name}`).setEmoji(ticket.emoji).setLabel(ticket.name);
            t.push(bb);
        });
        return t;
    }
    async findOldMessage(channel) {
        if (!this.messageId)
            return null;
        channel.messages.fetch();
        let message = await channel.messages.fetch(this.messageId);
        if (!message)
            return null;
        return message;
    }
    async sendEmbed() {
        let channel = this.channel();
        if (!channel)
            return utils_1.default.log(utils_1.Log.ERROR, "Couldn't find the panel channel");
        let oldMessage = await this.findOldMessage(channel);
        let embed = [utils_1.default.embed(utils_1.DiscordEmbedType.NEUTRAL, `*Click a button below to open a ticket*\n_**${this.tickets.length}** available ticket types_`, { title: this.name, color: this.color, image: { url: this.imageUrl ? this.imageUrl : "" } })];
        let row = new discord_js_1.ActionRowBuilder().addComponents(this.buildButtons());
        let emb = { embeds: embed };
        if (this.buildButtons().length > 0)
            emb.components = [row];
        if (!oldMessage) {
            console.log("no old message");
            channel.send(emb).then(async (m) => await this.setMessageId(m));
            return;
        }
        if (oldMessage && oldMessage?.deletable && oldMessage.embeds !== emb.embeds || oldMessage?.components && oldMessage.components !== emb.components) {
            oldMessage.delete().then(() => {
                channel.send(emb).then(async (m) => await this.setMessageId(m));
            }).catch(err => {
                utils_1.default.log(utils_1.Log.ERROR, err);
            });
        }
    }
}
exports.default = PanelManager;
