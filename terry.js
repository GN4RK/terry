const fs = require ('fs');
const dotenv = require ('dotenv');
const path = require ('path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder, Partials, PermissionsBitField } = require ('discord.js');
const { checkBotPermissions, shortenUrl, getAuthorColor, getAuthorName, getTitleEmbed, reactWithHeart, getNowFormat } = require ('./utils.js');

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

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const discordToken = process.env.DISCORD_TOKEN;
const regexSteamLink = /steam:\/\/joinlobby\/(\d+)\/\d+\/\d+/;
const regexThanks = /\b(?:thanks?|thank\syou|ty|tysm|thx)\b.*\b(?:Terry|Bogard)\b/i;
const steamAppList = JSON.parse(fs.readFileSync('steamAppList.json'));

client.on("ready", function () {
    console.log(JSON.stringify({
        timestamp: getNowFormat(),
        level: "info",
        message: "Terry connected"
    }));
});

client.login(discordToken);

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on("messageCreate", async function(message) {

    // fetching infos
    const serverName = message.guild ? message.guild.name : 'DM';
    const channelName = message.channel.name ? message.channel.name : 'DM';
    const authorName = await getAuthorName(message);
    const authorTag = message.author.tag;

    // preventing infinite loop
    if (message.author.bot) return;

    // checking message content
    const matchSteamLink = message.content.match(regexSteamLink);
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
        
        // log message
        console.log(JSON.stringify({
            timestamp: getNowFormat(),
            level: "info",
            server: serverName,
            channel: channelName,
            author: authorTag,
            message: "Steam link detected",
            game: gameName,
            link: matchSteamLink[0]
        }));
    }

    if (matchThanks) {
        if (await reactWithHeart(message)) {
            console.log(JSON.stringify({
                timestamp: getNowFormat(),
                level: "info",
                server: serverName,
                channel: channelName,
                author: authorTag,
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
                author: authorTag,
                message: "User sent a Terry <3 sticker"
            }));
        }
    }
    
});

