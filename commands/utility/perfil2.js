const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');

const config = {
    backgroundColor: '#0a0a1a',
    textColor: '#ffffff',
    accentColor: '#1e90ff',
    rankIconSize: { width: 40, height: 30 },
    platformIconSize: { width: 40, height: 40 },
    regionIconSize: { width: 45, height: 30 },

    rankImages: {
        sinrango: 'https://comunidadoverwatch.com/wp-content/uploads/2025/07/sin-rango.png',
        bronce: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/bronce.png',
        plata: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/plata.png',
        oro: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/oro.png',
        platino: 'https://comunidadooverwatch.com/wp-content/uploads/2022/11/platino.png',
        diamante: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/diamante.png',
        maestro: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/maestro.png',
        granmaestro: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/granmaestro.png',
        campeon: 'https://comunidadoverwatch.com/wp-content/uploads/2024/02/Logo-campeon-overwatch-2.png',
        top500: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/top500.png'
    },

    platformIcons: {
        pc: 'https://media.discordapp.net/attachments/1391123034286460928/1392551036165685481/pc.png?ex=686ff1b7&is=686ea037&hm=de28a29deb219628550b15f7f5002fcda34ac38806b782e7958e6da3d6fc2a55&=&format=webp&quality=lossless&width=1006&height=1006',
        ps: 'https://styles.redditmedia.com/t5_2qh6b/styles/communityIcon_izjg63p4lrw51.png',
        xbox: 'https://images.icon-icons.com/2699/PNG/512/xbox_logo_icon_169692.png',
        switch: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Nintendo_switch_logo.png'
    },

    regionIcons: {
        na: 'https://cdn-icons-png.flaticon.com/512/323/323310.png',
        eu: 'https://media.discordapp.net/attachments/1391123034286460928/1392553773632589906/europa-region.png?ex=686ff444&is=686ea2c4&hm=0268acfcf74d080a74aeea84f598639a0be475b60265aad291dc72d090492753&=&format=webp&quality=lossless&width=1353&height=902',
        as: 'https://cdn-icons-png.flaticon.com/512/323/323329.png',
        latam: 'https://media.discordapp.net/attachments/1391123034286460928/1392553773129531552/latam.png?ex=686ff443&is=686ea2c3&hm=5453dea8a71a3fb4910ba6a96bb976f1aa5921254feef41ec99e88caef9ecede&=&format=webp&quality=lossless&width=1353&height=902'
    }
};

async function generateProfile(user, rank = 'sinrango', platform = 'pc', region = 'eu') {
    const canvas = Canvas.createCanvas(600, 250);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = config.accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

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
        ctx.fillStyle = config.textColor;
        ctx.font = '20px Arial';
        ctx.fillText('AVATAR', 85, 125);
    }

    ctx.fillStyle = config.textColor;
    ctx.font = 'bold 24px Arial';
    ctx.fillText(user.username, 280, 80);

    // === RANGO ===
    ctx.font = '20px Arial';
    const rankLabel = 'Rango:';
    const rankText = rank.charAt(0).toUpperCase() + rank.slice(1);
    ctx.fillText(`${rankLabel} ${rankText}`, 280, 120);
    const rankTextWidth = ctx.measureText(`${rankLabel} ${rankText}`).width;
    try {
        const rankImg = await Canvas.loadImage(config.rankImages[rank]);
        ctx.drawImage(
            rankImg,
            280 + rankTextWidth + 10,
            100,
            config.rankIconSize.width,
            config.rankIconSize.height
        );
    } catch (error) {
        console.error('Error al cargar insignia de rango:', error);
    }

    // === PLATAFORMA ===
    const platformLabel = 'Plataforma:';
    const platformText = platform.toUpperCase();
    ctx.fillText(`${platformLabel} ${platformText}`, 280, 150);
    const platformTextWidth = ctx.measureText(`${platformLabel} ${platformText}`).width;
    try {
        const platformImg = await Canvas.loadImage(config.platformIcons[platform]);
        ctx.drawImage(
            platformImg,
            280 + platformTextWidth + 10,
            125,
            config.platformIconSize.width,
            config.platformIconSize.height
        );
    } catch (error) {
        console.error('Error al cargar icono de plataforma:', error);
    }

    // === REGIÓN ===
    const regionLabel = 'Región:';
    const regionText = region.toUpperCase();
    ctx.fillText(`${regionLabel} ${regionText}`, 280, 180);
    const regionTextWidth = ctx.measureText(`${regionLabel} ${regionText}`).width;
    try {
        const regionImg = await Canvas.loadImage(config.regionIcons[region]);
        ctx.drawImage(
            regionImg,
            280 + regionTextWidth + 10,
            160,
            config.regionIconSize.width,
            config.regionIconSize.height
        );
    } catch (error) {
        console.error('Error al cargar icono de región:', error);
    }

    return new AttachmentBuilder(await canvas.encode('png'), { name: 'perfil.png' });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil2')
        .setDescription('Muestra tu perfil de Overwatch automáticamente desde tus roles'),

    async execute(interaction) {
        // Obtiene los nombres de los roles en minúsculas
        const roles = interaction.member.roles.cache.map(r => r.name.toLowerCase());

        // Busca el rango, plataforma y región según los roles y las claves de config
        const rank = Object.keys(config.rankImages).find(r => roles.includes(r)) || 'sinrango';
        const platform = Object.keys(config.platformIcons).find(p => roles.includes(p)) || 'pc';
        const region = Object.keys(config.regionIcons).find(reg => roles.includes(reg)) || 'eu';

        // Si falta alguno, avisa al usuario
        if (!rank || !platform || !region) {
            return await interaction.reply({
                content: '❌ Debes tener asignado un rol de rango, plataforma y región para generar tu perfil. Por favor, asegúrate de tener los roles correctos.',
                ephemeral: true
            });
        }

        try {
            await interaction.deferReply();
            const profileImage = await generateProfile(interaction.user, rank, platform, region);
            await interaction.editReply({ files: [profileImage] });
        } catch (error) {
            console.error('Error en el comando /perfil2:', error);
            await interaction.editReply({
                content: '❌ Error al generar el perfil',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};