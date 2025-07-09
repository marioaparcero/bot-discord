const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');

const config = {
    backgroundColor: '#0a0a1a',
    textColor: '#ffffff',
    accentColor: '#1e90ff',
    rankIconSize: { width: 40, height: 40 },
    platformIconSize: { width: 25, height: 25 },
    regionIconSize: { width: 25, height: 25 },

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
        pc: 'https://static.wikia.nocookie.net/logopedia/images/0/0e/Mycomputericonbymarkspcsolution1.png',
        ps: 'https://styles.redditmedia.com/t5_2qh6b/styles/communityIcon_izjg63p4lrw51.png',
        xbox: 'https://images.icon-icons.com/2699/PNG/512/xbox_logo_icon_169692.png',
        switch: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Nintendo_switch_logo.png'
    },

    regionIcons: {
        na: 'https://cdn-icons-png.flaticon.com/512/323/323310.png',
        eu: 'https://media.discordapp.net/attachments/1391123034286460928/1392553773632589906/europa-region.png?ex=686ff444&is=686ea2c4&hm=0268acfcf74d080a74aeea84f598639a0be475b60265aad291dc72d090492753&=&format=webp&quality=lossless&width=1353&height=902',
        as: 'https://cdn-icons-png.flaticon.com/512/323/323329.png',
        latam: 'https://cdn-icons-png.flaticon.com/512/323/323315.png'
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
            95,
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
            130,
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
        .setName('perfil-prueba1')
        .setDescription('Muestra tu perfil de Overwatch')
        .addStringOption(option =>
            option.setName('rango')
            .setDescription('Selecciona tu rango')
            .addChoices({ name: 'Sin rango', value: 'sinrango' }, { name: 'Bronce', value: 'bronce' }, { name: 'Plata', value: 'plata' }, { name: 'Oro', value: 'oro' }, { name: 'Platino', value: 'platino' }, { name: 'Diamante', value: 'diamante' }, { name: 'Maestro', value: 'maestro' }, { name: 'Gran Maestro', value: 'granmaestro' }, { name: 'Campeón', value: 'campeon' }, { name: 'Top 500', value: 'top500' }))
        .addStringOption(option =>
            option.setName('plataforma')
            .setDescription('Tu plataforma')
            .addChoices({ name: 'PC', value: 'pc' }, { name: 'PlayStation', value: 'ps' }, { name: 'Xbox', value: 'xbox' }, { name: 'Nintendo Switch', value: 'switch' }))
        .addStringOption(option =>
            option.setName('region')
            .setDescription('Tu región')
            .addChoices({ name: 'América', value: 'na' }, { name: 'Europa', value: 'eu' }, { name: 'Asia', value: 'as' }, { name: 'Latinoamérica', value: 'latam' })),

    async execute(interaction) {
        const rank = interaction.options.getString('rango') || 'sinrango';
        const platform = interaction.options.getString('plataforma') || 'pc';
        const region = interaction.options.getString('region') || 'eu';

        try {
            await interaction.deferReply();
            const profileImage = await generateProfile(interaction.user, rank, platform, region);
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