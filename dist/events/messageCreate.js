"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MessageCreate {
    client;
    enabled;
    constructor(client) {
        this.client = client;
        this.enabled = true;
    }
    async run(message) {
        let client = this.client;
        if (message.author.bot)
            return;
    }
}
exports.default = MessageCreate;
