const { SlashCommandBuilder } = require('discord.js');
const { getNowFormat } = require('../../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),
    async execute(interaction) {
        await interaction.reply('Pong!');

        // adding log
        console.log(JSON.stringify({
            timestamp: getNowFormat(),
            level: "info",
            server: interaction.guild.name,
            channel: interaction.channel.name,
            author: interaction.user.tag,
            message: "Pong!"
        }));
    },
};