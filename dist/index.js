"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const fs_1 = tslib_1.__importDefault(require("fs"));
const express_1 = tslib_1.__importDefault(require("express"));
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const socket_io_client_1 = require("socket.io-client");
require("dotenv/config");
const utils_1 = tslib_1.__importStar(require("./utils"));
const auditLogger_1 = tslib_1.__importDefault(require("./auditLogger"));
const PanelManager_1 = tslib_1.__importDefault(require("./managers/PanelManager"));
const app = (0, express_1.default)();
const client = new discord_js_1.Client({ intents: ['Guilds', 'GuildMembers', 'GuildPresences', 'GuildMessages', 'MessageContent'], presence: { activities: [{ name: 'New Tickets', type: discord_js_1.ActivityType.Watching }] } });
const ios = new socket_io_1.Server(6789);
const socket = (0, socket_io_client_1.io)(process.env.SOCKET_URL);
const loadEvents = () => {
    fs_1.default.readdir(`${__dirname}/events`, (er, files) => {
        if (er)
            return utils_1.default.log(utils_1.Log.ERROR, er.message);
        if (files.length == 0)
            return utils_1.default.log(utils_1.Log.ERROR, "No events found.");
        files.forEach(file => {
            const ev = require(`${__dirname}/events/${file}`).default;
            const event = new ev(client), eventname = file.slice(file.lastIndexOf('/') + 1, file.length - 3);
            if (!event.enabled)
                return;
            utils_1.default.log(utils_1.Log.SUCCESS, `Loaded ${eventname} Event!`);
            client.on(eventname, async (...args) => event.run(...args));
        });
    });
};
loadEvents();
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.locals.client = client;
    res.locals.socket = socket;
    next();
});
ios.on("connection", s => {
    utils_1.default.log(utils_1.Log.SUCCESS, "Initialized Socket 🔌");
    s.on("guild_option_edit", async (data) => {
        await auditLogger_1.default.logConfigEdit(client, data);
    });
    s.on("panel_create", async (data) => {
        let guild = client.guilds.cache.get(data.guildId);
        if (!guild)
            return;
        let pm = new PanelManager_1.default(client, guild, data);
        await pm.sendEmbed();
        await auditLogger_1.default.logPanelCreate(client, data);
    });
    s.on("panel_edit", async (data) => {
        let guild = client.guilds.cache.get(data.guildId);
        if (!guild)
            return;
        let pm = new PanelManager_1.default(client, guild, data.data.newValue);
        console.log(data.data.newValue);
        await pm.sendEmbed();
        await auditLogger_1.default.logPanelEdit(client, data);
    });
});
app.use('/guilds', require("./server/routes/guilds"));
app.listen(process.env.SERVER_PORT, () => {
    mongoose_1.default.set('strictQuery', true);
    mongoose_1.default.connect(process.env.MONGO_URI).then(() => {
        utils_1.default.log(utils_1.Log.SUCCESS, `DB connected to ${mongoose_1.default.connection.host}:${mongoose_1.default.connection.port}`);
    });
    utils_1.default.log(utils_1.Log.SUCCESS, `Listening to http://localhost:${process.env.SERVER_PORT}`);
});
process.on('exit', () => {
    client.destroy();
    socket.close();
    ios.close();
});
client.login(process.env.TOKEN);
