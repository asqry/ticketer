"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const data = new mongoose_1.Schema({
    id: {
        required: true
    },
    guildId: {
        required: true
    },
    defaultRoleId: {
        required: true
    },
    raisedRoleId: {
        required: false
    },
    tickets: {
        required: true,
        default: []
    }
});
const panelsModel = (0, mongoose_1.model)('panel', data);
exports.default = panelsModel;
