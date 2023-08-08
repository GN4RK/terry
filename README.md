# Terry

Terry is a Discord bot designed to perform specific actions in response 
to messages, such as handling Steam lobby links and reacting to thank-you messages.

## Features

- Automatically detects and responds to Steam lobby links with tinyurl links.
- Reacts with ❤️ to thank-you messages.

## Adding Terry to your server

You can add Terry to your server by clicking this invite link : https://discord.com/api/oauth2/authorize?client_id=746064350456053825&permissions=0&scope=bot

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
   
3. Create a .env file in the project root and add your Discord Bot Token:
   ```
   DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN
   ```

4. Run the bot:
   ```bash
   node terry.js
   ```

## Usage

- Invite the bot to your server using the invite link generated in the Discord Developer Portal.
- Once invited, the bot will automatically detect Steam lobby links. When a valid Steam lobby link is detected, the bot will respond with a message including a tinyurl link to the steam lobby.

Please note that the bot requires the necessary permissions to read messages in the channels it operates in and to react with emojis.

## Contributing

Contributions are welcome! If you have any ideas, bug fixes, or improvements, please create a pull request. Your contribution will be appreciated !

## Acknowledgements

- Built with [Discord.js](https://discord.js.org/)
- Powered by [node-fetch](https://www.npmjs.com/package/node-fetch) and [dotenv](https://www.npmjs.com/package/dotenv)

