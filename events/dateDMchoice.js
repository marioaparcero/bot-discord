const {Events, ChannelType, PermissionsBitField} = require('discord.js');
const settings = require("../settings");


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        try {
            if (interaction.customId.includes('aceptarCitaBtn')) {
                const splitterID = interaction.customId.split('_')
                //usuario que envía la petición de cita
                const userDatingID = splitterID[1]
                const user1 = await interaction.client.users.fetch(userDatingID);
                //usuario que recibe la petición de cita
                const userDatedID = interaction.user.id
                const user2 = await interaction.client.users.fetch(userDatedID);

                const guild = await interaction.client.guilds.fetch(settings.guildId);

                await guild.channels.create({
                    name: `Cita-${user1.globalName}-${user2.globalName}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: user1.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: user2.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                    ],
                });

                await interaction.reply({content: `Creando chat para tu cita con ${user1.globalName}...`})

            }
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};