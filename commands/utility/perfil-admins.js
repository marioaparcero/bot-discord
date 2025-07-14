const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil-menu')
        .setDescription('📑 Abre el menú de selección de perfiles'),

    async execute(interaction) {
        const rolesPermitidos = ['admin', 'staff', 'moderador', 'mvp'];
        const rolesUsuario = interaction.member.roles.cache.map(r => r.name.toLowerCase());

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
                }
            ]);

        // Si el usuario tiene rol autorizado, se le muestra la opción privada
        if (rolesUsuario.some(role => rolesPermitidos.includes(role))) {
            menu.addOptions({
                label: '/perfil-admins',
                description: 'Perfil exclusivo solo accesible por admins',
                value: 'privado',
                emoji: '🔒'
            });
        }

        const row = new ActionRowBuilder().addComponents(menu);

        const embed = new EmbedBuilder()
            .setTitle('📁 Menú de Perfiles')
            .setDescription('Selecciona el tipo de perfil que deseas mostrar.')
            .setColor('#1e90ff');

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
};