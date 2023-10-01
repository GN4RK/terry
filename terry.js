const fs = require ('fs');
const dotenv = require ('dotenv');
const { Client, GatewayIntentBits, EmbedBuilder, Partials, PermissionsBitField } = require ('discord.js');
const { getJoinLobbyLink } = require ('./steamjoin.js');
const { checkBotPermissions, shortenUrl, getAuthorColor, getAuthorName, getTitleEmbled, reactWithHeart, getNowFormat } = require ('./utils.js');

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
            if (!(await checkBotPermissions(message.channel, permissionsNeeded))) return;
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
        if (!terrySticker) return;

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
    
});

