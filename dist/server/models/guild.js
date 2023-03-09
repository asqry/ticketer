"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const data = new mongoose_1.Schema({
    id: String,
    name: String,
    ownerId: String,
    updates_channel: { type: String, default: null, required: false },
    audit_log_channel: { type: String, default: null, required: false },
    member_role: { type: String, default: null, required: false },
    support_team_role: { type: String, default: null, required: false }
});
const guildsModel = (0, mongoose_1.model)('guild', data);
exports.default = guildsModel;
