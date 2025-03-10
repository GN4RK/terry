const fs = require ('fs');
const dotenv = require ('dotenv');
const path = require ('path');
const Sentiment = require ('sentiment');
const {
    Client, Collection, Events, GatewayIntentBits, EmbedBuilder, Partials, PermissionsBitField
} = require ('discord.js');
const {
    checkBotPermissions, shortenUrl, getAuthorColor, getAuthorName, getTitleEmbed,
    reactWithHeart, reactWithBrokenHeart, reactWithEmoji, addLog
} = require ('./utils.js');

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageReactions
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction
    ] 
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            addLog("warning", `The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const discordToken = process.env.DISCORD_TOKEN;
const regexSteamLink = /steam:\/\/joinlobby\/(\d+)\/\d+\/\d+/;
const regexSpeakingToTerry = /\b(?:terry|bogard)\b/i;
const regexAskingToTerry = /\b(?:terry|bogard)\b.*\?$/i;

// list of emojis that can be used as response
const emojiList = [
    '🎱', '👍', '👎', '🤔', '🫡', '👌',
    '✅', '🛑', '✨', '🎉', '😄', '😕',
    '😮', '😍', '😎', '😱', '😐', '🫤',
    '😑', '🤐', '🤐', '🙊', '🤫', '💩'
];

// empty list
let steamAppList = JSON.parse('[]');

// Opening file with the list of Steam games
try {
    steamAppList = JSON.parse(fs.readFileSync('steamAppList.json', 'utf8'));

} catch (error) {
    addLog("error", "Failed to load the Steam app list", error);
}

client.on("ready", function () {
    addLog("info", "Terry connected");
});

client.login(discordToken);

// Slash commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        addLog("error", `No command matching ${interaction.commandName} was found.`)
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        addLog("error", error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Error', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Error', ephemeral: true });
        }
    }
});

// Emoji Reaction, delete if ❌ is added to the bot message
client.on(Events.MessageReactionAdd, async function(reaction, user) {
    
    // preventing null id caused by uncached messages
    if (!reaction.message.author) return;

    // listening only messages from the bot itself
    if (reaction.message.author.id !== client.user.id) return;

    // check if the reaction is the ❌ emoji
    if (reaction.emoji.name !== '❌') return;

    // check if the message title contain the name of the user who reacted
    const messageTitle = reaction.message.embeds[0].title;
    
    let authorName = user.displayName;
    if (reaction.message.guild) {
        const member = await reaction.message.guild.members.fetch(user);
        authorName = member.displayName;
    }

    if (!messageTitle.includes(authorName)) return;

    // fetching infos
    const serverName = reaction.message.guild ? reaction.message.guild.id + ":" + reaction.message.guild.name : 'DM';
    const channelName = reaction.message.channel.name ? reaction.message.channel.name : 'DM';
    const authorTag = user.tag;

    // delete the message
    reaction.message.delete();
    addLog("info", "Message deleted", serverName, channelName, authorTag);

});

// All other interactions
client.on("messageCreate", async function(message) {

    // preventing infinite loop
    if (message.author.bot) return;

    // fetching infos
    const serverName = message.guild ? message.guild.id + ":" + message.guild.name : 'DM';
    const channelName = message.channel.name ? message.channel.name : 'DM';
    const authorName = await getAuthorName(message);
    const authorTag = message.author.tag;

    // checking message content
    const matchSteamLink = message.content.match(regexSteamLink);
    const matchSpeakingToTerry = message.content.match(regexSpeakingToTerry);
    const matchAskingToTerry = message.content.match(regexAskingToTerry);
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
        const titleEmbed = getTitleEmbed(authorName);
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
        addLog("info", "Steam link detected", serverName, channelName, authorTag, gameName, matchSteamLink[0]);
    }

    if (matchAskingToTerry) {
        // react with a random emoji
        const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
        await reactWithEmoji(message, randomEmoji);
        addLog("info", "Question detected", serverName, channelName, authorTag);

        return;
    }

    if (matchSpeakingToTerry) {

        // creating sentiment analyzer
        const sentiment = new Sentiment();
        const options = {
            extras: {
                'ty': 1,
                'thx': 1,
                'tysm': 1,
                'tyvm': 1,
                'tyty': 1,
                'fnx': 1,
                'tyia': 1,
                'tysvm': 1
            }
        }
        const result = sentiment.analyze(message.content, options);

        if (result.comparative > 0.2) {
            if (await reactWithHeart(message)) {
                addLog("info", "Positive message detected", serverName, channelName, authorTag);
                return;
            }
        }

        if (result.comparative < -0.2) {
            if (await reactWithBrokenHeart(message)) {
                addLog("info", "Negative message detected", serverName, channelName, authorTag);
                return;
            }
        }
    }

    // react to stickers
    if (message.stickers.size > 0) {
        if (!terrySticker) return;

        if (await reactWithHeart(message)) {
            addLog("info", "Terry <3 sticker detected", serverName, channelName, authorTag);
        }
    }
    
});

