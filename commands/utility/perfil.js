const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');

// Centralized configuration for easy modification
const config = {
    backgroundColor: '#0a0a1a',
    textColor: '#ffffff',
    accentColor: '#1e90ff',
    rankIconSize: { width: 48, height: 48 },
    platformIconSize: { width: 32, height: 32 },
    galaxyLogo: 'https://comunidadoverwatch.com/wp-content/uploads/2023/01/Logo.png',
    rankImages: {
        Bronce: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/bronce.png',
        Plata: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/plata.png',
        Oro: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/oro.png',
        Platino: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/platino.png',
        Diamante: 'https://comunidadooverwatch.com/wp-content/uploads/2022/11/diamante.png',
        Maestro: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/maestro.png',
        Granmaestro: 'https://comunidadooverwatch.com/wp-content/uploads/2022/11/granmaestro.png',
        Campeon: 'https://comunidadoverwatch.com/wp-content/uploads/2024/02/Logo-campeon-overwatch-2.png',
        Top500: 'https://comunidadooverwatch.com/wp-content/uploads/2022/11/top500.png'
    },
    platformIcons: {
        PC: 'https://media.discordapp.net/attachments/1391123034286460928/1392551036165685481/pc.png?ex=686ff1b7&is=686ea037&hm=de28a29deb219628550b15f7f5002fcda34ac38806b782e7958e6da3d6fc2a55&=&format=webp&quality=lossless&width=1006&height=1006',
        ps: 'https://media.discordapp.net/attachments/1391123034286460928/1392557976442769590/playstation.png?ex=686ff82e&is=686ea6ae&hm=8fc87c4bf59c24b9783ed8a383169cc45adb7bd8f10de5fa84b4ac6b8131c2e3&=&format=webp&quality=lossless&width=1006&height=1006',
        xbox: 'https://media.discordapp.net/attachments/1391123034286460928/1392575866344706179/xbox.png?ex=687008d7&is=686eb757&hm=7c645ef2da64826ef12aeb223346410573b9ace56d069b55d4b53cfdd59a2841&=&format=webp&quality=lossless&width=1006&height=1006',
        switch: 'https://media.discordapp.net/attachments/1391123034286460928/1392575950037717162/nintendo-switch.png?ex=687008eb&is=686eb76b&hm=aad46b66f814a2d85dca920f3bfb13fc273bf5078b8f1d6c72bc70ae3887de31&=&format=webp&quality=lossless&width=1006&height=1006'
    },
    // Region labels should be lowercase for consistent matching with role names
    regionLabels: ['america del norte', 'america', 'america del sur', 'europa', 'asia', 'latam'],
    regionIcons: {
        europa: 'https://media.discordapp.net/attachments/1391123034286460928/1392553773632589906/europa-region.png?ex=686ff444&is=686ea2c4&hm=0268acfcf74d080a74aeea84f598639a0be475b60265aad291dc72d090492753&=&format=webp&quality=lossless&width=1353&height=902',
        america: 'https://media.discordapp.net/attachments/1391123034286460928/1392553773129531552/latam.png?ex=686ff443&is=686ea2c3&hm=5453dea8a71a3fb4910ba6a96bb976f1aa5921254feef41ec99e88caef9ecede&=&format=webp&quality=lossless&width=1353&height=902',
        latam: 'https://media.discordapp.net/attachments/1391123034286460928/1392553773129531552/latam.png?ex=686ff443&is=686ea2c3&hm=5453dea8a71a3fb4910ba6a96bb976f1aa5921254feef41ec99e88caef9ecede&=&format=webp&quality=lossless&width=1353&height=902'
            // Puedes agregar más regiones e iconos aquí si tienes las URLs
    }
};

/**
 * Generates a profile image for a user with their rank, platform, and region.
 * @param {object} user - The Discord user object.
 * @param {string} rank - The user's rank.
 * @param {string} platform - The user's platform.
 * @param {string} region - The user's region.
 * @returns {Promise<AttachmentBuilder>} A promise that resolves to an AttachmentBuilder containing the generated image.
 */
async function generateProfile(user, rank, platform, region) {
    const canvas = Canvas.createCanvas(600, 300);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw avatar
    try {
        const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 256 });
        const { body } = await request(avatarUrl);
        const avatar = await Canvas.loadImage(await body.arrayBuffer());

        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 150, 70, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 30, 80, 140, 140);
        ctx.restore();

        ctx.strokeStyle = config.accentColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(100, 150, 70, 0, Math.PI * 2);
        ctx.stroke();
    } catch (error) {
        console.error(`Error loading avatar for user ${user.username}:`, error);
        // Optionally draw a placeholder or log a more user-friendly error
    }

    // Draw username
    ctx.fillStyle = config.accentColor;
    ctx.font = 'bold 32px Arial';
    ctx.fillText(user.username, 220, 90);

    // --- Layout adjustments start here ---

    const textStartX = 220; // Starting X position for all text
    let currentY = 145; // Initial Y position for the first line of info

    // Tamaño uniforme para todos los iconos
    const iconSize = 40;

    // Helper para centrar icono con texto
    function getIconY(currentY, fontSize, iconSize) {
        // Centra el icono respecto a la línea base del texto
        return currentY - fontSize / 2 - iconSize / 2 + fontSize;
    }

    // Draw rank
    try {
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 24px Arial';
        const rankText = `Rango: ${rank}`;
        ctx.fillText(rankText, textStartX, currentY);

        const rankTextWidth = ctx.measureText(rankText).width;
        const rankIconX = textStartX + rankTextWidth + 15;
        const rankIconY = getIconY(currentY, -10, iconSize);

        const rankImg = await Canvas.loadImage(config.rankImages[rank]);
        ctx.drawImage(rankImg, rankIconX, rankIconY, iconSize, iconSize);
    } catch (error) {
        console.error(`Invalid rank provided or image failed to load for rank "${rank}":`, error);
    }

    currentY += 50;

    // Draw platform
    try {
        ctx.fillStyle = config.textColor;
        ctx.font = '20px Arial';
        const platformText = `Plataforma: ${platform.toUpperCase()}`;
        ctx.fillText(platformText, textStartX, currentY);

        const platformTextWidth = ctx.measureText(platformText).width;
        const platformIconX = textStartX + platformTextWidth + 15;
        const platformIconY = getIconY(currentY, -11, iconSize);

        let platformKey = platform;
        if (platformKey.toLowerCase() === 'pc') platformKey = 'PC';
        const platformImgUrl = config.platformIcons[platformKey];
        if (platformImgUrl) {
            const platformImg = await Canvas.loadImage(platformImgUrl);
            ctx.drawImage(platformImg, platformIconX, platformIconY, iconSize, iconSize);
        }
    } catch (error) {
        console.error(`Invalid platform provided or image failed to load for platform "${platform}":`, error);
    }

    currentY += 40;

    // Draw region
    ctx.fillStyle = config.textColor;
    ctx.font = '20px Arial';
    const formattedRegion = region.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    ctx.fillText(`Región: ${formattedRegion}`, textStartX, currentY);

    // Dibuja el icono de la región si existe
    try {
        let regionKey = region;
        if (regionKey.startsWith('america')) regionKey = 'america';
        if (regionKey === 'latam') regionKey = 'latam';
        if (regionKey === 'europa') regionKey = 'europa';

        const regionIconUrl = config.regionIcons[regionKey];
        if (regionIconUrl) {
            const regionImg = await Canvas.loadImage(regionIconUrl);
            const regionTextWidth = ctx.measureText(`Región: ${formattedRegion}`).width;
            const iconX = textStartX + regionTextWidth + -2;
            const iconY = getIconY(currentY, -10, iconSize);
            ctx.drawImage(regionImg, iconX, iconY, 65, iconSize);
        }
    } catch (error) {
        console.error('No se pudo cargar el icono de la región:', error);
    }

    // --- Layout adjustments end here ---

    // Draw galaxy logo
    try {
        const logoImg = await Canvas.loadImage(config.galaxyLogo);
        // Position logo to the right, adjusting Y for overall layout
        ctx.drawImage(logoImg, 455, 200, 120, 70);
    } catch (error) {
        console.error('Failed to load galaxy logo:', error);
    }

    // Return the generated image as an AttachmentBuilder
    return new AttachmentBuilder(await canvas.encode('png'), { name: 'perfil.png' });
}

// The module.exports part remains the same as it handles Discord interaction logic
module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Genera tu perfil de Overwatch automáticamente desde tus roles'),

    async execute(interaction) {
        const roles = interaction.member.roles.cache.map(r => r.name.toLowerCase());

        const rank = Object.keys(config.rankImages).find(r => roles.includes(r.toLowerCase()));
        // Normaliza la búsqueda de plataforma para que "pc" (rol en minúsculas) coincida con "PC" (clave en config)
        const platform = Object.keys(config.platformIcons).find(p => roles.includes(p.toLowerCase()));
        const region = config.regionLabels.find(reg => roles.includes(reg));

        if (!rank || !platform || !region) {
            return await interaction.reply({
                content: '❌ Debes tener asignado un rol de rango, plataforma y región para generar tu perfil. Por favor, asegúrate de tener los roles correctos.',
                ephemeral: true
            });
        }

        try {
            await interaction.deferReply();
            const image = await generateProfile(interaction.user, rank, platform, region);
            await interaction.editReply({ files: [image] });
        } catch (error) {
            console.error('Error during profile generation or reply:', error);
            await interaction.editReply({
                content: '❌ Hubo un error al intentar generar la imagen de tu perfil. Por favor, inténtalo de nuevo más tarde.',
                ephemeral: true
            });
        }
    }
};