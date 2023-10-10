const { Events } = require('discord.js');

const GUILD_ID = '1158766765497655336';
const LOGS_CHANNEL = 'logs'; // Nombre del canal de registro
module.exports = {
	name: Events.GuildBanAdd,
	async execute(guild) {
    console.log('entrando')
    if (guild.id === GUILD_ID) {
      const logsChannel = guild.channels.cache.find(
        (channel) => channel.name === LOGS_CHANNEL && channel.type === 'text'
      );
  
      if (logsChannel) {
        // Envía información del baneo al canal de registro
        logsChannel.send(`Usuario baneado: )`);
      } else {
        console.error(`No se encontró el canal de registro (${LOGS_CHANNEL})`);
      }
    }
	},
};