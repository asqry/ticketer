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
var utils_1 = require("./utils");
exports["default"] = {
    logConfigEdit: function (client, log) {
        return __awaiter(this, void 0, void 0, function () {
            var guild, _a, option, editedBy, map, optionType, user, mentionable, updatesChannel;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        guild = client.guilds.cache.get(log.guildId);
                        if (!guild)
                            return [2 /*return*/];
                        _a = log.data, option = _a.option, editedBy = _a.editedBy;
                        map = {
                            'role': utils_1["default"].configValues.getRole,
                            'channel': utils_1["default"].configValues.getTextChannel
                        };
                        optionType = option.toLowerCase().endsWith("role") ? "role" : option.toLowerCase().endsWith("channel") ? 'channel' : null;
                        if (!optionType || optionType == null)
                            return [2 /*return*/];
                        user = guild.members.cache.get(editedBy);
                        if (!user)
                            return [2 /*return*/];
                        return [4 /*yield*/, map[optionType](guild, option)];
                    case 1:
                        mentionable = _b.sent();
                        if (!mentionable)
                            return [2 /*return*/];
                        return [4 /*yield*/, utils_1["default"].configValues.getTextChannel(guild, 'audit_log_channel')];
                    case 2:
                        updatesChannel = _b.sent();
                        if (!updatesChannel)
                            return [2 /*return*/];
                        updatesChannel.send({ embeds: [utils_1["default"].embed(utils_1.DiscordEmbedType.NEUTRAL, "", { title: "Config value `".concat(option, "` was edited"), fields: [{ name: 'Set To', value: "".concat(mentionable), inline: true }, { name: 'Edited By', value: "".concat(user), inline: true }], timestamp: (new Date()).toISOString() })] });
                        return [2 /*return*/];
                }
            });
        });
    },
    logPanelCreate: function (client, log) {
        return __awaiter(this, void 0, void 0, function () {
            var guild, createdBy, name, id, embedChannel, user, channel, updatesChannel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        guild = client.guilds.cache.get(log.guildId);
                        if (!guild)
                            return [2 /*return*/];
                        createdBy = log.createdBy, name = log.name, id = log.id, embedChannel = log.embedChannel;
                        user = guild.members.cache.get(createdBy);
                        if (!user)
                            return [2 /*return*/];
                        channel = guild.channels.cache.get(embedChannel);
                        if (!channel)
                            return [2 /*return*/];
                        return [4 /*yield*/, utils_1["default"].configValues.getTextChannel(guild, 'audit_log_channel')];
                    case 1:
                        updatesChannel = _a.sent();
                        if (!updatesChannel)
                            return [2 /*return*/];
                        updatesChannel.send({ embeds: [utils_1["default"].embed(utils_1.DiscordEmbedType.NEUTRAL, "_**Panel ID:** ".concat(id, "_"), { title: "A panel was created", fields: [{ name: 'Name', value: "".concat(name), inline: true }, { name: 'Created By', value: "".concat(user), inline: true }, { name: 'Channel', value: "".concat(channel), inline: true }], timestamp: (new Date()).toISOString() })] });
                        return [2 /*return*/];
                }
            });
        });
    },
    logPanelEdit: function (client, log) {
        return __awaiter(this, void 0, void 0, function () {
            var guild, editedBy, id, user, updatesChannel, values, replace, valueMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        guild = client.guilds.cache.get(log.guildId);
                        if (!guild)
                            return [2 /*return*/];
                        editedBy = log.editedBy, id = log.id;
                        user = guild.members.cache.get(editedBy);
                        if (!user)
                            return [2 /*return*/];
                        return [4 /*yield*/, utils_1["default"].configValues.getTextChannel(guild, 'audit_log_channel')];
                    case 1:
                        updatesChannel = _a.sent();
                        if (!updatesChannel)
                            return [2 /*return*/];
                        values = {};
                        replace = {
                            'role': '<@&[id]>',
                            'channel': '<#[id]>'
                        };
                        log.data.changedEntries.forEach(function (entry) {
                            var oldValue = log.data.oldValue[entry];
                            var newValue = log.data.newValue[entry];
                            if (oldValue !== newValue)
                                values[entry] = { type: entry.toLowerCase().endsWith('channel') ? 'channel' : entry.toLowerCase().endsWith('role') ? 'role' : 'base', oldValue: oldValue, newValue: newValue };
                        });
                        valueMap = Object.entries(values).map(function (entry) { return "**".concat(entry[0], "**\n> ").concat(replace[entry[1].type] ? replace[entry[1].type].replace(/\[id\]/gim, entry[1].oldValue) : entry[1].oldValue, " -> ").concat(replace[entry[1].type] ? replace[entry[1].type].replace(/\[id\]/gim, entry[1].newValue) : entry[1].newValue, "\n\n"); }).join("") || "None";
                        updatesChannel.send({ embeds: [utils_1["default"].embed(utils_1.DiscordEmbedType.NEUTRAL, "_Changed **".concat(log.data.changedEntries.length, "** value").concat(log.data.changedEntries.length == 1 ? '' : 's', "_\n\n__**Edited Values**__\n").concat(valueMap), { title: "Panel `".concat(id, "` was edited"), fields: [{ name: 'Name', value: "".concat(log.data.newValue.name), inline: true }, { name: 'Edited By', value: "".concat(user), inline: true }], timestamp: (new Date()).toISOString() })] });
                        return [2 /*return*/];
                }
            });
        });
    }
};
