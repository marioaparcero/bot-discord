const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');
const path = require('path');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Muestra o actualiza tu perfil de Overwatch')
        .addUserOption(option =>
            option.setName('usuario').setDescription('Usuario a consultar').setRequired(false))
        .addStringOption(option =>
            option.setName('rol').setDescription('Rol principal').setRequired(false).addChoices({ name: 'Tanque', value: 'tanque' }, { name: 'Daño', value: 'daño' }, { name: 'Apoyo', value: 'apoyo' }))
        .addStringOption(option =>
            option.setName('region').setDescription('Región de juego').setRequired(false).addChoices({ name: 'Latinoamérica', value: 'latan' }, { name: 'Norteamérica', value: 'na' }, { name: 'Europa', value: 'eu' }))
        .addStringOption(option =>
            option.setName('rango').setDescription('Rango competitivo').setRequired(false).addChoices({ name: 'Sin rango', value: 'sinrango' }, { name: 'Bronce', value: 'bronce' }, { name: 'Plata', value: 'plata' }, { name: 'Oro', value: 'oro' }, { name: 'Platino', value: 'platino' }, { name: 'Diamante', value: 'diamante' }, { name: 'Maestro', value: 'maestro' }, { name: 'Gran Maestro', value: 'granmaestro' }, { name: 'Top 500', value: 't500' }, { name: 'Campeón', value: 'campeon' }))
        .addStringOption(option =>
            option.setName('plataforma').setDescription('Plataforma de juego').setRequired(false).addChoices({ name: 'PC', value: 'pc' }, { name: 'PlayStation', value: 'ps' }, { name: 'Xbox', value: 'xbox' }, { name: 'Nintendo Switch', value: 'switch' })),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const member = interaction.guild.members.cache.get(targetUser.id);

        // Guardar datos si actualiza el propio perfil
        if (targetUser.id === interaction.user.id) {
            const updates = {};
            ['rol', 'region', 'rango', 'plataforma'].forEach(opt => {
                const val = interaction.options.getString(opt);
                if (val) updates[opt] = val;
            });

            if (Object.keys(updates).length > 0) {
                await db.set(`perfil_${targetUser.id}`, {
                    ...(await db.get(`perfil_${targetUser.id}`)) || {},
                    ...updates
                });
                return interaction.reply({ content: '✅ Perfil actualizado correctamente', ephemeral: true });
            }
        }

        const perfil = await db.get(`perfil_${targetUser.id}`);
        if (!perfil) {
            return interaction.reply({
                content: '❌ Este usuario no tiene perfil configurado.',
                ephemeral: true
            });
        }

        // Definir color por rango
        const rangoColor = {
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
        };

        // Canvas
        const canvas = Canvas.createCanvas(800, 300);
        const ctx = canvas.getContext('2d');

        // Fondo
        const bg = await Canvas.loadImage(path.join(__dirname, '../assets/wallpaper.jpg'));
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

        // Marco color según rango
        ctx.strokeStyle = rangoColor[perfil.rango] || '#ffffff';
        ctx.lineWidth = 6;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Avatar circular
        const { body } = await request(targetUser.displayAvatarURL({ extension: 'jpg', size: 256 }));
        const avatar = await Canvas.loadImage(await body.arrayBuffer());

        ctx.save();
        ctx.beginPath();
        ctx.arc(150, 150, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 50, 50, 200, 200);
        ctx.restore();

        // Función de texto adaptable
        const applyText = (canvas, text) => {
            let fontSize = 40;
            do {
                ctx.font = `${fontSize -= 2}px 'sans-serif'`;
            } while (ctx.measureText(text).width > 500);
            return ctx.font;
        };

        // Nombre
        ctx.font = applyText(canvas, member ? member.displayName : targetUser.username);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(member ? member.displayName : targetUser.username, 280, 100);

        // Rol, región, rango
        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#dddddd';
        ctx.fillText(`Rol: ${perfil.rol || 'No especificado'}`, 280, 140);
        ctx.fillText(`Región: ${perfil.region || 'No especificada'}`, 280, 170);
        ctx.fillText(`Rango: ${perfil.rango || 'Sin rango'}`, 280, 200);

        // Ícono de plataforma
        if (perfil.plataforma) {
            try {
                const icon = await Canvas.loadImage(path.join(__dirname, `../assets/icons/${perfil.plataforma}.png`));
                ctx.drawImage(icon, 280, 220, 40, 40);
                ctx.font = '20px sans-serif';
                ctx.fillText(perfil.plataforma.toUpperCase(), 330, 250);
            } catch (e) {
                ctx.fillText(`Plataforma: ${perfil.plataforma}`, 280, 250);
            }
        }

        // Exportar imagen
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'perfil.png' });
        await interaction.reply({ files: [attachment] });
    }
};