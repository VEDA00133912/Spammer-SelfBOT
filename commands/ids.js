const config = require('../settings/config.json');
const fs = require('fs');
const path = require('path'); 

module.exports = async (client, message) => {
  if (message.content.toLowerCase().startsWith(`${config.prefix}ids`)) {

    const guild = message.guild; 
    if (!guild) {
      console.error('🔴サーバー情報を取得できませんでした');
      return;
    }

    try {
      const channels = await guild.channels.fetch(); 

      const accessibleChannels = channels.filter(channel => {
        if (channel.type !== 'GUILD_TEXT' && channel.type !== 'GUILD_VOICE') return false;

        const permissions = channel.permissionsFor(guild.members.me); 
        return permissions && permissions.has('SEND_MESSAGES');
      });

      const channelIds = accessibleChannels.map(channel => channel.id).join('\n');

      const filePath = path.join(__dirname, '../settings/channels.txt');
      fs.writeFileSync(filePath, channelIds);

      console.log(`🟢 チャンネルIDを channels.txt に保存しました`);
    } catch (error) {
      console.error('🔴 チャンネル取得中にエラーが発生しました:', error);
    }
  }
};
