"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpCode = exports.DiscordEmbedType = exports.Log = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const discord_js_1 = require("discord.js");
const config_1 = tslib_1.__importDefault(require("./config"));
var Log;
(function (Log) {
    Log["ERROR"] = "error";
    Log["WARNING"] = "warning";
    Log["SUCCESS"] = "success";
    Log["NEUTRAL"] = "neutral";
})(Log = exports.Log || (exports.Log = {}));
var DiscordEmbedType;
(function (DiscordEmbedType) {
    DiscordEmbedType["ERROR"] = "error";
    DiscordEmbedType["WARNING"] = "warning";
    DiscordEmbedType["SUCCESS"] = "success";
    DiscordEmbedType["NEUTRAL"] = "neutral";
})(DiscordEmbedType = exports.DiscordEmbedType || (exports.DiscordEmbedType = {}));
var HttpCode;
(function (HttpCode) {
    HttpCode[HttpCode["INTERNAL_SERVER_ERROR"] = 502] = "INTERNAL_SERVER_ERROR";
    HttpCode[HttpCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpCode[HttpCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpCode[HttpCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpCode[HttpCode["OK"] = 200] = "OK";
})(HttpCode = exports.HttpCode || (exports.HttpCode = {}));
exports.default = {
    configValues: {
        async getTextChannel(guild, value) {
            let baseURL = process.env.API_URL;
            let payload = {
                method: "GET",
                baseURL,
                url: `/guilds/${guild.id}/config/${value.toLowerCase()}`,
                headers: {
                    'x-auth-token': process.env.TOKEN,
                    'Content-Type': 'application/json'
                }
            };
            let ch;
            try {
                let response = await (0, axios_1.default)(payload);
                let g = guild;
                if (!g.available)
                    return;
                let c = g.channels.cache.get(response.data.data.data[value]);
                if (!c)
                    return;
                ch = c;
                return ch;
            }
            catch (err) {
                console.log(err);
            }
        },
        async getRole(guild, value) {
            let baseURL = process.env.API_URL;
            let payload = {
                method: "GET",
                baseURL,
                url: `/guilds/${guild.id}/config/${value.toLowerCase()}`,
                headers: {
                    'x-auth-token': process.env.TOKEN,
                    'Content-Type': 'application/json'
                }
            };
            let rl;
            try {
                let response = await (0, axios_1.default)(payload);
                let g = guild;
                if (!g.available)
                    return;
                let r = g.roles.cache.get(response.data.data.data[value]);
                if (!r)
                    return;
                rl = r;
                return rl;
            }
            catch (err) {
                console.log(err);
            }
        }
    },
    apiResponse(status, res, payload) {
        let codes = {
            '502': 'Internal Server Error',
            '404': 'Not Found',
            '401': 'Unauthorized',
            '400': 'Bad Request',
            '200': 'OK'
        };
        if (!payload)
            return res.status(status).send({ successful: status === HttpCode.OK ? true : false, data: { message: codes[status], data: null } });
        return res.status(status).send({ successful: status === HttpCode.OK ? true : false, data: { message: codes[status], data: payload } });
    },
    log(type, message) {
        let prefixes = {
            'error': '⛔',
            'warning': '⚠️',
            'success': '✅',
            'neutral': '✔️',
        };
        console.log(prefixes[type], message);
    },
    embed(type, description, options) {
        let builder = {
            title: config_1.default.branding.embed.titles[type],
            description,
            color: (0, discord_js_1.resolveColor)(config_1.default.branding.embed.colors[type])
        };
        if (options?.thumbnail)
            builder.thumbnail = { url: options.thumbnail };
        if (options?.timestamp)
            builder.timestamp = options.timestamp;
        if (options?.title)
            builder.title = options.title;
        if (options?.fields)
            builder.fields = options.fields;
        return discord_js_1.EmbedBuilder.from(builder);
    },
    formatMessage(message, member, guild, client) {
        let msg = message;
        let placeholders = {
            'g': guild,
            'u': member,
            'c': client,
            'cu': client.user
        };
        let matches = message.match(/\%\w+\_\w+/gim);
        if (!matches)
            return message;
        matches?.forEach(match => {
            let entryValue = match.split("_")[1];
            let entryKey = match.split("_")[0].split('%')[1];
            let regex = new RegExp(match, "gim");
            msg = msg.replace(regex, `${placeholders[entryKey][entryValue]}`);
        });
        return msg;
    },
    getSystemChannel(guild, client) {
        return guild.channels.cache.filter(channel => channel.type === discord_js_1.ChannelType.GuildText && channel.permissionsFor(guild.members.cache.find(m => m.id === client.user?.id)).has(discord_js_1.PermissionFlagsBits.SendMessages)).first();
    }
};
