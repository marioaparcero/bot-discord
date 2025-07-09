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
        Diamante: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/diamante.png',
        Maestro: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/maestro.png',
        Granmaestro: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/granmaestro.png',
        Campeon: 'https://comunidadoverwatch.com/wp-content/uploads/2024/02/Logo-campeon-overwatch-2.png',
        Top500: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/top500.png'
    },
    platformIcons: {
        pc: 'https://cdn-icons-png.flaticon.com/512/2103/2103657.png',
        ps: 'https://cdn-icons-png.flaticon.com/512/731/731390.png',
        xbox: 'https://cdn-icons-png.flaticon.com/512/732/732458.png',
        switch: 'https://cdn-icons-png.flaticon.com/512/2711/2711272.png'
    },
    // Region labels should be lowercase for consistent matching with role names
    regionLabels: ['america del norte', 'america', 'america del sur', 'europa', 'asia', 'latam']
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

    // Draw rank
    try {
        ctx.fillStyle = '#ffcc00'; // Specific color for rank text
        ctx.font = 'bold 24px Arial';
        const rankText = `Rango: ${rank}`;
        ctx.fillText(rankText, textStartX, currentY);

        const rankTextWidth = ctx.measureText(rankText).width;
        const rankIconX = textStartX + rankTextWidth + 10; // 10 pixels spacing after text
        const rankIconY = currentY - (config.rankIconSize.height / 2) + 5; // Adjust Y to align vertically with text

        const rankImg = await Canvas.loadImage(config.rankImages[rank]);
        ctx.drawImage(rankImg, rankIconX, rankIconY, config.rankIconSize.width, config.rankIconSize.height);
    } catch (error) {
        console.error(`Invalid rank provided or image failed to load for rank "${rank}":`, error);
    }

    currentY += 40; // Move down for the next line (adjust spacing as needed)

    // Draw platform
    try {
        ctx.fillStyle = config.textColor;
        ctx.font = '20px Arial';
        const platformText = `Plataforma: ${platform.toUpperCase()}`;
        ctx.fillText(platformText, textStartX, currentY);

        // Optionally, if you also want an icon for platform to the right of text:
        // const platformTextWidth = ctx.measureText(platformText).width;
        // const platformIconX = textStartX + platformTextWidth + 10;
        // const platformIconY = currentY - (config.platformIconSize.height / 2) + 5;
        // const platformImg = await Canvas.loadImage(config.platformIcons[platform]);
        // ctx.drawImage(platformImg, platformIconX, platformIconY, config.platformIconSize.width, config.platformIconSize.height);

    } catch (error) {
        console.error(`Invalid platform provided or image failed to load for platform "${platform}":`, error);
    }

    currentY += 40; // Move down for the next line

    // Draw region
    ctx.fillStyle = config.textColor;
    ctx.font = '20px Arial';
    const formattedRegion = region.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    ctx.fillText(`Región: ${formattedRegion}`, textStartX, currentY);

    // --- Layout adjustments end here ---

    // Draw galaxy logo
    try {
        const logoImg = await Canvas.loadImage(config.galaxyLogo);
        // Position logo to the right, adjusting Y for overall layout
        ctx.drawImage(logoImg, 430, 210, 120, 60);
    } catch (error) {
        console.error('Failed to load galaxy logo:', error);
    }

    // Return the generated image as an AttachmentBuilder
    return new AttachmentBuilder(await canvas.encode('png'), { name: 'perfil.png' });
}

// The module.exports part remains the same as it handles Discord interaction logic
module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil-prueba')
        .setDescription('Genera tu perfil de Overwatch automáticamente desde tus roles'),

    async execute(interaction) {
        const roles = interaction.member.roles.cache.map(r => r.name.toLowerCase());

        const rank = Object.keys(config.rankImages).find(r => roles.includes(r.toLowerCase()));
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