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
                    "- `/help` gives infos and command list\n" +
                    "- `/ping` replies with pong.\n" +
                    "- `/checkpermissions` checks if the bot has all the required permissions in the current channel.\n" +
                    "- `/steamid` saves the steam id for a specific discord user.\n" +
                    "- `/lobby` fetches the joinlobby link from the steam profile page of a saved user.\n" +
                    "- `/custom` creates a custom short link.\n" +
                    "- `/fuckyouterry` adds the user in Terry's blacklist to never interact with it.\n" +
                    "- `/loveyouterry` removes the user from Terry's blacklist\n" +
                    "\n" +
                    "Terry automatically converts steam joinlobby links to clickable links.\n" +
                    "The bot will react to messages thanking him with an emoji.\n" +
                    "For more information, please visit the [GitHub repository](https://github.com/GN4RK/terry).\n" +
                    "Privacy Policy : https://gn4rk.com/terry/Terry%20-%20Privacy%20Policy.pdf \n" +
                    "Terms of Service : https://gn4rk.com/terry/Terry%20-%20Terms%20of%20Service.pdf"
            }],
            ephemeral: true
        });

        const serverName = interaction.guild ? interaction.guild.id + ":" + interaction.guild.name : 'DM';
        const channelName = interaction.channel ? interaction.channel.name : 'DM';

        addLog("info", "Help command", serverName, channelName, interaction.user.tag);
    },
};