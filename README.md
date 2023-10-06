# Terry

Terry is a Discord bot designed to handle Steam lobby links making them clickable and shortening them.

## Features

- Automatically detects and responds to Steam lobby links with clickable links.
- Shortens the links using the API of your choice.
- Can save the steam id for a specific discord user.
- Can fetch the joinlobby link from the steam profile page of a saved user.
- Reacts with ❤️ to thank-you messages.

## Adding Terry to your server

You can add Terry to your server by clicking this invite link : 
https://discord.com/api/oauth2/authorize?client_id=746064350456053825&permissions=19520&scope=bot

The bot needs those permissions to work :
- Read Messages/View Channels
- Send Messages
- Add Reactions
- Embed Links

## Hosting your own version of the bot

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- [Discord Bot Token](https://discord.com/developers/applications) (Create a bot on the Discord Developer Portal to obtain the token)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/GN4RK/terry
   cd terry
   ```
2. Install dependencies:
    ```bash
   npm install
   ```
   
3. Create a .env file in the project root and add your Discord Bot Token and the API you'll use to 
shorten the URL (tinyurl in the example):
   ```
   DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN
   URL_SHORTENER_API_CALL='https://tinyurl.com/api-create.php?url='
   CLIENT_ID=YOUR_APPLICATION_CLIENT_ID
   ```

4. Adapt shortenUrl function in the code to work with the API you call. If you use tinyurl, this code should work:
   ```JS
      async function shortenUrl(url) {
         try {
            const response = await fetch(URLshortenerAPICall + encodeURIComponent(url));
            return await response.text();
         } catch (error) {
            console.error('Error:', error);
            return 'Failed to shorten URL';
         }
      }
   ```

5. Run the bot:
   ```bash
   node terry.js
   ```
   
6. Invite the bot to your server using the invite link generated in the Discord Developer Portal.

7. You need to deploy slash commands by running the following command:
   ```bash
   node deploy-commands.js
   ```

### Usage

- Invite the bot to your server using the invite link generated in the Discord Developer Portal.
- Once invited, the bot will automatically detect Steam lobby links. When a valid Steam lobby link is detected, 
the bot will respond with a message including a shorturl link to the steam lobby.

Please note that the bot requires the necessary permissions to read messages in the channels it 
operates in and to react with emojis.

## Contributing

Contributions are welcome! If you have any ideas, bug fixes, or improvements, please create a pull 
request. Your contribution will be appreciated !

## Acknowledgements

- Built with [Discord.js](https://discord.js.org/)
- Powered by [node-fetch](https://www.npmjs.com/package/node-fetch) and [dotenv](https://www.npmjs.com/package/dotenv)

## Special thanks / Inspiration

- Neffy from Skullgirls Oceania Discord server for the idea and explanation on how to use tinyurl API.
- similar bot [Neffytron](https://github.com/IHaveNoFunnyName/Neffytron) coded in python by [IHaveNoFunnyName](https://github.com/IHaveNoFunnyName)
- [sglobbylink-discord.py](https://github.com/ctmatthews/sglobbylink-discord.py) by [ctmatthews](https://github.com/ctmatthews)