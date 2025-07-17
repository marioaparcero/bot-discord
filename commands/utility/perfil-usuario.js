const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const { request } = require('undici');
const Canvas = require('@napi-rs/canvas');

// Configuración visual y recursos
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
        platino: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/platino.png',
        diamante: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/diamante.png',
        maestro: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/maestro.png',
        granmaestro: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/granmaestro.png',
        campeon: 'https://comunidadoverwatch.com/wp-content/uploads/2024/02/Logo-campeon-overwatch-2.png',
        top500: 'https://comunidadoverwatch.com/wp-content/uploads/2022/11/top500.png'
    },
    platformIcons: {
        pc: 'https://media.discordapp.net/attachments/1391123034286460928/1392551036165685481/pc.png',
        ps: 'https://styles.redditmedia.com/t5_2qh6b/styles/communityIcon_izjg63p4lrw51.png',
        xbox: 'https://images.icon-icons.com/2699/PNG/512/xbox_logo_icon_169692.png',
        switch: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Nintendo_switch_logo.png'
    },
    regionIcons: {
        na: 'https://cdn-icons-png.flaticon.com/512/323/323310.png',
        eu: 'https://media.discordapp.net/attachments/1391123034286460928/1392553773632589906/europa-region.png',
        as: 'https://cdn-icons-png.flaticon.com/512/323/323329.png',
        latam: 'https://media.discordapp.net/attachments/1391123034286460928/1392553773129531552/latam.png'
    }
};

// Comando perfil
module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('🎮 Muestra el perfil clásico de Overwatch')
        .addUserOption(option =>
            option.setName('usuario')
            .setDescription('El usuario del que quieres ver el perfil')
            .setRequired(false)),

    async execute(interaction) {
        try {
            const usuario = interaction.options.getUser('usuario') || interaction.user;
            const miembro = interaction.options.getMember('usuario') || interaction.member;

            const roles = miembro.roles.cache.map(r => r.name.toLowerCase());
            const rank = Object.keys(config.rankImages).find(r => roles.includes(r)) || 'sinrango';
            const platform = Object.keys(config.platformIcons).find(p => roles.includes(p)) || 'pc';
            const region = Object.keys(config.regionIcons).find(reg => roles.includes(reg)) || 'eu';

            const canvas = Canvas.createCanvas(600, 250);
            const ctx = canvas.getContext('2d');
            const centerX = canvas.width / 2;

            ctx.fillStyle = config.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = config.accentColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

            ctx.fillStyle = config.textColor;
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(usuario.username, centerX, 40);

            // Avatar centrado
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
                console.error('// Error avatar:', error);
            }

            // Iconos alineados
            const iconYStart = 90;
            const iconSpacing = 60;

            async function drawBlock(iconUrl, label, value, size, index) {
                try {
                    const icon = await Canvas.loadImage(iconUrl);
                    const y = iconYStart + index * iconSpacing;
                    const xIcon = centerX - (size.width / 2);
                    const xText = centerX;
                    ctx.drawImage(icon, xIcon, y, size.width, size.height);
                    ctx.fillStyle = config.textColor;
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(`${label}: ${value}`, xText, y + size.height + 20);
                } catch (err) {
                    console.error(`// Error ${label}:`, err);
                }
            }

            await drawBlock(config.rankImages[rank], 'Rango', rank.toUpperCase(), config.rankIconSize, 0);
            await drawBlock(config.platformIcons[platform], 'Plataforma', platform.toUpperCase(), config.platformIconSize, 1);
            await drawBlock(config.regionIcons[region], 'Región', region.toUpperCase(), config.regionIconSize, 2);

            const imagen = new AttachmentBuilder(await canvas.encode('png'), { name: 'perfil.png' });
            await interaction.reply({ files: [imagen] });
        } catch (error) {
            console.error('// Error perfil:', error);
            await interaction.reply({
                content: '❌ Error al generar el perfil clásico.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};