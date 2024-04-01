const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

// Lista de jugadores inscritos
let players = [];

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Ignorar los mensajes del propio bot
    if (message.author.bot) {
      return;
    }

    // Verificar si el mensaje es el comando !pug
    if (message.content.toLowerCase() === '!pug') {
      // Verificar si la lista ya está llena
      if (players.length >= 10) {
        message.channel.send('La PUG ya está llena.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('Se busca PUG')
        .setDescription('¡Únete a la PUG haciendo clic en el botón "Inscribirse"!')
        .setColor('#0099ff');

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('inscribirse')
            .setLabel('Inscribirse')
            .setStyle('Primary')
        );

      await message.channel.send({ embeds: [embed], components: [row] });
    }
  }
};
