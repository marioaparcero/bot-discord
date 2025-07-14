const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

// Comando principal para mostrar el selector de perfiles disponibles
module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil-menu')
        .setDescription('📑 Abre el menú de selección de perfiles'),

    async execute(interaction) {
        // Menú desplegable con las opciones correctas
        const menu = new StringSelectMenuBuilder()
            .setCustomId('perfil_selector')
            .setPlaceholder('Selecciona el tipo de perfil que deseas mostrar')
            .addOptions([{
                    label: '/perfil-usuario',
                    description: 'Perfil clásico con rango, región y plataforma',
                    value: 'usuario',
                    emoji: '🎮'
                },
                {
                    label: '/perfil-evento',
                    description: 'Perfil con medalla de evento',
                    value: 'evento',
                    emoji: '🏆'
                },
                {
                    label: '/perfil',
                    description: 'Perfil especial (requiere permiso)',
                    value: 'privado',
                    emoji: '🔒'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        // Embed explicativo
        const embed = new EmbedBuilder()
            .setTitle('📁 Menú de Perfiles')
            .setDescription('Selecciona qué tipo de perfil deseas mostrar. Algunos comandos requieren permiso.')
            .setColor('#1e90ff');

        // Respuesta con menú
        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
};