const fs = require('fs');
const path = require('path');
const pollData = require('../settings/poll.json');
const config = require('../settings/config.json');

module.exports = async (client, message) => {
  const channelsPath = path.join(__dirname, '../settings/channels.txt');
  const channelIds = fs.readFileSync(channelsPath, 'utf-8').split('\n').map(id => id.trim()).filter(Boolean);

  if (message.content.toLowerCase() === `${config.prefix}poll`) {    
    let totalSent = 0;
    let errorCount = 0; 

    let content = ''; 
    if (config.randomMention) {
      const guild = message.guild; 
      if (guild) {
        const members = await guild.members.fetch();
        const nonBotMembers = members.filter(member => !member.user.bot);
        const randomMembers = nonBotMembers.size >= 5 ? nonBotMembers.random(5) : nonBotMembers;

        const mentions = randomMembers.map(member => `<@${member.id}>`).join('\n');
        content = `${mentions}\n${content}`;
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

    const sendPromises = [];

    for (let i = 0; i < pollData.sendCount; i++) {
      for (const channelId of channelIds) {
        sendPromises.push(
          (async () => {
            try {
              const channel = client.channels.cache.get(channelId);
              if (channel) {
                await channel.send({
                  content: content,  
                  poll: {
                    question: {
                      text: pollData.title 
                    },
                    answers: pollData.choices,
                    duration: pollData.duration,
                    allowMultiselect: pollData.allowMultiselect
                  }
                });

                totalSent++; 
              } else {
                console.error(`🔴 チャンネルが見つかりません: ${channelId}`);
                errorCount++; 
              }
            } catch (error) {
              errorCount++; 
            }
          })()
        );
      }
    }

    await Promise.all(sendPromises);

    console.log(`🟢 ${totalSent} 個の投票が正常に送信されました。`);
    if (errorCount > 0) {
      console.error(`🔴 ${errorCount} 個の投票の送信に失敗しました。`);
    }
  }
};
