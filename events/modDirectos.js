const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageDelete,
  async execute(message) {
    if (message.channel.id === '1166429454306906152') {//message.channel.type === 'DM' &&
      // El mensaje se eliminó en el canal directo con la ID 12121232
      const deletedBy = message.author.username;
      const memberDelete = message.author.id;
    //   const deletedContent = message.content;
      let deletedContent = message.content;

      // Verifica si el mensaje tenía incrustaciones
      if (message.embeds.length > 0) {
        deletedContent = 'El mensaje contenía las siguientes incrustaciones:\n';
        message.embeds.forEach((embed, index) => {
          deletedContent += `Embed ${index + 1}:\n`;
          deletedContent += `Título: ${embed.title}\n`;
          deletedContent += `Descripción: ${embed.description}\n`;
          // Puedes acceder a más propiedades de la incrustación según tus necesidades
        });
      }
      // Aquí puedes obtener el usuario que eliminó el mensaje
      const deletedByUser = message.client.user.username;

      // Aquí puedes enviar el mensaje al canal de registro (log) con la información que has recopilado
      const logChannel = message.client.channels.cache.get('1161388038644060190');
      if (logChannel) {
        // logChannel.send(`El mensaje de ${deletedBy} ha sido eliminado. Contenido: ${deletedContent}`);
        logChannel.send(`El mensaje de ${deletedBy} (ID: ${memberDelete})\nEliminado por ${deletedByUser}\nContenido: ${deletedContent}`);
      }
    }
  }
};
