const { Events, ChannelType } = require('discord.js');

module.exports = {
  name: Events.MessageCreate, // Usamos MessageCreate para detectar nuevos mensajes
  async execute(message) {
    // Verificamos si el mensaje es de un DM y no es de un bot
    // if (message.guild || message.author.bot) return;

    console.log("Mensaje recibido:", message.content);
    try {
      // Verificamos que el bot tiene permisos para crear canales en el servidor
      if (message.client.guilds.cache.size === 0) {
        console.error('El bot no está en ningún servidor.');
        return;
      }

      // Seleccionamos el primer servidor en el que el bot está
      const guild = message.client.guilds.cache.first();

      // Creamos un canal privado de texto con el contenido del mensaje
      const channel = await guild.channels.create({
        name: `mensaje-de-${message.author.username}`, // Nombre del canal basado en el usuario
        type: ChannelType.GuildText, // Aseguramos que sea un canal de texto
        permissionOverwrites: [
          {
            id: message.author.id,
            allow: ['ViewChannel', 'SendMessages'], // El usuario puede ver y enviar mensajes
          },
          {
            id: guild.id,
            deny: ['ViewChannel'], // El resto de miembros del servidor no podrá ver el canal
          },
        ],
      });

      // Enviamos el mensaje que el usuario envió en el canal creado
      await channel.send(`Mensaje del usuario ${message.author.tag}: ${message.content}`);

      // Responder al usuario indicando que se ha creado el canal
      await message.author.send(`¡Tu mensaje ha sido recibido! El canal privado ha sido creado.`);
    } catch (error) {
      console.error('Error al crear el canal privado:', error);
    }
  },
};
