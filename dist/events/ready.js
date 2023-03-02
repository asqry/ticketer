"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = tslib_1.__importStar(require("../utils"));
const commands_1 = require("../commands");
class Ready {
    client;
    enabled;
    constructor(client) {
        this.client = client;
        this.enabled = true;
    }
    async run() {
        let client = this.client;
        if (!client.user || !client.application)
            return;
        await client.application.commands.set(commands_1.Commands);
        utils_1.default.log(utils_1.Log.SUCCESS, `${client.user.tag} is online!`);
    }
}
exports.default = Ready;
