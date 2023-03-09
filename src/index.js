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
var fs_1 = require("fs");
var express_1 = require("express");
var mongoose_1 = require("mongoose");
var cors_1 = require("cors");
var socket_io_1 = require("socket.io");
var socket_io_client_1 = require("socket.io-client");
require("dotenv/config");
var utils_1 = require("./utils");
var auditLogger_1 = require("./auditLogger");
var PanelManager_1 = require("./managers/PanelManager");
var app = (0, express_1["default"])();
var client = new discord_js_1.Client({ intents: ['Guilds', 'GuildMembers', 'GuildPresences', 'GuildMessages', 'MessageContent'], presence: { activities: [{ name: 'New Tickets', type: discord_js_1.ActivityType.Watching }] } });
var ios = new socket_io_1.Server(6789);
var socket = (0, socket_io_client_1.io)(process.env.SOCKET_URL);
var loadEvents = function () {
    fs_1["default"].readdir("".concat(__dirname, "/events"), function (er, files) {
        if (er)
            return utils_1["default"].log(utils_1.Log.ERROR, er.message);
        if (files.length == 0)
            return utils_1["default"].log(utils_1.Log.ERROR, "No events found.");
        files.forEach(function (file) {
            var ev = require("".concat(__dirname, "/events/").concat(file))["default"];
            var event = new ev(client), eventname = file.slice(file.lastIndexOf('/') + 1, file.length - 3);
            if (!event.enabled)
                return;
            utils_1["default"].log(utils_1.Log.SUCCESS, "Loaded ".concat(eventname, " Event!"));
            client.on(eventname, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, event.run.apply(event, args)];
                }); });
            });
        });
    });
};
loadEvents();
app.use((0, cors_1["default"])());
app.use(express_1["default"].urlencoded({
    extended: true
}));
app.use(express_1["default"].json());
app.use(function (req, res, next) {
    res.locals.client = client;
    res.locals.socket = socket;
    next();
});
ios.on("connection", function (s) {
    utils_1["default"].log(utils_1.Log.SUCCESS, "Initialized Socket 🔌");
    s.on("guild_option_edit", function (data) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, auditLogger_1["default"].logConfigEdit(client, data)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    s.on("panel_create", function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var guild, pm;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    guild = client.guilds.cache.get(data.guildId);
                    if (!guild)
                        return [2 /*return*/];
                    pm = new PanelManager_1["default"](client, guild, data);
                    return [4 /*yield*/, pm.sendEmbed()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, auditLogger_1["default"].logPanelCreate(client, data)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    s.on("panel_edit", function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var guild, pm;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    guild = client.guilds.cache.get(data.guildId);
                    if (!guild)
                        return [2 /*return*/];
                    pm = new PanelManager_1["default"](client, guild, data.data.newValue);
                    console.log(data.data.newValue);
                    return [4 /*yield*/, pm.sendEmbed()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, auditLogger_1["default"].logPanelEdit(client, data)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
app.use('/guilds', require("./server/routes/guilds"));
app.listen(process.env.SERVER_PORT, function () {
    mongoose_1["default"].set('strictQuery', true);
    mongoose_1["default"].connect(process.env.MONGO_URI).then(function () {
        utils_1["default"].log(utils_1.Log.SUCCESS, "DB connected to ".concat(mongoose_1["default"].connection.host, ":").concat(mongoose_1["default"].connection.port));
    });
    utils_1["default"].log(utils_1.Log.SUCCESS, "Listening to http://localhost:".concat(process.env.SERVER_PORT));
});
process.on('exit', function () {
    client.destroy();
    socket.close();
    ios.close();
});
client.login(process.env.TOKEN);
