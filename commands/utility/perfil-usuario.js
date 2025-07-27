const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const { request } = require('undici');
const Canvas = require('@napi-rs/canvas');

// Configuración visual y recursos
const config = {
    backgroundColor: '#0a0a1a',
    textColor: '#ffffff',
    rankIconSize: { width: 40, height: 30 },
    platformIconSize: { width: 40, height: 40 },
    regionIconSize: { width: 40, height: 35 },
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
        top500: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/top500.png'
    },
    platformIcons: {
        pc: 'https://media.discordapp.net/attachments/1391123034286460928/1392551036165685481/pc.png',
        ps: 'https://media.discordapp.net/attachments/1391123034286460928/1392557976442769590/playstation.png?ex=6887b32e&is=688661ae&hm=da13727100de4ef753f1d25f35dd930c15648630a58a53586a3e90780ec1bee9&=&format=webp&quality=lossless',
        xbox: 'https://media.discordapp.net/attachments/1391123034286460928/1392575866344706179/xbox.png?ex=6887c3d7&is=68867257&hm=7e7d30d267139c86d048a0cd48465157aee56a649984da29fe3369d21e65a41d&=&format=webp&quality=lossless',
        switch: 'https://media.discordapp.net/attachments/1391123034286460928/1392575950037717162/nintendo-switch.png?ex=6887c3eb&is=6886726b&hm=4c831df5929c1fffbd8f73b56bfdabdfc753951d3a9c9a4666e758592d7fb6de&=&format=webp&quality=lossless'
    },
    regionIcons: {
        europa: 'https://media.discordapp.net/attachments/1391123034286460928/1392553773632589906/europa-region.png?ex=6887af44&is=68865dc4&hm=3787f11b0d243b438ec647026bf314ce94083f67f52d52a94a7760203ed8f9b5&=&format=webp&quality=lossless&width=1380&height=920',
        america: 'https://media.discordapp.net/attachments/1391123034286460928/1392553773129531552/latam.png?ex=6887af43&is=68865dc3&hm=a6b2788edbd5603c57cf4305165b34d15e5a513932259db054533422f0d92c3a&=&format=webp&quality=lossless&width=1380&height=920',
        asia: 'https://media.discordapp.net/attachments/1391123034286460928/1392591623325745432/asia.png?ex=6887d284&is=68868104&hm=a8f2eae430a05113a4208e4d2d0d9730844592b3fe7552b58d5398c9576802a6&=&format=webp&quality=lossless&width=1392&height=928'
    }
};

// Function to get accent color based on rank
function getAccentColorForRank(rank) {
    switch (rank) {
        case 'bronce':
            return '#CD7F32';
        case 'plata':
            return '#C0C0C0';
        case 'oro':
            return '#FFD700';
        case 'platino':
            return '#E5E4E2';
        case 'diamante':
            return '#B9F2FF';
        case 'maestro':
            return '#9A6324';
        case 'granmaestro':
            return '#800000';
        case 'campeon':
            return '#0000FF'; // Example blue, adjust as needed
        case 'top500':
            return '#FF4500'; // Orange-red for Top500
        default:
            return '#1e90ff'; // Default blue for 'sinrango' or unknown
    }
}

// Comando perfil
module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil-usuario')
        .setDescription('🎮 Muestra el perfil clásico de Overwatch')
        .addUserOption(option =>
            option.setName('usuario')
            .setDescription('El usuario del que quieres ver el perfil')
            .setRequired(false)),

    async execute(interaction) {
        try {
            const usuario = interaction.options.getUser('usuario') || interaction.user;
            const miembro = interaction.options.getMember('usuario') || interaction.member;

            const roles = miembro.roles.cache.map(r => r.name.toLowerCase()); // Get all roles in lowercase

            // Find rank, platform, and region case-insensitively
            const rank = Object.keys(config.rankImages).find(rKey => roles.includes(rKey.toLowerCase())) || 'sinrango';
            const platform = Object.keys(config.platformIcons).find(pKey => roles.includes(pKey.toLowerCase())) || 'pc';
            const region = Object.keys(config.regionIcons).find(regKey => roles.includes(regKey.toLowerCase())) || 'europa'; // Changed default to 'europa'

            const accentColor = getAccentColorForRank(rank);

            const canvas = Canvas.createCanvas(600, 250);
            const ctx = canvas.getContext('2d');
            const centerX = canvas.width / 2;

            ctx.fillStyle = config.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = accentColor; // Use dynamic accent color for border
            ctx.lineWidth = 4; // Slightly thicker border for emphasis
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

            ctx.fillStyle = config.textColor;
            ctx.font = 'bold 28px Arial'; // Slightly larger font for username
            ctx.textAlign = 'center';
            ctx.fillText(usuario.username, centerX, 40);

            // Avatar centrado en el lado izquierdo
            try {
                const avatarUrl = usuario.displayAvatarURL({ extension: 'png', size: 256 });
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
                console.error('Error loading avatar:', error);
            }

            // Data blocks for Rank, Platform, and Region
            const dataBlocks = [
                { label: 'Rango:', value: rank.toUpperCase(), iconUrl: config.rankImages[rank], size: config.rankIconSize, type: 'rank' },
                { label: 'Plataforma:', value: platform.toUpperCase(), iconUrl: config.platformIcons[platform], size: config.platformIconSize, type: 'platform' },
                { label: 'Región:', value: region.toUpperCase(), iconUrl: config.regionIcons[region], size: config.regionIconSize, type: 'region' }
            ];

            // Define alignment lines and spacing for the right-hand information
            const redLineX = 290; // X position for the left edge of the text (your "red line")
            const pinkLineX = 550; // X position for the right edge of the icons (your "pink/purple line")
            const lineGap = 15; // Vertical space between the bottom of one block and the top of the next
            let currentBlockY = 80; // Starting Y position for the top of the first block (rank)

            for (const block of dataBlocks) {
                try {
                    ctx.font = '22px Arial'; // Font for labels and values
                    ctx.textAlign = 'left'; // Align text to the left
                    ctx.fillStyle = config.textColor;

                    // Text positioning (aligned to the red line)
                    const labelX = redLineX;
                    // Calculate textY to vertically center text with the icon's height
                    const textY = currentBlockY + (block.size.height / 2) + (ctx.measureText('M').actualBoundingBoxAscent / 2) - 2;

                    const labelText = block.label;
                    const valueText = block.value;

                    ctx.fillText(labelText, labelX, textY);

                    const labelWidth = ctx.measureText(labelText).width;
                    const valueX = labelX + labelWidth + 5; // 5 pixels gap between label and value

                    ctx.fillText(valueText, valueX, textY);

                    // Icon positioning (aligned to the pink/purple line)
                    const iconX = pinkLineX - block.size.width; // Calculate X so the right edge aligns with pinkLineX
                    const iconY = currentBlockY; // Icon starts at the current block's top Y

                    const icon = await Canvas.loadImage(block.iconUrl);

                    // Apply glow only for the rank icon
                    if (block.type === 'rank') {
                        ctx.shadowColor = accentColor;
                        ctx.shadowBlur = 8;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                    }

                    ctx.drawImage(icon, iconX, iconY, block.size.width, block.size.height);

                    // Reset shadow properties after drawing the rank icon
                    if (block.type === 'rank') {
                        ctx.shadowBlur = 0;
                        ctx.shadowColor = 'transparent';
                    }

                    // Move to the start of the next line, considering the icon's height and desired gap
                    currentBlockY += block.size.height + lineGap;
                } catch (err) {
                    console.error(`Error drawing ${block.label} block:`, err);
                    // Draw placeholder text if icon fails to load
                    ctx.fillStyle = 'red';
                    ctx.font = '18px Arial';
                    // Position placeholder text similarly to how the actual text would be
                    ctx.fillText(`Error cargando icono para ${block.label}`, redLineX, currentBlockY + (block.size.height / 2) + 5);
                    currentBlockY += block.size.height + lineGap; // Still move to the next line
                }
            }

            const imagen = new AttachmentBuilder(await canvas.encode('png'), { name: 'perfil.png' });
            await interaction.reply({ files: [imagen] });

        } catch (error) {
            console.error('Error generating profile:', error);
            await interaction.reply({
                content: '❌ Error al generar el perfil clásico.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};