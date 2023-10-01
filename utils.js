// Description: This file contains some functions that are used in other files.
const { PermissionsBitField } = require('discord.js');
const dotenv = require ('dotenv');
dotenv.config();

const URLshortenerAPICall = process.env.URL_SHORTENER_API_CALL;

async function checkBotPermissions(channel, requiredPermissions)
{
    const botMember = await channel.guild.members.fetchMe();
    const botPermissions = botMember.permissionsIn(channel);

    for (const [permissionName, permissionCode] of Object.entries(requiredPermissions)) {
        if (!botPermissions.has(permissionCode)) {
            console.error(JSON.stringify({
                timestamp: getNowFormat(),
                level: "error",
                server: channel.guild.name,
                channel: channel.name,
                message: `Error: Bot does not have '${permissionName}' permission`
            }));
            return false;
        }
    }
    return true;
}

async function shortenUrl(url)
{
    try {
        const response = await fetch(URLshortenerAPICall + encodeURIComponent(url));
        const json = await response.json();
        return await json.shorturl;
        
    } catch (error) {
        console.error('Error:', error);
        return 'Failed to shorten URL';
    }
}

async function getAuthorColor(message)
{
    if (message.guild) {
        const member = await message.guild.members.fetch(message.author);
        return member.displayColor;
    }
    return "Default";
}

async function getAuthorName(message)
{
    if (message.guild) {
        const member = await message.guild.members.fetch(message.author);
        return member.displayName;
    }
    return message.author.displayName;
}

function getTitleEmbled(authorName)
{
    if (authorName.endsWith('s')) {
        return `${authorName}' lobby`;
    }
    return `${authorName}'s lobby`;
}

async function reactWithHeart(message)
{
    if (message.guild) {
        // checking bot's permission to add reactions
        const addReactionsPermission = { "AddReactions": PermissionsBitField.Flags.AddReactions };
        if (!(await checkBotPermissions(message.channel, addReactionsPermission))) {
            return false;
        }
        await message.react('❤️');

    } else {
        await message.react('❤️');
    }
    return true;
}

function getNowFormat()
{
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

    return `${year}-${month}-${date}T${hour}:${minute}:${second}`;
}

module.exports = { checkBotPermissions, shortenUrl, getAuthorColor, getAuthorName, getTitleEmbled, reactWithHeart, getNowFormat };