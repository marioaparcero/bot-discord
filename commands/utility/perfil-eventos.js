const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');

// Comando para mostrar medalla de evento
module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil-evento')
        .setDescription('🏆 Muestra tu medalla como ganador de eventos'),

    async execute(interaction) {
        try {
            const canvas = Canvas.createCanvas(600, 250);
            const ctx = canvas.getContext('2d');

            // Fondo
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Medalla centrada
            const medal = await Canvas.loadImage('https://comunidadoverwatch.com/wp-content/uploads/2024/02/medalla-evento.png');
            const x = canvas.width / 2 - 80;
            ctx.drawImage(medal, x, 60, 160, 160);

            // Texto
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🏆 GANADOR DE EVENTO', canvas.width / 2, 240);

            const final = new AttachmentBuilder(await canvas.encode('png'), { name: 'evento.png' });
            await interaction.reply({ files: [final] });
        } catch (error) {
            console.error('// Error en perfil-evento:', error);
            await interaction.reply({
                content: '❌ No se pudo mostrar la medalla.',
                ephemeral: true
            });
        }
    }
};