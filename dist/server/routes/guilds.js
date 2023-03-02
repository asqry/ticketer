"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("dotenv/config");
const express_1 = tslib_1.__importDefault(require("express"));
const utils_1 = tslib_1.__importStar(require("../../utils"));
const guild_1 = tslib_1.__importDefault(require("../models/guild"));
const router = express_1.default.Router();
async function auth(req) {
    let authKey = req.headers['x-auth-token'];
    if (!authKey || authKey !== process.env.TOKEN) {
        return false;
    }
    return true;
}
router.get("/", async (req, res) => {
    let isAuthed = await auth(req);
    if (!isAuthed)
        return utils_1.default.apiResponse(utils_1.HttpCode.UNAUTHORIZED, res);
    utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res);
});
router.get('/:id', async (req, res) => {
    let isAuthed = await auth(req);
    const guildId = req.params.id;
    if (!isAuthed)
        return utils_1.default.apiResponse(utils_1.HttpCode.UNAUTHORIZED, res);
    if (!guildId)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    const apiGuild = await guild_1.default.findOne({ id: guildId });
    if (!apiGuild)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' });
    utils_1.default.apiResponse(utils_1.HttpCode.OK, res, apiGuild);
});
router.get('/:id/config/:option', async (req, res) => {
    let isAuthed = await auth(req);
    const guildId = req.params.id;
    const option = req.params.option.toLowerCase();
    if (!isAuthed)
        return utils_1.default.apiResponse(utils_1.HttpCode.UNAUTHORIZED, res);
    if (!guildId)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    if (!option)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    const apiGuild = await guild_1.default.findOne({ id: guildId });
    if (!apiGuild)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' });
    if (!apiGuild[option])
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Config option does not exist.' });
    let data = {};
    data[option] = apiGuild[option];
    utils_1.default.apiResponse(utils_1.HttpCode.OK, res, { ...data });
});
router.get('/:id/config', async (req, res) => {
    let isAuthed = await auth(req);
    const guildId = req.params.id;
    if (!isAuthed)
        return utils_1.default.apiResponse(utils_1.HttpCode.UNAUTHORIZED, res);
    if (!guildId)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    const apiGuild = await guild_1.default.findOne({ id: guildId });
    if (!apiGuild)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' });
    let mentions = {
        'role': '<@&[id]>',
        'channel': '<#[id]>'
    };
    let keys = Object.keys(apiGuild.toJSON()).filter(x => x.endsWith("_role") || x.endsWith("_channel"));
    let map = keys.map(key => ({ key, value: apiGuild[key] != null ? mentions[key.split("_")[key.split("_").length - 1]].replace(/\[id\]/gim, apiGuild[key]) : 'not set' }));
    utils_1.default.apiResponse(utils_1.HttpCode.OK, res, { map });
});
router.patch('/:id/config/:option', async (req, res) => {
    let isAuthed = await auth(req);
    const payload = req.body;
    const guildId = req.params.id;
    const option = req.params.option;
    if (!isAuthed)
        return utils_1.default.apiResponse(utils_1.HttpCode.UNAUTHORIZED, res);
    if (!guildId)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    if (!option)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    if (!payload || !payload.value || !payload.editedBy)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    const apiGuild = await guild_1.default.findOne({ id: guildId });
    if (!apiGuild)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' });
    let oldApiGuild = apiGuild.toJSON();
    apiGuild[option] = payload.value;
    apiGuild.save().then((document) => {
        utils_1.default.apiResponse(utils_1.HttpCode.OK, res, document);
        res.locals.socket.emit("guild_option_edit", { guildId: apiGuild.id, data: { option: option, oldValue: oldApiGuild[option], newValue: apiGuild[option], editedBy: payload.editedBy, } });
    }).catch(err => {
        utils_1.default.apiResponse(utils_1.HttpCode.INTERNAL_SERVER_ERROR, res, err);
    });
});
router.post('/create', async (req, res) => {
    let isAuthed = await auth(req);
    const payload = req.body;
    const client = res.locals.client;
    const apiGuild = await guild_1.default.findOne({ id: payload.id });
    if (!isAuthed)
        return utils_1.default.apiResponse(utils_1.HttpCode.UNAUTHORIZED, res);
    if (apiGuild)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res, { message: 'Guild already exists.' });
    if (!payload || !payload.id)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    let discordGuild = client.guilds.cache.get(payload.id);
    if (!discordGuild)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res, { message: 'Client is not in the guild.' });
    let newGuild = new guild_1.default({
        id: payload.id,
        name: discordGuild.name,
        ownerId: discordGuild.ownerId
    });
    if (!newGuild)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    newGuild.save().then((document) => {
        utils_1.default.apiResponse(utils_1.HttpCode.OK, res, document);
    }).catch(err => {
        utils_1.default.apiResponse(utils_1.HttpCode.INTERNAL_SERVER_ERROR, res, err);
    });
});
router.delete('/delete/:id', async (req, res) => {
    let isAuthed = await auth(req);
    const guildId = req.params.id;
    if (!isAuthed)
        return utils_1.default.apiResponse(utils_1.HttpCode.UNAUTHORIZED, res);
    if (!guildId)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    const apiGuild = await guild_1.default.findOne({ id: guildId });
    if (!apiGuild)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' });
    apiGuild.deleteOne({ id: guildId }).then(() => {
        utils_1.default.apiResponse(utils_1.HttpCode.OK, res);
    }).catch(err => {
        return utils_1.default.apiResponse(utils_1.HttpCode.INTERNAL_SERVER_ERROR, res, { message: 'Failed to delete guild.' });
    });
});
module.exports = router;
