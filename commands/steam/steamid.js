const { SlashCommandBuilder } = require('discord.js');
const { getNowFormat } = require('../../utils');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steamid')
        .setDescription('Save your Steam ID to Terry\'s brain.')
        .addStringOption(option => 
            option.setName('steamid')
                .setDescription(
                    'can be a Steam ID, a Steam profile URL or a Steam custom URL'
                )
                .setRequired(true)),

    async execute(interaction) {
        
        // fetching infos
        var steamId = interaction.options.getString('steamid');
        const authorTag = interaction.user.tag;
        const serverName = interaction.guild ? interaction.guild.name : 'DM';
        const channelName = interaction.channel ? interaction.channel.name : 'DM';

        // fetching steamIdList
        const steamIdList = JSON.parse(fs.readFileSync('steamIdList.json'));

        // checking if the Steam ID is valid: only letters, numbers and dash are allowed
        const regexSteamId = /^(?:https:\/\/steamcommunity\.com\/(?:id|profiles)\/)?([A-Za-z0-9_-]+)\/?$/;
        const match = steamId.match(regexSteamId);
        if (!match) {
            await interaction.reply('Invalid Steam ID! Should be a Steam ID, a Steam profile URL or a Steam custom URL.');
            return;
        }

        // removing the https://steamcommunity.com/id/ part
        steamId = match[1];

        // checking if the Steam ID is already saved
        if (authorTag in steamIdList) {
            if (steamIdList[authorTag] != steamId) {
                steamIdList[authorTag] = steamId;
                fs.writeFileSync('steamIdList.json', JSON.stringify(steamIdList));
                await interaction.reply('Steam ID updated for ' + authorTag);
                
                // adding log
                console.log(JSON.stringify({
                    timestamp: getNowFormat(),
                    level: "info",
                    server: serverName,
                    channel: channelName,
                    author: interaction.user.tag,
                    message: "Steam ID updated"
                }));

            } else {
                await interaction.reply('Your Steam ID is already saved!');

                //adding log
                const serverName = interaction.guild ? interaction.guild.name : 'DM';
                const channelName = interaction.channel ? interaction.channel.name : 'DM';
                console.log(JSON.stringify({
                    timestamp: getNowFormat(),
                    level: "info",
                    server: serverName,
                    channel: channelName,
                    author: interaction.user.tag,
                    message: "Steam ID already saved"
                }));
            }
            return;
        }

        // saving the Steam ID in json format
        steamIdList[authorTag] = steamId;
        fs.writeFileSync('steamIdList.json', JSON.stringify(steamIdList));
        await interaction.reply('Steam ID saved for ' + authorTag);

        // adding log
        console.log(JSON.stringify({
            timestamp: getNowFormat(),
            level: "info",
            server: serverName,
            channel: channelName,
            author: interaction.user.tag,
            message: "Steam ID saved"
        }));
    },
};