const { Events, ChannelType } = require('discord.js');

// Lista de jugadores inscritos
let players = [];

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {

    if (!interaction.isButton()) return;//funcion para el uso del boton

    if (interaction.customId === 'inscribirse') {

      if (players.includes(interaction.user.id)) {
        console.log('Esa madre ya existe we');
        const repeatMessage = await interaction.reply({ content: `${interaction.user} ya te has inscrito antes, no seas tonto.`, lifetime: 10000 });//creacion de un mensaje con 10 segundos de vida
        setTimeout(() => {
          repeatMessage.delete();
        }, 4000); // Eliminar el mensaje después de 4 segundos\

      } else {
        players.push(interaction.user.id);
        console.log('Agregado papu');
        const successMessage = await interaction.reply({ content: `${interaction.user} te has inscrito correctamente, ¡bien hecho!`, lifetime: 10000 });
        setTimeout(() => {
          successMessage.delete();
        }, 4000); // Eliminar el mensaje después de 4 segundos
      }
      // Verificar si la lista está completa
      if (players.length === 10) {
        // Mensaje de inicio de la PUG
        await interaction.channel.send('¡La PUG ha comenzado!');

        // Crear canal de voz
        const category = interaction.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.id === '1219775758248181840');
        const voiceChannel = await interaction.guild.channels.create({
          name: 'PUG Voice Channel',
          type: ChannelType.GuildVoice,
          parent: category.id,
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone,
              deny: ['Connect'],
            },
            {
              id: interaction.guild.roles.everyone,
              allow: ['ViewChannel'],
            },
          ],
        });

        // Mover a los jugadores al canal de voz y enviar mensaje directo si no están conectados
        // TODO: hay un bug donde el for manda 10 veces el mensaje preparacion al usuario 

        for (const player of players) {
          const member = interaction.guild.members.cache.find(m => m.user.id === player);
          if (member && member.voice.channel) {
            await member.voice.setChannel(voiceChannel);
          } else {
            await interaction.user.send('La PUG ha comenzado. Únete al canal de voz para participar.');
          }
        }
      }
    }

    if (interaction.customId === 'retirarse') {

      if (players.length === 0) {
        const otromensaje = await interaction.reply({ content: `${interaction.user} no puedes retirarte, no te has inscrito.` });
        setTimeout(() => {
          otromensaje.delete();
        }, 4000); //
      }

      else {
        players = players.filter(id => id !== interaction.user.id);
        console.log('Usuario retirado correctamente.');
        const withdrawMessage = await interaction.reply({ content: `${interaction.user} te has retirado correctamente.` });
        setTimeout(() => {
          withdrawMessage.delete();
        }, 4000); // Eliminar el mensaje después de 4 segundos
      }

    }

  }
};