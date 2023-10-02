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
                    'https://steamcommunity.com/id/test/ -> test; ' +
                    'https://steamcommunity.com/profiles/1234 -> 1234'
                )
                .setRequired(true)),

    async execute(interaction) {
        
        // fetching infos
        const steamId = interaction.options.getString('steamid');
        const authorTag = interaction.user.tag;

        // fetching steamIdList
        const steamIdList = JSON.parse(fs.readFileSync('steamIdList.json'));

        // checking if the Steam ID is valid: only letters, numbers and dash are allowed
        if (!/^[a-zA-Z0-9-]+$/.test(steamId)) {
            await interaction.reply('Invalid Steam ID!');
            return;
        }        

        // checking if the Steam ID is already saved
        if (authorTag in steamIdList) {
            if (steamIdList[authorTag] != steamId) {
                steamIdList[authorTag] = steamId;
                fs.writeFileSync('steamIdList.json', JSON.stringify(steamIdList));
                await interaction.reply('Steam ID updated for ' + authorTag);
                // adding log
                if (!interaction.guild) {
                    var serverName = 'DM';
                    var channelName = 'DM';
                } else {
                    var serverName = interaction.guild.name;
                    var channelName = interaction.channel.name;
                }

                console.log(JSON.stringify({
                    timestamp: getNowFormat(),
                    level: "info",
                    server: serverName,
                    channel: channelName,
                    message: "Steam ID updated"
                }));

            } else {
                await interaction.reply('Your Steam ID is already saved!');
                //adding log
                if (!interaction.guild) {
                    var serverName = 'DM';
                    var channelName = 'DM';
                } else {
                    var serverName = interaction.guild.name;
                    var channelName = interaction.channel.name;
                }

                console.log(JSON.stringify({
                    timestamp: getNowFormat(),
                    level: "info",
                    server: serverName,
                    channel: channelName,
                    message: "Steam ID already saved"
                }));
            }
            return;
        }

        // saving the Steam ID in json format
        steamIdList[authorTag] = steamId;
        fs.writeFileSync('steamIDList.json', JSON.stringify(steamIdList));
        await interaction.reply('Steam ID saved for ' + authorTag);

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
            message: "Steam ID saved"
        }));
    },
};