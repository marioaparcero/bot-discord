const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');

// Configuración mejorada con validación de URLs
const config = {
    rankImages: {
        sinrango: 'https://comunidadoverwatch.com/wp-content/uploads/2025/07/sin-rango.png',
        bronce: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/bronce.png',
        plata: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/plata.png',
        oro: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/oro.png',
        platino: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/platino.png',
        diamante: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/diamante.png',
        maestro: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/maestro.png',
        granmaestro: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/granmaestro.png',
        campeon: 'https://comunidadoverwatch.com/wp-content/uploads/2024/02/Logo-campeon-overwatch-2.png',
        t500: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/top500.png'
    },
    colors: {
        bronce: '#cd7f32',
        plata: '#c0c0c0',
        oro: '#ffd700',
        platino: '#e5e4e2',
        diamante: '#00bfff',
        maestro: '#00ff00',
        granmaestro: '#ff6600',
        t500: '#ffff00',
        campeon: '#a020f0',
        sinrango: '#999999'
    }
};

async function generateProfile(user, rank = 'sinrango') {
    const canvas = Canvas.createCanvas(600, 250);
    const ctx = canvas.getContext('2d');

    // Verificación y fallback de rango
    const validRank = config.rankImages.hasOwnProperty(rank) ? rank : 'sinrango';
    const rankColor = config.colors[validRank] || '#2c2f33';

    // Fondo con color de rango
    ctx.fillStyle = rankColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Avatar circular con manejo mejorado de errores
    try {
        const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 256 });
        const { body } = await request(avatarUrl);
        const avatar = await Canvas.loadImage(await body.arrayBuffer());

        ctx.save();
        ctx.beginPath();
        ctx.arc(125, 125, 80, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 45, 45, 160, 160);
        ctx.restore();
    } catch (error) {
        console.error('Error al cargar avatar:', error);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText('AVATAR', 85, 125);
    }

    // Insignia de rango con verificación de URL
    try {
        const rankImageUrl = config.rankImages[validRank];
        if (!rankImageUrl) throw new Error('URL de imagen de rango no definida');

        const rankImg = await Canvas.loadImage(rankImageUrl);
        ctx.drawImage(rankImg, 450, 30, 120, 120);
    } catch (error) {
        console.error('Error al cargar insignia de rango:', error);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(validRank.toUpperCase(), 460, 100);
    }

    // Información del usuario
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(user.username, 250, 80);

    ctx.font = '20px Arial';
    ctx.fillText(`Rango: ${validRank}`, 250, 120);

    return new AttachmentBuilder(await canvas.encode('png'), { name: 'perfil.png' });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Muestra tu perfil de Overwatch')
        .addStringOption(option =>
            option.setName('rango')
            .setDescription('Selecciona tu rango')
            .addChoices({ name: 'Sin rango', value: 'sinrango' }, { name: 'Bronce', value: 'bronce' }, { name: 'Plata', value: 'plata' }, { name: 'Oro', value: 'oro' }, { name: 'Platino', value: 'platino' }, { name: 'Diamante', value: 'diamante' }, { name: 'Maestro', value: 'maestro' }, { name: 'Gran Maestro', value: 'granmaestro' }, { name: 'Top 500', value: 't500' }, { name: 'Campeón', value: 'campeon' })),

    async execute(interaction) {
        const rank = interaction.options.getString('rango') || 'sinrango';

        try {
            await interaction.deferReply();
            const profileImage = await generateProfile(interaction.user, rank);
            await interaction.editReply({ files: [profileImage] });
        } catch (error) {
            console.error('Error en el comando /perfil:', error);
            await interaction.editReply({
                content: '❌ Error al generar el perfil',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};