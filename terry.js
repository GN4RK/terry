import { Client, GatewayIntentBits, EmbedBuilder, Partials } from 'discord.js';
import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ] 
});

const discordToken = process.env.DISCORD_TOKEN;
const regexSteamLink = /steam:\/\/joinlobby\/(\d+)\/\d+\/\d+/;
const regexThanks = /\b(?:thanks?|thank\syou|ty)\b.*\b(?:Terry|Bogard|terry|bogard)\b/i;
const tinyUrlBase = 'http://tinyurl.com/api-create.php?url=';
const steamAppList = JSON.parse(fs.readFileSync('steamAppList.json'));

client.on("ready", function () {
    console.log(getNowFormat() + "\tTerry connected");
});

client.login(discordToken);

client.on("messageCreate", async function(message) {

    // preventing infinite loop
    if (message.author.bot) return;

    const matchSteamLink = message.content.match(regexSteamLink);
    const matchThanks = message.content.match(regexThanks);

    if (matchSteamLink) {
        const gameID = matchSteamLink[1];
        const gameData = steamAppList.find((data) => data.appid === parseInt(gameID));

        let gameName = "404";
        if (gameData) {
            gameName = `${gameData.name}`;
        }

        const serverName = message.guild ? message.guild.name : 'DM';
        const authorName = await getAuthorName(message);
        let tinyUrl = await shortenUrl(matchSteamLink[0]);

        const embed = new EmbedBuilder()
            .setColor(await getAuthorColor(message))
            .setTitle(`${authorName}'s lobby`)
            .setDescription(tinyUrl);
        message.channel.send({ embeds: [embed] });
        
        // log message
        console.log(`${getNowFormat()} \t ${serverName} \t ${gameName} \t ${matchSteamLink[0]}`);
    }

    if (matchThanks) {
        message.react('❤️');
    }
    
});

async function shortenUrl(url) {
    try {
        const response = await fetch(tinyUrlBase + encodeURIComponent(url));
        return await response.text();
    } catch (error) {
        console.error('Error:', error);
        return 'Failed to shorten URL';
    }
}

async function getAuthorColor(message) {
    if (message.guild) {
        const member = await message.guild.members.fetch(message.author);
        
        return member.displayColor;
    }
    return "Default";
}

async function getAuthorName(message) {
    if (message.guild) {
        const member = await message.guild.members.fetch(message.author);

        return member.displayName;
    }
    return message.author.displayName;
}

function getNowFormat() {
    const dateObj = new Date();
    let year = dateObj.getFullYear();
    let month = dateObj.getMonth();
    month = ('0' + (month + 1)).slice(-2);
    // To make sure the month always has 2-character-format. For example, 1 => 01, 2 => 02

    let date = dateObj.getDate();
    date = ('0' + date).slice(-2);
    // To make sure the date always has 2-character-format

    let hour = dateObj.getHours();
    hour = ('0' + hour).slice(-2);
    // To make sure the hour always has 2-character-format

    let minute = dateObj.getMinutes();
    minute = ('0' + minute).slice(-2);
    // To make sure the minute always has 2-character-format

    let second = dateObj.getSeconds();
    second = ('0' + second).slice(-2);
    // To make sure the second always has 2-character-format

    const time = `${year}/${month}/${date} ${hour}:${minute}:${second}`;
    return time;
}