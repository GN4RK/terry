const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { addLog} = require('../../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkpermissions')
        .setDescription('Check if the bot has all the required permissions in the current channel'),
    async execute(interaction) {

        // Check if the command is being used in a guild
        if (!interaction.guild) {
            await interaction.reply('This command can only be used in a guild.');
            addLog("warning", "Check permissions failed: not in a guild", "DM", undefined, interaction.user.tag);
            return;
        }

        // fetching infos
        const serverName = interaction.guild.id + ":" + interaction.guild.name;
        const channelName = interaction.channel.name;
        const authorTag = interaction.user.tag;

        // List of permissions to check
        const permissionsNeeded = {
            "ViewChannel"   : PermissionsBitField.Flags.ViewChannel,
            "SendMessages"  : PermissionsBitField.Flags.SendMessages,
            "EmbedLinks"    : PermissionsBitField.Flags.EmbedLinks,
            "AddReactions"  : PermissionsBitField.Flags.AddReactions
        };

        // Checking channel's permissions one by one
        for (const [key, value] of Object.entries(permissionsNeeded)) {
            if (!interaction.channel.permissionsFor(interaction.client.user).has(value)) {
                await interaction.reply(`The bot does not have the '${key}' permission in this channel.`);
                addLog("error", `Check permissions failed: ${key}`, serverName, channelName, authorTag);
                return;
            }
        }

        // Replying to the user
        await interaction.reply('The bot has all the required permissions in this channel.');

        // adding log
        addLog("info", "Check permissions success", serverName, channelName, authorTag);
    },
};