const { SlashCommandBuilder } = require('discord.js');
const { addLog } = require('../../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),
    async execute(interaction) {
        await interaction.reply('Pong!');

        const serverName = interaction.guild ? interaction.guild.name : 'DM';
        const channelName = interaction.channel ? interaction.channel.name : 'DM';

        // adding log
        addLog("info", "Pong!", serverName, channelName, interaction.user.tag);
    },
};