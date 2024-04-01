const { Events, ChannelType, EmbedBuilder } = require('discord.js');

const GUILD_ID = '1158766765497655336';
const LOGS_CHANNEL_ID = '1161388038644060190'; // Nombre del canal de registro
module.exports = {
	name: Events.GuildBanAdd,

	async execute({guild, user}) {
  console.log(guild)
    if (guild.id === GUILD_ID) {
      const logsChannel = guild.channels.cache.find(
        (channel) => channel.id === LOGS_CHANNEL_ID
      );
  
      if (logsChannel) {
        const baneo = await guild.bans.fetch({user})
        console.log(baneo.reason)
        // Envía información del baneo al canal de registro
        const embed = new EmbedBuilder()
            .setColor('#ff0000') // Color rojo para indicar un baneo
            .setTitle('Usuario Baneado')
            .setDescription(`Usuario: ${user} (${user.id})`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
              { name: 'Motivo', value: baneo.reason || 'No especificado' }
              // { name: 'Moderador', value: baneo.executor.tag || 'Desconocido' }
            );
              
          logsChannel.send({ embeds: [embed] });
        // logsChannel.send(`Usuario baneado: ${user} por motivo ${baneo.reason}`);
      } else {
        console.error(`No se encontró el canal de registro (${LOGS_CHANNEL_ID})`);
      }
    }
	},
};