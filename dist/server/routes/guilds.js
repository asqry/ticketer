"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("dotenv/config");
const express_1 = tslib_1.__importDefault(require("express"));
const utils_1 = tslib_1.__importStar(require("../../utils"));
const guild_1 = tslib_1.__importDefault(require("../models/guild"));
const random_string_1 = tslib_1.__importDefault(require("random-string"));
const panel_1 = tslib_1.__importDefault(require("../models/panel"));
const router = express_1.default.Router();
function generateId() {
    let id = (0, random_string_1.default)({ length: 12, special: false, numeric: true, letters: true });
    return id;
}
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
router.get('/:id/panels', async (req, res) => {
    let isAuthed = await auth(req);
    const guildId = req.params.id;
    if (!isAuthed)
        return utils_1.default.apiResponse(utils_1.HttpCode.UNAUTHORIZED, res);
    if (!guildId)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    const apiGuild = await guild_1.default.findOne({ id: guildId });
    if (!apiGuild)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' });
    const apiPanels = await panel_1.default.find({ guildId: guildId });
    if (!apiPanels || apiPanels.length <= 0)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: `No panels exist for guild ${apiGuild.id}.` });
    return utils_1.default.apiResponse(utils_1.HttpCode.OK, res, apiPanels);
});
router.get('/:id/panels/:panelId', async (req, res) => {
    let isAuthed = await auth(req);
    const guildId = req.params.id;
    const panelId = req.params.panelId;
    if (!isAuthed)
        return utils_1.default.apiResponse(utils_1.HttpCode.UNAUTHORIZED, res);
    if (!guildId)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    const apiGuild = await guild_1.default.findOne({ id: guildId });
    if (!apiGuild)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' });
    const apiPanel = await panel_1.default.findOne({ guildId: guildId, id: panelId });
    if (!apiPanel)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Panel does not exist.' });
    return utils_1.default.apiResponse(utils_1.HttpCode.OK, res, apiPanel);
});
router.post('/:id/panels/create', async (req, res) => {
    let isAuthed = await auth(req);
    const guildId = req.params.id;
    const payload = req.body;
    const panelId = generateId();
    if (!isAuthed)
        return utils_1.default.apiResponse(utils_1.HttpCode.UNAUTHORIZED, res);
    if (!guildId)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    if (!payload || !payload.embedChannel || !payload.ticketParentChannel || !payload.createdBy)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    const apiGuild = await guild_1.default.findOne({ id: guildId });
    if (!apiGuild)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' });
    if (!apiGuild.support_team_role)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res, { message: 'You must set the support_team_role option' });
    payload.id = panelId;
    payload.guildId = apiGuild.id;
    if (!payload.defaultRole)
        payload.defaultRole = apiGuild.support_team_role;
    let newPanel = new panel_1.default(payload);
    newPanel.save().then((document) => {
        utils_1.default.apiResponse(utils_1.HttpCode.OK, res, document);
        res.locals.socket.emit("panel_create", { ...payload });
    }).catch(err => {
        utils_1.default.apiResponse(utils_1.HttpCode.INTERNAL_SERVER_ERROR, res, err);
    });
});
router.patch('/:id/panels/:panelId', async (req, res) => {
    let isAuthed = await auth(req);
    const guildId = req.params.id;
    const panelId = req.params.panelId;
    const payload = req.body;
    let anonymous = false;
    let isAnonymous = req.headers['x-anonymous'];
    if (!isAnonymous || isAnonymous == "0")
        anonymous = false;
    if (isAnonymous == "1")
        anonymous = true;
    if (!isAuthed)
        return utils_1.default.apiResponse(utils_1.HttpCode.UNAUTHORIZED, res);
    if (!guildId)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    if (!panelId)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    if (!payload)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    if (!payload.editedBy && !anonymous)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    const apiGuild = await guild_1.default.findOne({ id: guildId });
    if (!apiGuild)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' });
    if (!apiGuild.support_team_role)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res, { message: 'You must set the support_team_role option' });
    const apiPanel = await panel_1.default.findOne({ guildId: guildId, id: panelId });
    if (!apiPanel)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Panel does not exist.' });
    let oldApiPanel = JSON.stringify(apiPanel);
    Object.entries(payload).forEach(entry => {
        apiPanel[entry[0]] = entry[1];
    });
    apiPanel.save().then((document) => {
        utils_1.default.apiResponse(utils_1.HttpCode.OK, res, document);
        res.locals.socket.emit("panel_edit", { id: panelId, guildId: guildId, anonymous, editedBy: payload.editedBy ? payload.editedBy : null, data: { oldValue: JSON.parse(oldApiPanel), newValue: apiPanel, changedEntries: Object.keys(payload).filter((x) => x !== "editedBy") } });
    }).catch(err => {
        utils_1.default.apiResponse(utils_1.HttpCode.INTERNAL_SERVER_ERROR, res, err);
    });
});
router.delete('/:id/panels/:panelId', async (req, res) => {
    let isAuthed = await auth(req);
    const guildId = req.params.id;
    const panelId = req.params.panelId;
    if (!isAuthed)
        return utils_1.default.apiResponse(utils_1.HttpCode.UNAUTHORIZED, res);
    if (!guildId)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    if (!panelId)
        return utils_1.default.apiResponse(utils_1.HttpCode.BAD_REQUEST, res);
    const apiGuild = await guild_1.default.findOne({ id: guildId });
    if (!apiGuild)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Guild does not exist.' });
    const apiPanel = await panel_1.default.findOne({ guildId: guildId, id: panelId });
    if (!apiPanel)
        return utils_1.default.apiResponse(utils_1.HttpCode.NOT_FOUND, res, { message: 'Panel does not exist.' });
    apiPanel.deleteOne({ guildId: guildId, id: panelId }).then((document) => {
        utils_1.default.apiResponse(utils_1.HttpCode.OK, res, document);
        res.locals.socket.emit("panel_delete", apiPanel);
    }).catch(err => {
        utils_1.default.apiResponse(utils_1.HttpCode.INTERNAL_SERVER_ERROR, res, err);
    });
});
module.exports = router;
