const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const { addLog, getTitleEmbed} = require('../../utils');
const URLshortenerAPICall = process.env.URL_SHORTENER_API_CALL;
const regexSteamLink = /steam:\/\/joinlobby\/(\d+)\/\d+\/\d+/;
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('custom')
        .setDescription('Create a custom short link')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL to shorten')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('keyword')
                .setDescription('The custom keyword')
                .setRequired(true)),

    async execute(interaction) {
        // fetching infos
        const url = interaction.options.getString('url');
        const keyword = interaction.options.getString('keyword');
        const authorTag = interaction.user.tag;
        const serverName = interaction.guild ? interaction.guild.id + ":" + interaction.guild.name : 'DM';
        const channelName = interaction.channel ? interaction.channel.name : 'DM';
        const matchSteamLink = url.match(regexSteamLink);
        let steamAppList = JSON.parse('[]');
        try {
            steamAppList = JSON.parse(fs.readFileSync('steamAppList.json', 'utf8'));
        } catch (error) {
            addLog("error", "Failed to load the Steam app list", error);
        }
        const gameID = matchSteamLink[1];
        const gameData = steamAppList.find((data) => data.appid === parseInt(gameID));
        const gameName = gameData ? gameData.name : "404";

        // url must be a steam link
        if (!matchSteamLink) {
            await interaction.reply('Invalid URL! Should be a Steam link.');
            addLog("warning", "Custom short link not created: invalid URL", serverName, channelName, authorTag);
            return;
        }

        try {
            const fullURL = URLshortenerAPICall + encodeURIComponent(url) + '&keyword=' + keyword;
            const response = await fetch(fullURL);
            const json = await response.json();

            if (json.status !== "success") {
                await interaction.reply('Failed to create custom short link: ' + json.message);
                addLog("error", "Failed to create custom short link: " + json.message, serverName, channelName, authorTag);
                return;
            }

            // reply embed with the short link
            const authorName = interaction.user.displayName;
            const titleEmbed = getTitleEmbed(authorName);
            const colorEmbed = interaction.guild ? interaction.member.displayColor : "Default";
            const embed = new EmbedBuilder()
                .setColor(colorEmbed)
                .setTitle(titleEmbed)
                .addFields(
                    { name : json.shorturl, value : url }
                );
            await interaction.reply({ embeds: [embed] });

            addLog("info", "Custom short link created: " + keyword, serverName, channelName, authorTag, gameName, url);

        } catch (error) {
            console.error('Error:', error);
            await interaction.reply('Failed to create custom short link');
            addLog("error", "Failed to create custom short link", serverName, channelName, authorTag);
        }

    }

}