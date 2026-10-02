const { SlashCommandBuilder } = require('discord.js');
const { addLog } = require('../../utils');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fuckyouterry')
        .setDescription("Adds you in Terry's blacklist to never have your steamlink converted by it"),

    async execute(interaction) {
        
        // fetching infos
        const authorTag = interaction.user.tag;
        const serverName = interaction.guild ? interaction.guild.id + ":" + interaction.guild.name : 'DM';
        const channelName = interaction.channel ? interaction.channel.name : 'DM';

        // fetching blacklist
        const blacklist = JSON.parse(fs.readFileSync('blacklist.json', 'utf8'));

        // checking if the user tag is already saved
        if (blacklist['blacklist'].includes(authorTag)) {
            await interaction.reply('Your user tag is already blacklisted');
            addLog("info", "User tag already blacklisted", serverName, channelName, authorTag);
            return;
        }

        // saving the user tag in json format
        blacklist['blacklist'].push(authorTag);
        fs.writeFileSync('blacklist.json', JSON.stringify(blacklist));
        await interaction.reply('User tag saved for ' + authorTag);
        addLog("info", "User tag blacklisted", serverName, channelName, authorTag);
    },
};