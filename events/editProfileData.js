const {
    Events, ActionRowBuilder, ModalBuilder, TextInputBuilder,
} = require('discord.js');


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;

        try {
            if (interaction.message.interaction.commandName === 'actualizarperfil') {
                const modal = new ModalBuilder()
                    .setCustomId('updateModal')
                    .setTitle('Edición de perfil de "LoveWatch"');

                const field = new TextInputBuilder()
                    .setCustomId(`${interaction.values[0]}Input`)
                    .setLabel(interaction.values[0])
                    .setStyle('Paragraph')
                    .setMaxLength(150)

                const fieldInput = new ActionRowBuilder().addComponents(field);
                modal.addComponents(fieldInput);

                await interaction.showModal(modal)
            }
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};
