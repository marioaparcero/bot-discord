const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Muestra o actualiza tu perfil de Overwatch')
        .addUserOption(option =>
            option.setName('usuario')
            .setDescription('Usuario a consultar')
            .setRequired(false))
        .addStringOption(option =>
            option.setName('rol')
            .setDescription('Rol principal')
            .setRequired(false)
            .addChoices({ name: 'Tanque', value: 'tanque' }, { name: 'Daño', value: 'daño' }, { name: 'Apoyo', value: 'apoyo' }))
        .addStringOption(option =>
            option.setName('region')
            .setDescription('Región de juego')
            .setRequired(false)
            .addChoices({ name: 'Latinoamérica', value: 'latan' }, { name: 'Norteamérica', value: 'na' }, { name: 'Europa', value: 'eu' }))
        .addStringOption(option =>
            option.setName('rango')
            .setDescription('Rango competitivo')
            .setRequired(false)
            .addChoices({ name: 'Bronce', value: 'bronce' }, { name: 'Plata', value: 'plata' }, { name: 'Oro', value: 'oro' }, { name: 'Platino', value: 'platino' }, { name: 'Diamante', value: 'diamante' }, { name: 'Maestro', value: 'maestro' }, { name: 'Gran Maestro', value: 'granmaestro' }, { name: 'Top 500', value: 't500' }))
        .addStringOption(option =>
            option.setName('plataforma')
            .setDescription('Plataforma de juego')
            .setRequired(false)
            .addChoices({ name: 'PC', value: 'pc' }, { name: 'PlayStation', value: 'ps' }, { name: 'Xbox', value: 'xbox' }, { name: 'Nintendo Switch', value: 'switch' })),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        // Actualizar perfil propio
        if (targetUser.id === interaction.user.id) {
            const updateData = {};
            const rol = interaction.options.getString('rol');
            const region = interaction.options.getString('region');
            const rango = interaction.options.getString('rango');
            const plataforma = interaction.options.getString('plataforma');

            if (rol) updateData.rol = rol;
            if (region) updateData.region = region;
            if (rango) updateData.rango = rango;
            if (plataforma) updateData.plataforma = plataforma;

            if (Object.keys(updateData).length > 0) {
                await db.set(`perfil_${targetUser.id}`, {
                    ...(await db.get(`perfil_${targetUser.id}`)) || {},
                    ...updateData
                });
                return interaction.reply({
                    content: '✅ Perfil actualizado correctamente',
                    ephemeral: true
                });
            }
        }

        // Mostrar perfil (propio o de otro)
        const perfil = await db.get(`perfil_${targetUser.id}`);

        if (!perfil) {
            return interaction.reply({
                content: targetUser.id === interaction.user.id ?
                    '❌ No tienes un perfil configurado. Usa las opciones para crear uno.' : `❌ ${targetMember ? targetMember.displayName : targetUser.username} no tiene perfil configurado`,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FF9C33')
            .setAuthor({
                name: targetMember ? targetMember.displayName : targetUser.username,
                iconURL: targetUser.displayAvatarURL()
            })
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields({ name: 'Rol Principal', value: perfil.rol ? perfil.rol : 'No especificado', inline: true }, { name: 'Región', value: perfil.region ? perfil.region.toUpperCase() : 'No especificada', inline: true }, { name: 'Rango', value: perfil.rango ? perfil.rango.charAt(0).toUpperCase() + perfil.rango.slice(1) : 'No especificado', inline: true }, { name: 'Plataforma', value: perfil.plataforma ? perfil.plataforma.toUpperCase() : 'No especificada', inline: true })
            .setFooter({ text: 'Perfil de Overwatch' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};