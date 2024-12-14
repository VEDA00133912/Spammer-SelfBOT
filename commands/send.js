const fs = require('fs');
const path = require('path');
const config = require('../settings/config.json');

module.exports = async (client, message) => {
    if (message.content.toLowerCase() === `${config.prefix}send`) {
        try {
            const contentPath = path.join(__dirname, '../settings/content.txt');
            let content = fs.readFileSync(contentPath, 'utf8');
            const channelsPath = path.join(__dirname, '../settings/channels.txt');
            const channelIds = fs.readFileSync(channelsPath, 'utf8').split('\n').filter(id => id.trim() !== '');

            if (config.randomMention) {
                const guild = message.guild; 
                if (guild) {
                    const members = await guild.members.fetch(); 
                    const nonBotMembers = members.filter(member => !member.user.bot); 
                    const randomMembers = nonBotMembers.size >= 5 ? nonBotMembers.random(5) : nonBotMembers;

                    const mentions = randomMembers.map(member => `<@${member.id}>`).join('');
                    content = `${content}${mentions}`; 
                } else {
                    console.warn('🔴 ランダムメンションのためのサーバー情報が取得できませんでした。');
                }
            }

            if (config.randomString) {
                const randomString = Math.random().toString(36).slice(-8);
                content = `${content}\n${randomString}`; 
            }

            if (config.randomEmoji) {
                const emojis = ['😀', '😁', '😂', '🤣', '😎', '😍', '🥺', '😜'];
                const randomEmojis = [];
                for (let i = 0; i < 8; i++) {
                    const randomIndex = Math.floor(Math.random() * emojis.length);
                    randomEmojis.push(emojis[randomIndex]);
                }
                content = `${content}\n${randomEmojis.join(' ')}`;
            }

            const sendCount = config.sendCount || 1;
            let errorCount = 0;

            const sendPromises = [];
            for (let i = 0; i < sendCount; i++) {
                for (const channelId of channelIds) {
                    sendPromises.push(
                        client.channels.fetch(channelId.trim())
                            .then(channel => {
                                if (channel) {
                                    return channel.send(content);
                                } else {
                                    console.warn(`🔴 無効なチャンネルID: ${channelId}`);
                                    errorCount++; 
                                }
                            })
                            .catch(error => {
                                errorCount++; 
                            })
                    );
                }
            }

            await Promise.all(sendPromises);

            console.log('🟢 メッセージ送信完了');
            if (errorCount > 0) {
                console.error(`🔴 ${errorCount} 個のメッセージ送信に失敗しました。`);
            }
        } catch (error) {
            console.error('🔴 メッセージ送信中にエラーが発生しました');
        }
    }
};
