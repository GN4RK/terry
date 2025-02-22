const { SlashCommandBuilder } = require('discord.js');
const { addLog } = require('../../utils');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lobby')
        .setDescription('Send link to the lobby if available'),
    async execute(interaction) {

        const serverName = interaction.guild ? interaction.guild.id + ":" + interaction.guild.name : 'DM';
        const channelName = interaction.channel ? interaction.channel.name : 'DM';
        
        // checking if the user is in the steamIdList
        const steamIdList = JSON.parse(fs.readFileSync('steamIdList.json', 'utf8'));
        const authorTag = interaction.user.tag;
        if (!(authorTag in steamIdList)) {
            await interaction.reply('You need to save your Steam ID first! Use /steamid to do so.');
            addLog("warning", "Lobby link not sent: Steam ID not saved", serverName, channelName, authorTag);
            return;
        }
        
        // sending steamjoin.com link to the lobby with the Steam ID
        await interaction.reply('https://steamjoin.com/' + steamIdList[authorTag]);
        addLog("info", "Lobby link sent", serverName, channelName, authorTag);
    },
};