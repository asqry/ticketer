export default {
    branding: {
        embed: {
            colors: {
                neutral: 'D65DB1',
                success: 'C4FCEF',
                warning: 'F9F871',
                error: 'C34A36'
            },
            titles: {
                // neutral: '🎟️ Ticketer',
                // success: '✅ Success!',
                // warning: '⚠️',
                // error: '🚫 Oh no!'
                neutral: '',
                success: '',
                warning: '',
                error: ''
            }
        }
    },
    modules: {
    },
    /*
        Messages support placeholders:
        u: user (will default to the guild owner)
        g: guild
        c: client
        cu: client user
        user will always be the user that initiated the interaction
        format: %object_property
        example: '%g_ownerId' = guild.ownerId
    */
    messages: {
        welcome_embed_content: "👋 %u_user, thank you for adding %cu_tag!",
        welcome_embed_description: "For a list of commands, run </hello:1079419220925886515>",
        goodbye_embed_content: "👋",
        goodbye_embed_description: 'We\'ll miss you!\n\nIf you ever change your mind, feel free to [add me back to %g_name](https://discord.com/api/oauth2/authorize?client_id=1079418317166612561&permissions=8&scope=bot%20applications.commands&guild_id=%g_id "Click to add %cu_username to %g_name") any time.'
    },
    channels: {
        verify_channel: '1028469834234724402'
    },
    configurable_options: {
        settings: ['updates_channel#channel', 'audit_log_channel#channel', 'member_role#role', 'support_team_role#role']
    }

}