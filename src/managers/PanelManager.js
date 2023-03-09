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
var discord_js_1 = require("discord.js");
var utils_1 = require("../utils");
var axios_1 = require("axios");
var PanelManager = /** @class */ (function () {
    function PanelManager(client, guild, panel) {
        this.client = client;
        this.guild = guild;
        this.panel = panel;
    }
    PanelManager.prototype.channel = function () {
        var channel = this.guild.channels.cache.get(this.panel.embedChannel);
        if (!channel)
            return null;
        return channel;
    };
    Object.defineProperty(PanelManager.prototype, "name", {
        get: function () {
            return this.panel.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PanelManager.prototype, "color", {
        get: function () {
            return this.panel.color;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PanelManager.prototype, "imageUrl", {
        get: function () {
            return this.panel.image;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PanelManager.prototype, "tickets", {
        get: function () {
            return this.panel.ticketTypes;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PanelManager.prototype, "messageId", {
        get: function () {
            return this.panel.embedMessage;
        },
        enumerable: false,
        configurable: true
    });
    PanelManager.prototype.setMessageId = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                payload = {
                    method: "PATCH",
                    baseURL: process.env.API_URL,
                    url: "/guilds/".concat(this.guild.id, "/panels/").concat(this.panel.id),
                    data: JSON.stringify({ embedMessage: message.id }),
                    headers: {
                        'x-auth-token': process.env.TOKEN
                    }
                };
                (0, axios_1["default"])(payload).then(function (response) {
                    console.log(response);
                })["catch"](function (err) {
                    utils_1["default"].log(utils_1.Log.ERROR, err);
                });
                return [2 /*return*/];
            });
        });
    };
    PanelManager.prototype.buildButtons = function () {
        var _this = this;
        var t = [];
        this.tickets.forEach(function (ticket) {
            var bb = new discord_js_1.ButtonBuilder();
            bb.setStyle(discord_js_1.ButtonStyle.Secondary).setCustomId("open-".concat(_this.panel.id, "-").concat(ticket.type, "-").concat(ticket.name)).setEmoji(ticket.emoji).setLabel(ticket.name);
            t.push(bb);
        });
        return t;
    };
    PanelManager.prototype.findOldMessage = function (channel) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.messageId)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, channel.messages.fetch(this.messageId)];
                    case 1:
                        message = _a.sent();
                        if (!message)
                            return [2 /*return*/, null];
                        return [2 /*return*/, message];
                }
            });
        });
    };
    PanelManager.prototype.sendEmbed = function () {
        return __awaiter(this, void 0, void 0, function () {
            var channel, oldMessage, embed, row, emb;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        channel = this.channel();
                        if (!channel)
                            return [2 /*return*/, utils_1["default"].log(utils_1.Log.ERROR, "Couldn't find the panel channel")];
                        return [4 /*yield*/, this.findOldMessage(channel)];
                    case 1:
                        oldMessage = _a.sent();
                        embed = [utils_1["default"].embed(utils_1.DiscordEmbedType.NEUTRAL, "*Click a button below to open a ticket*\n_**".concat(this.tickets.length, "** available ticket types_"), { title: this.name, color: this.color, image: { url: this.imageUrl ? this.imageUrl : "" } })];
                        row = new discord_js_1.ActionRowBuilder().addComponents(this.buildButtons());
                        emb = { embeds: embed };
                        if (this.buildButtons().length > 0)
                            emb.components = [row];
                        if (!oldMessage)
                            channel.send(emb).then(function (m) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.setMessageId(m)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); });
                        if (oldMessage && (oldMessage === null || oldMessage === void 0 ? void 0 : oldMessage.deletable) && oldMessage.embeds !== emb.embeds || (oldMessage === null || oldMessage === void 0 ? void 0 : oldMessage.components) && oldMessage.components !== emb.components) {
                            oldMessage["delete"]().then(function () {
                                channel.send(emb).then(function (m) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.setMessageId(m)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                }); }); });
                            })["catch"](function (err) {
                                // utils.log(Log.ERROR, err)
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return PanelManager;
}());
exports["default"] = PanelManager;
