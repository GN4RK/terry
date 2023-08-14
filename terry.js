import {Client, GatewayIntentBits, EmbedBuilder, Partials, PermissionsBitField} from 'discord.js';
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
const regexThanks = /\b(?:thanks?|thank\syou|ty|tysm)\b.*\b(?:Terry|Bogard)\b/i;
const tinyUrlBase = 'https://tinyurl.com/api-create.php?url=';
const steamAppList = JSON.parse(fs.readFileSync('steamAppList.json'));

client.on("ready", function () {
    console.log(getNowFormat() + " Terry connected");
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
        const titleEmbed = getTitleEmbled(authorName);

        const embed = new EmbedBuilder()
            .setColor(await getAuthorColor(message))
            .setTitle(titleEmbed)
            .addFields(
                { name : tinyUrl, value : matchSteamLink[0] }
            );

        // checking channel's permissions
        if (message.guild) {
            const botPermissions = (await message.guild.members.fetchMe()).permissionsIn(message.channel);
            if (!botPermissions.has(PermissionsBitField.Flags.SendMessages)) {
                console.error(
                    `${getNowFormat()} Bot does not have 'Send Messages' permission on ` + 
                    `${serverName} in ${message.channel.name}`
                );
                return;
            }
            if (!botPermissions.has(PermissionsBitField.Flags.EmbedLinks)) {
                console.error(
                    `${getNowFormat()} Bot does not have 'Embed Links' permission on ` + 
                    `'${serverName}' in ${message.channel.name} channel`
                );
                return;
            }
        }
            
        message.channel.send({ embeds: [embed] });
        
        
        // log message
        console.log(`${getNowFormat()} ${serverName} -> ${message.channel.name} \t ${gameName} \t ${matchSteamLink[0]}`);
    }

    if (matchThanks) {
        const serverName = message.guild ? message.guild.name : 'DM';
        if (message.guild) {
            // checking bot's permission to add reactions
            if ((await message.guild.members.fetchMe()).permissionsIn(message.channel).has(PermissionsBitField.Flags.AddReactions)) {
                await message.react('❤️');
            } else {
                console.error(
                    `${getNowFormat()} Bot does not have 'Add Reaction' permission on ` + 
                    `${serverName} in ${message.channel.name}`
                );
            }
            
        } else {
            await message.react('❤️');
        }
        console.log(`${getNowFormat()} ${message.author.displayName} from ${serverName} thanks the bot`);
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

function getTitleEmbled(authorName) {
    if (authorName.endsWith('s')) {
        return `${authorName}' lobby`;
    }
    return `${authorName}'s lobby`;
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

    return `${year}/${month}/${date} ${hour}:${minute}:${second}`;
}