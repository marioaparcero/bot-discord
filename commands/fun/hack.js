const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hack')
        .setDescription('Simula un hackeo (de broma)')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('La víctima del hackeo')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const messages = [
            'Accediendo al sistema...',
            'Bypasseando firewall...',
            'Descargando datos...',
            'Encriptando conexión...',
            'Obteniendo cookies...',
            'Recolectando información personal...'
        ];

        await interaction.reply(`🎮 Iniciando hackeo a ${target.username}...`);
        
        let progress = '';
        for (const msg of messages) {
            progress = '';
            for (let i = 0; i < 20; i++) {
                progress += '█';
                const embed = {
                    title: '👾 HACK EN PROGRESO',
                    description: `${msg}\n[${'█'.repeat(i)}${'▒'.repeat(20-i)}] ${i*5}%`,
                    color: 0xff0000,
                };
                await interaction.editReply({ embeds: [embed] });
                await new Promise(r => setTimeout(r, 500));
            }
        }

        const finalEmbed = {
            title: '✅ HACKEO COMPLETADO',
            description: `${target.username} ha sido hackeado exitosamente!\n\n` +
                        `🔑 Contraseña: ${'*'.repeat(12)}\n` +
                        `📧 Correos encontrados: ${Math.floor(Math.random() * 100)}\n` +
                        `💾 Archivos descargados: ${Math.floor(Math.random() * 1000)}GB\n\n` +
                        `(Esto es solo una simulación divertida)`,
            color: 0x00ff00,
        };

        await interaction.editReply({ embeds: [finalEmbed] });
    },
};
