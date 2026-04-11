const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Bot listo: ${client.user.tag}`);

        // Iniciar Lavalink
        client.lavalink.options.client.id = client.user.id;
        await client.lavalink.init({ id: client.user.id, username: client.user.username });

        console.log('🎵 Lavalink Manager iniciado.');
    },
};