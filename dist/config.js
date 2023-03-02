"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    branding: {
        embed: {
            colors: {
                neutral: 'D65DB1',
                success: 'C4FCEF',
                warning: 'F9F871',
                error: 'C34A36'
            },
            titles: {
                neutral: '',
                success: '',
                warning: '',
                error: ''
            }
        }
    },
    modules: {},
    messages: {
        welcome_embed_content: "👋 %u_user, thank you for adding %cu_tag!",
        welcome_embed_description: "For a list of commands, run </hello:1079419220925886515>",
        goodbye_embed_content: "👋",
        goodbye_embed_description: "We'll miss you!\n\nIf you ever change your mind, feel free to add me back to `%g_name` any time."
    },
    channels: {
        verify_channel: '1028469834234724402'
    },
    configurable_options: {
        settings: ['updates_channel#channel', 'audit_log_channel#channel', 'member_role#role',]
    }
};
