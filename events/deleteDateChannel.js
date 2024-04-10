const {Events} = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return
        try {
            if (interaction.customId === 'amorwatch_terminarCita') {
                await interaction.reply('Esperamos que la hayan pasado bien, hasta la próxima!')

                const channel = await interaction.client.channels.fetch(interaction.channelId);
                await channel.delete();

            }
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};