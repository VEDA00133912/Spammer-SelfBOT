require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const config = require('./settings/config.json');

const tokens = fs.readFileSync('./settings/token.txt', 'utf8').split('\n').filter(token => token.trim() !== '');
if (tokens.length === 0) {
    console.error('🔴 トークンが見つかりません。token.txtを確認してください。');
    process.exit(1);
}

const mainClient = new Client();
const otherClients = tokens.slice(1).map(token => new Client());

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const setupClient = (client, token, isMain = false) => {
    client.on('ready', () => {
        console.log(`🟢 ${client.user.username} is Online! (${isMain ? 'Main Client' : 'Secondary Client'})`);
    });

    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        if (message.content.trim().startsWith(config.prefix)) {
            const commandName = message.content.slice(config.prefix.length).split(' ')[0].toLowerCase();

            if (['send', 'poll'].includes(commandName) || isMain) {
                const commandFile = commandFiles.find(file => file.replace('.js', '') === commandName);
                if (commandFile) {
                    const command = require(path.join(__dirname, 'commands', commandFile));
                    try {
                        await command(client, message);
                    } catch (error) {
                        console.error(`🔴 ${commandName} コマンド実行中にエラーが発生しました:`, error);
                        message.reply('コマンド実行中にエラーが発生しました');
                    }
                } else {
                    if (isMain) {

                        console.log(`不明なコマンド: ${commandName}`)
                    }
                }
            }
        }
    });

    client.login(token).catch(error => {
        console.error(`🔴 クライアントのログイン中にエラーが発生しました: ${error.message}`);
    });
};

setupClient(mainClient, tokens[0], true);

otherClients.forEach((client, index) => {
    setupClient(client, tokens[index + 1]);
});
