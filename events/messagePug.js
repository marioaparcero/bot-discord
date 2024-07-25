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
    if (message.content.toLowerCase() === 'pug') {

      // Verificar si la lista ya está llena
      if (players.length === 10) {
        message.channel.send('La PUG ya está llena.');
        return;
      }
      //creacion del boton de inscripcion
      //const embed = new EmbedBuilder()
      //.setTitle('Se busca PUG')
      //.setDescription('¡Únete a la PUG haciendo clic en el botón "Inscribirse"!')
      //.setColor('#0099ff');

      const embed1 = new EmbedBuilder()
        .setTitle('Se busca PUG')
        .setDescription('¡Únete a la PUG haciendo clic en el botón "Inscribirse"!')
        .setColor('Blue');

      const embed2 = new EmbedBuilder()
        .setTitle('lista: ')
        .setDescription(players.length > 0 ? players.join('\n') : 'No hay jugadores inscritos aún.')
        .setColor('Red');

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('inscribirse')
            .setLabel('Inscribirse')
            .setStyle('Primary'),

          new ButtonBuilder()
            .setCustomId('retirarse')
            .setLabel('Retirarse')
            .setStyle('Danger')

        );
      // Enviar primer embed y acción
      const message1 = await message.channel.send({ embeds: [embed1], components: [row] });

      // Enviar segundo embed y acción
      const message2 = await message.channel.send({ embeds: [embed2] });

      
    }
  }
};