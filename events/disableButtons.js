const {Events, ButtonBuilder, ActionRowBuilder} = require('discord.js');


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        try {
            if (interaction.customId.includes('aceptarCitaBtn')) {
                const updatedButton = new ButtonBuilder()
                    .setCustomId("privado: ", interaction.customId)
                    .setLabel('Aceptar cita')
                    .setStyle('Danger')
                    .setDisabled(true);

                await interaction.message.edit({
                    components: [new ActionRowBuilder().addComponents(updatedButton)]
                })
            }

            if (interaction.customId.includes('pedirCita')) {
                const updatedButton = new ButtonBuilder()
                    .setCustomId(interaction.customId)
                    .setLabel('Pedir una cita!')
                    .setStyle('Danger')
                    .setDisabled(true);

                await interaction.update({
                    components: [new ActionRowBuilder().addComponents(updatedButton)]
                })
            }
            
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};