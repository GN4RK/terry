const { SlashCommandBuilder } = require('discord.js');
const { addLog } = require('../../utils');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loveyouterry')
        .setDescription("Removes you from Terry's blacklist"),

    async execute(interaction) {
        
        // fetching infos
        const authorTag = interaction.user.tag;
        const serverName = interaction.guild ? interaction.guild.id + ":" + interaction.guild.name : 'DM';
        const channelName = interaction.channel ? interaction.channel.name : 'DM';

        // fetching blacklist
        const blacklist = JSON.parse(fs.readFileSync('blacklist.json', 'utf8'));

        // checking if the user tag is blacklisted
        if (blacklist['blacklist'].includes(authorTag)) {

            const index = blacklist['blacklist'].indexOf(authorTag);
            blacklist['blacklist'].splice(index, 1);
            fs.writeFileSync('blacklist.json', JSON.stringify(blacklist));

            await interaction.reply('Your user tag is not blacklisted anymore');
            addLog("info", "User tag removes from blacklist", serverName, channelName, authorTag);
            return;
        }

        await interaction.reply("You are not blacklisted ❤️");
        addLog("info", "User tag already blacklisted", serverName, channelName, authorTag);
    },
};