const { SlashCommandBuilder } = require('discord.js');
const { addLog} = require('../../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Provides information needed to understand how to use the bot and new features'),
    async execute(interaction) {
        // response visible only to the user
        await interaction.reply({
            embeds: [{
                title: "Terry's help",
                description: "Terry is a bot that helps you to play with your friends on Steam.\n\n" +
                    "You can use the following commands to interact with Terry:\n" +
                    "• `/help` - Provides information needed to understand how to use the bot and new features\n" +
                    "• `/checkpermissions` - Check if the bot has all the required permissions in the current channel\n" +
                    "• `/ping` - Replies with pong!\n" +
                    "• `/steamid` - Save your Steam ID to Terry\'s brain\n" +
                    "• `/lobby` - Send link to the lobby if available\n" +

                    "\n\n" +

                    "Terry automatically converts steam joinlobby links to clickable links. " +
                    "The bot will react to messages thanking him with an emoji. " +
                    "For more information, please visit the [GitHub repository](https://github.com/GN4RK/terry)."
            }],
            ephemeral: true
        });

        const serverName = interaction.guild ? interaction.guild.name : 'DM';
        const channelName = interaction.channel ? interaction.channel.name : 'DM';

        addLog("info", "Help command", serverName, channelName, interaction.user.tag);
    },
};