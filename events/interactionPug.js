const { Events, ChannelType} = require('discord.js');

// Lista de jugadores inscritos
let players = [];

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'inscribirse') {
      // Verificar si la lista ya está llena
      if (players.length >= 10) {
        await interaction.reply({ content: 'La PUG ya está llena.', ephemeral: true });
        return;
      }

      // Agregar jugador a la lista
      players.push(interaction.user.tag);

      // Actualizar mensaje con la lista de jugadores
      await interaction.channel.send(`[${players.length} de 10] ${interaction.user.tag} se ha inscrito a la PUG. Faltan ${10 - players.length} jugadores.`);

      // Verificar si la lista está completa
      if (players.length === 10) {
        // Mensaje de inicio de la PUG
        await interaction.channel.send('¡La PUG ha comenzado!');

        // Crear canal de voz
        const category = interaction.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.id === '1219775758248181840');
        const voiceChannel = await interaction.guild.channels.create({
          name:'PUG Voice Channel',
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
            const member = interaction.guild.members.cache.find(m => m.user.tag === player);
            if (member && member.voice.channel) {
              await member.voice.setChannel(voiceChannel);
            } else {
              await interaction.user.send('La PUG ha comenzado. Únete al canal de voz para participar.');
            }
          }
      }
    }
  }
};
