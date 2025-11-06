const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lovecalc')
        .setDescription('Calcula el porcentaje de amor entre dos personas 💘')
        .addSubcommand(sub =>
            sub
                .setName('random')
                .setDescription('Calcula el amor entre dos usuarios aleatorios del servidor'))
        .addSubcommand(sub =>
            sub
                .setName('users')
                .setDescription('Calcula el amor entre dos usuarios específicos')
                .addUserOption(opt =>
                    opt.setName('user1')
                        .setDescription('Primer usuario')
                        .setRequired(true))
                .addUserOption(opt =>
                    opt.setName('user2')
                        .setDescription('Segundo usuario')
                        .setRequired(true))
        ),

    async execute(interaction) {
        await interaction.deferReply(); // permite tiempo para generar imagen

        let user1, user2;

        // Subcomando: random o users
        if (interaction.options.getSubcommand() === 'random') {
            const members = [...interaction.guild.members.cache.values()]
                .filter(m => !m.user.bot);
            if (members.length < 2) {
                return interaction.editReply('❌ No hay suficientes miembros humanos para calcular el amor.');
            }
            user1 = members[Math.floor(Math.random() * members.length)].user;
            do {
                user2 = members[Math.floor(Math.random() * members.length)].user;
            } while (user1.id === user2.id);
        } else {
            user1 = interaction.options.getUser('user1');
            user2 = interaction.options.getUser('user2');
        }

        // Porcentaje de amor aleatorio
        const lovePercent = Math.floor(Math.random() * 101);
        const loveMessage = getLoveMessage(user1.username, user2.username, lovePercent);

        // Crear canvas
        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        // Fondo degradado
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ff758c');
        gradient.addColorStop(1, '#ff7eb3');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ** Cambios: añadir bordes redondeados con sombra y contorno interior **
        // Parámetros de borde
        const borderPadding = 10;
        const borderRadius = 24;
        const borderX = borderPadding;
        const borderY = borderPadding;
        const borderW = canvas.width - borderPadding * 2;
        const borderH = canvas.height - borderPadding * 2;

        // Función auxiliar para rectángulo redondeado
        function roundRect(ctx, x, y, w, h, r) {
            const radius = Math.min(r, w / 2, h / 2);
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.arcTo(x + w, y, x + w, y + h, radius);
            ctx.arcTo(x + w, y + h, x, y + h, radius);
            ctx.arcTo(x, y + h, x, y, radius);
            ctx.arcTo(x, y, x + w, y, radius);
            ctx.closePath();
        }

        // Borde externo con sombra
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 18;
        roundRect(ctx, borderX, borderY, borderW, borderH, borderRadius);
        ctx.fillStyle = 'rgba(255,255,255,0)'; // relleno transparente para que la sombra se aplique
        ctx.fill();
        // trazo externo (ligero blanco translúcido)
        const outerGradient = ctx.createLinearGradient(borderX, borderY, borderX + borderW, borderY + borderH);
        outerGradient.addColorStop(0, 'rgba(255,255,255,0.28)');
        outerGradient.addColorStop(1, 'rgba(255,255,255,0.12)');
        ctx.strokeStyle = outerGradient;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();

        // Borde interior fino para profundidad
        ctx.save();
        roundRect(ctx, borderX + 6, borderY + 6, borderW - 12, borderH - 12, borderRadius - 6);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        // ** Fin de cambios: bordes **

        // Cargar avatares y corazón
        const [avatar1, avatar2, heartImg] = await Promise.all([
            Canvas.loadImage(await fetch(user1.displayAvatarURL({ extension: 'png', size: 128 })).then(r => r.arrayBuffer())),
            Canvas.loadImage(await fetch(user2.displayAvatarURL({ extension: 'png', size: 128 })).then(r => r.arrayBuffer())),
            Canvas.loadImage(await fetch('https://cdn-icons-png.flaticon.com/512/833/833472.png').then(r => r.arrayBuffer()))
        ]);

        // const heart = await Canvas.loadImage('../../assets/heart.png');
        // const heart = await Canvas.loadImage('https://png.pngtree.com/png-vector/20220428/ourmid/pngtree-smooth-glossy-heart-vector-file-ai-and-png-png-image_4557871.png');

        // Dibujar avatar 1
        ctx.save();
        ctx.beginPath();
        ctx.arc(150, 125, 60, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar1, 90, 65, 120, 120);
        ctx.restore();

        // Dibujar avatar 2
        ctx.save();
        ctx.beginPath();
        ctx.arc(550, 125, 60, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar2, 490, 65, 120, 120);
        ctx.restore();

        // Dibujar corazón en medio ❤️
        ctx.drawImage(heartImg, 295, 85, 110, 110);

        // Texto porcentaje
        ctx.font = 'bold 36px Sans';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`${lovePercent}%`, canvas.width / 2, 220);

        // Crear archivo adjunto
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'lovecalc.png' });

        await interaction.editReply({
            content: `💞 **${user1.username}** + **${user2.username}** = **${lovePercent}% of Love**\n${loveMessage}`,
            files: [attachment],
        });
    },
};

// Mensaje según porcentaje
function getLoveMessage(user1, user2, percent) {
    if (percent <= 10)
        return `💔 En este inmenso universo, ${user1} y ${user2} son solo dos estrellas distantes 🌑`;
    if (percent <= 30)
        return `😕 ${user1} y ${user2} no parecen muy compatibles... pero el destino puede sorprender 💫`;
    if (percent <= 60)
        return `💖 Hay una chispa entre ${user1} y ${user2}... podría encenderse 🔥`;
    if (percent <= 90)
        return `💕 ${user1} y ${user2} están destinados a tener algo especial 💫`;
    return `💞 ¡Almas gemelas! ${user1} y ${user2} están hechos el uno para el otro 💍`;
}
