const { SlashCommandBuilder } = require('discord.js');
const { getNowFormat } = require('../../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),
    async execute(interaction) {
        await interaction.reply('Pong!');

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
            message: "Pong!"
        }));
    },
};