const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const { request } = require('undici');
const Canvas = require('@napi-rs/canvas');
const config = require('./config'); // Asumimos que tenés tu config separada

// Comando para mostrar perfil clásico
module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil-usuario')
        .setDescription('🎮 Muestra tu perfil clásico de Overwatch'),

    async execute(interaction) {
        try {
            // Obtener roles del usuario
            const roles = interaction.member.roles.cache.map(r => r.name.toLowerCase());
            const rank = Object.keys(config.rankImages).find(r => roles.includes(r)) || 'sinrango';
            const platform = Object.keys(config.platformIcons).find(p => roles.includes(p)) || 'pc';
            const region = Object.keys(config.regionIcons).find(reg => roles.includes(reg)) || 'eu';

            // Crear canvas
            const canvas = Canvas.createCanvas(600, 250);
            const ctx = canvas.getContext('2d');
            const centerX = canvas.width / 2;

            // Fondo
            ctx.fillStyle = config.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = config.accentColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

            // Nombre centrado
            ctx.fillStyle = config.textColor;
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(interaction.user.username, centerX, 40);

            // Avatar circular
            try {
                const avatarUrl = interaction.user.displayAvatarURL({ extension: 'png', size: 256 });
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
                console.error('// Error al cargar avatar:', error);
            }

            // Función para dibujar cada bloque
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
                    console.error(`// Error con ${label}:`, err);
                }
            }

            await drawBlock(config.rankImages[rank], 'Rango', rank.toUpperCase(), config.rankIconSize, 0);
            await drawBlock(config.platformIcons[platform], 'Plataforma', platform.toUpperCase(), config.platformIconSize, 1);
            await drawBlock(config.regionIcons[region], 'Región', region.toUpperCase(), config.regionIconSize, 2);

            // Enviar imagen
            const imagen = new AttachmentBuilder(await canvas.encode('png'), { name: 'perfil.png' });
            await interaction.reply({ files: [imagen] });
        } catch (error) {
            console.error('// Error perfil-usuario:', error);
            await interaction.reply({
                content: '❌ Error al generar el perfil clásico.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};