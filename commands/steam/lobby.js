const { SlashCommandBuilder } = require('discord.js');
const { getNowFormat } = require('../../utils');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lobby')
        .setDescription('Send link to the lobby if available'),
    async execute(interaction) {
        
        // checking if the user is in the steamIdList
        const steamIdList = JSON.parse(fs.readFileSync('steamIdList.json'));
        const authorTag = interaction.user.tag;
        if (!(authorTag in steamIdList)) {
            await interaction.reply('You need to save your Steam ID first! Use /steamid to do so.');
            return;
        }
        
        // sending steamjoin.com link to the lobby with the Steam ID
        await interaction.reply('https://steamjoin.com/' + steamIdList[authorTag]);
        
        // checking if the interaction is in a server or DM
        if (!interaction.guild) {
            var serverName = 'DM';
            var channelName = 'DM';
        } else {
            var serverName = interaction.guild.name;
            var channelName = interaction.channel.name;
        }

        // adding log
        console.log(JSON.stringify({
            timestamp: getNowFormat(),
            level: "info",
            server: serverName,
            channel: channelName,
            author: interaction.user.tag,
            message: "Lobby link sent"
        }));
    },
};