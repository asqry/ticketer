"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.HttpCode = exports.DiscordEmbedType = exports.Log = void 0;
require("dotenv/config");
var axios_1 = require("axios");
var discord_js_1 = require("discord.js");
var config_1 = require("./config");
var PanelManager_1 = require("./managers/PanelManager");
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
exports["default"] = {
    configValues: {
        getTextChannel: function (guild, value) {
            return __awaiter(this, void 0, void 0, function () {
                var baseURL, payload, ch, response, g, c, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            baseURL = process.env.API_URL;
                            payload = {
                                method: "GET",
                                baseURL: baseURL,
                                url: "/guilds/".concat(guild.id, "/config/").concat(value.toLowerCase()),
                                headers: {
                                    'x-auth-token': process.env.TOKEN,
                                    'Content-Type': 'application/json'
                                }
                            };
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, (0, axios_1["default"])(payload)];
                        case 2:
                            response = _a.sent();
                            g = guild;
                            if (!g.available)
                                return [2 /*return*/];
                            c = g.channels.cache.get(response.data.data.data[value]);
                            if (!c)
                                return [2 /*return*/];
                            ch = c;
                            return [2 /*return*/, ch];
                        case 3:
                            err_1 = _a.sent();
                            console.log(err_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        },
        getRole: function (guild, value) {
            return __awaiter(this, void 0, void 0, function () {
                var baseURL, payload, rl, response, g, r, err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            baseURL = process.env.API_URL;
                            payload = {
                                method: "GET",
                                baseURL: baseURL,
                                url: "/guilds/".concat(guild.id, "/config/").concat(value.toLowerCase()),
                                headers: {
                                    'x-auth-token': process.env.TOKEN,
                                    'Content-Type': 'application/json'
                                }
                            };
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, (0, axios_1["default"])(payload)];
                        case 2:
                            response = _a.sent();
                            g = guild;
                            if (!g.available)
                                return [2 /*return*/];
                            r = g.roles.cache.get(response.data.data.data[value]);
                            if (!r)
                                return [2 /*return*/];
                            rl = r;
                            return [2 /*return*/, rl];
                        case 3:
                            err_2 = _a.sent();
                            console.log(err_2);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
    },
    apiResponse: function (status, res, payload) {
        var codes = {
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
    log: function (type, message) {
        var prefixes = {
            'error': '⛔',
            'warning': '⚠️',
            'success': '✅',
            'neutral': '✔️'
        };
        console.log(prefixes[type], message);
    },
    embed: function (type, description, options) {
        var builder = {
            title: config_1["default"].branding.embed.titles[type],
            description: description,
            color: (0, discord_js_1.resolveColor)(config_1["default"].branding.embed.colors[type])
        };
        if (options === null || options === void 0 ? void 0 : options.thumbnail)
            builder.thumbnail = { url: options.thumbnail };
        if (options === null || options === void 0 ? void 0 : options.footer)
            builder.footer = { text: options.thumbnail };
        if (options === null || options === void 0 ? void 0 : options.timestamp)
            builder.timestamp = options.timestamp;
        if (options === null || options === void 0 ? void 0 : options.title)
            builder.title = options.title;
        if (options === null || options === void 0 ? void 0 : options.fields)
            builder.fields = options.fields;
        if (options === null || options === void 0 ? void 0 : options.image)
            builder.image = options.image;
        if (options === null || options === void 0 ? void 0 : options.color)
            builder.color = (0, discord_js_1.resolveColor)(options.color);
        return discord_js_1.EmbedBuilder.from(builder);
    },
    formatMessage: function (message, member, guild, client) {
        var msg = message;
        var placeholders = {
            'g': guild,
            'u': member,
            'c': client,
            'cu': client.user
        };
        var matches = message.match(/\%\w+\_\w+/gim);
        if (!matches)
            return message;
        matches === null || matches === void 0 ? void 0 : matches.forEach(function (match) {
            var entryValue = match.split("_")[1];
            var entryKey = match.split("_")[0].split('%')[1];
            var regex = new RegExp(match, "gim");
            msg = msg.replace(regex, "".concat(placeholders[entryKey][entryValue]));
        });
        return msg;
    },
    getSystemChannel: function (guild, client) {
        // return guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).last();
        return guild.channels.cache.filter(function (channel) { return channel.type === discord_js_1.ChannelType.GuildText && channel.permissionsFor(guild.members.cache.find(function (m) { var _a; return m.id === ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id); })).has(discord_js_1.PermissionFlagsBits.SendMessages); }).first();
    },
    patchPanelMessages: function (guild, client) {
        var _this = this;
        var payload = {
            method: "GET",
            baseURL: process.env.API_URL,
            url: "/guilds/".concat(guild.id, "/panels"),
            headers: {
                'x-auth-token': process.env.TOKEN
            }
        };
        (0, axios_1["default"])(payload).then(function (response) {
            var data = response.data.data.data;
            if (!data || data.length <= 0)
                console.log("Guild ".concat(guild.id, " has no panels. Tried to patch but couldn't."));
            data.forEach(function (panel) { return __awaiter(_this, void 0, void 0, function () {
                var pm;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!panel.embedMessage) return [3 /*break*/, 2];
                            pm = new PanelManager_1["default"](client, guild, panel);
                            return [4 /*yield*/, pm.sendEmbed()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            if (panel.embedMessage)
                                return [2 /*return*/];
                            return [2 /*return*/];
                    }
                });
            }); });
        })["catch"](function (err) {
            console.log("Guild ".concat(guild.id, " has no panels. Tried to patch but couldn't."));
        });
    }
};
