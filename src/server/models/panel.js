"use strict";
exports.__esModule = true;
exports.TicketType = void 0;
var mongoose_1 = require("mongoose");
var config_1 = require("../../config");
var TicketType;
(function (TicketType) {
    TicketType[TicketType["NORMAL_UNRAISABLE_UNCLAIMABLE"] = 1] = "NORMAL_UNRAISABLE_UNCLAIMABLE";
    TicketType[TicketType["NORMAL_UNRAISABLE_CLAIMABLE"] = 2] = "NORMAL_UNRAISABLE_CLAIMABLE";
    TicketType[TicketType["NORMAL_RAISABLE_UNCLAIMABLE"] = 3] = "NORMAL_RAISABLE_UNCLAIMABLE";
    TicketType[TicketType["NORMAL_RAISABLE_CLAIMABLE"] = 4] = "NORMAL_RAISABLE_CLAIMABLE";
    TicketType[TicketType["ADMIN_UNRAISABLE_UNCLAIMABLE"] = 5] = "ADMIN_UNRAISABLE_UNCLAIMABLE";
    TicketType[TicketType["ADMIN_UNRAISABLE_CLAIMABLE"] = 6] = "ADMIN_UNRAISABLE_CLAIMABLE";
    TicketType[TicketType["ADMIN_RAISABLE_UNCLAIMABLE"] = 7] = "ADMIN_RAISABLE_UNCLAIMABLE";
    TicketType[TicketType["ADMIN_RAISABLE_CLAIMABLE"] = 8] = "ADMIN_RAISABLE_CLAIMABLE";
})(TicketType = exports.TicketType || (exports.TicketType = {}));
var data = new mongoose_1.Schema({
    id: String,
    guildId: String,
    embedChannel: String,
    ticketParentChannel: String,
    defaultRole: String,
    raisedRole: String,
    embedMessage: String,
    color: {
        type: String,
        "default": config_1["default"].branding.embed.colors.neutral
    },
    name: {
        type: String,
        "default": "Ticket Panel"
    },
    image: {
        type: String
    },
    ticketTypes: [],
    tickets: []
});
var panelsModel = (0, mongoose_1.model)('panel', data);
exports["default"] = panelsModel;
