const fs = require ('fs');
const dotenv = require ('dotenv');
const { Client, GatewayIntentBits, EmbedBuilder, Partials, PermissionsBitField } = require ('discord.js');
const { getJoinLobbyLink } = require ('./steamjoin.js');

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
const regexThanks = /\b(?:thanks?|thank\syou|ty|tysm|thx)\b.*\b(?:Terry|Bogard)\b/i;
const regexCmdJL = /^!jl\s(?!.*\W)[\w\d]+$/;
const URLshortenerAPICall = process.env.URL_SHORTENER_API_CALL;
const steamAppList = JSON.parse(fs.readFileSync('steamAppList.json'));

client.on("ready", function () {
    console.log(JSON.stringify({
        timestamp: getNowFormat(),
        level: "info",
        message: "Terry connected"
    }));
});

client.login(discordToken);

client.on("messageCreate", async function(message) {

    // fetching infos
    const serverName = message.guild ? message.guild.name : 'DM';
    const channelName = message.channel.name ? message.channel.name : 'DM';
    const authorName = await getAuthorName(message);

    // preventing infinite loop
    if (message.author.bot) return;

    // checking message content
    const matchSteamLink = message.content.match(regexSteamLink);
    const matchCmdJL = message.content.match(regexCmdJL);
    const matchThanks = message.content.match(regexThanks);
    const terrySticker = message.stickers.find(sticker => sticker.name === "Terry <3");

    if (matchSteamLink) {
        const permissionsNeeded = {
            "SendMessages"  : PermissionsBitField.Flags.SendMessages,
            "EmbedLinks"    : PermissionsBitField.Flags.EmbedLinks
        };
        const gameID = matchSteamLink[1];
        const gameData = steamAppList.find((data) => data.appid === parseInt(gameID));
        const gameName = gameData ? gameData.name : "404";
        const shortUrl = await shortenUrl(matchSteamLink[0]);
        const titleEmbed = getTitleEmbled(authorName);
        const embed = new EmbedBuilder()
            .setColor(await getAuthorColor(message))
            .setTitle(titleEmbed)
            .addFields(
                { name : shortUrl, value : matchSteamLink[0] }
            );

        // checking channel's permissions
        if (message.guild) {
            if (!(await checkBotPermissions(message.channel, permissionsNeeded))) {
                return;
            }
        }
            
        message.channel.send({ embeds: [embed] });
        
        // log message
        console.log(JSON.stringify({
            timestamp: getNowFormat(),
            level: "info",
            server: serverName,
            channel: channelName,
            author: authorName,
            message: "Steam link detected",
            game: gameName,
            link: matchSteamLink[0]
        }));
    }

    // if (matchCmdJL) {
    //     const permissionsNeeded = {
    //         "SendMessages"  : PermissionsBitField.Flags.SendMessages,
    //         "EmbedLinks"    : PermissionsBitField.Flags.EmbedLinks
    //     };
    //     const profileName = matchCmdJL[0].substring(4);
    //     const joinLobbyLink = await getJoinLobbyLink(profileName);
    //     const shortUrl = await shortenUrl(joinLobbyLink);
    //     const titleEmbed = getTitleEmbled(authorName);
    //     const embed = new EmbedBuilder()
    //         .setColor(await getAuthorColor(message))
    //         .setTitle(titleEmbed)
    //         .addFields(
    //             { name : shortUrl, value : joinLobbyLink }
    //         );

    //     // checking channel's permissions
    //     if (message.guild) {
    //         if (!(await checkBotPermissions(message.channel, permissionsNeeded))) {
    //             return;
    //         }
    //     }

    //     message.channel.send({ embeds: [embed] });

    //     // log message
    //     console.log(JSON.stringify({
    //         timestamp: getNowFormat(),
    //         level: "info",
    //         server: serverName,
    //         channel: channelName,
    //     }));
    // }

    if (matchThanks) {
        if (await reactWithHeart(message)) {
            console.log(JSON.stringify({
                timestamp: getNowFormat(),
                level: "info",
                server: serverName,
                channel: channelName,
                author: authorName,
                message: "User thanked the bot"
            }));
        }
    }

    // react to stickers
    if (message.stickers.size > 0) {
        if (terrySticker) {
            if (await reactWithHeart(message)) {
                console.log(JSON.stringify({
                    timestamp: getNowFormat(),
                    level: "info",
                    server: serverName,
                    channel: channelName,
                    author: authorName,
                    message: "User sent a Terry <3 sticker"
                }));
            }
        }
    }
    
});

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

    return `${year}/${month}/${date} ${hour}:${minute}:${second}`;
}