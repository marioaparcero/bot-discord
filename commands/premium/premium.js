const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const UserPremium = require('../../Schemas/models/UserPremium.js');
const GuildPremium = require('../../Schemas/models/GuildPremium.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium')
        .setDescription('Manage premium access or check your own status.')

        .addSubcommand(subcommand =>
            subcommand
                .setName('user-add')
                .setDescription('Give a user premium access.')
                .addStringOption(option =>
                    option.setName('user')
                        .setDescription('User ID')
                        .setRequired(true)
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('user-remove')
                .setDescription('Remove premium access from a user.')
                .addStringOption(option =>
                    option.setName('user')
                        .setDescription('User ID')
                        .setRequired(true)
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('guild-add')
                .setDescription('Give a guild premium access.')
                .addStringOption(option =>
                    option.setName('guild')
                        .setDescription('Guild ID')
                        .setRequired(true)
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('guild-remove')
                .setDescription('Remove premium access from a guild.')
                .addStringOption(option =>
                    option.setName('guild')
                        .setDescription('Guild ID')
                        .setRequired(true)
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check if you have premium access.')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.options.getString('user');
        const guildId = interaction.options.getString('guild');

        // Embeds para respuestas comunes
        const successEmbed = new EmbedBuilder().setColor('Green');
        const errorEmbed = new EmbedBuilder().setColor('Red');

        switch (subcommand) {
            case 'user-add': {
                const existingUser = await UserPremium.findOne({ userID: userId });
                if (existingUser) {
                    return interaction.reply({
                        embeds: [errorEmbed.setDescription(`❌ The user <@${userId}> already has premium access.`)],
                        flags: MessageFlags.Ephemeral
                    });
                }

                await UserPremium.create({ userID: userId });
                return interaction.reply({
                    embeds: [successEmbed.setDescription(`✅ Successfully added <@${userId}> to premium.`)],
                    flags: MessageFlags.Ephemeral
                });
            }

            case 'user-remove': {
                const existingUser = await UserPremium.findOne({ userID: userId });
                if (!existingUser) {
                    return interaction.reply({
                        embeds: [errorEmbed.setDescription(`❌ The user <@${userId}> does not have premium access.`)],
                        flags: MessageFlags.Ephemeral
                    });
                }

                await UserPremium.deleteOne({ userID: userId });
                return interaction.reply({
                    embeds: [successEmbed.setDescription(`✅ Successfully removed premium access from <@${userId}>.`)],
                    flags: MessageFlags.Ephemeral
                });
            }

            case 'guild-add': {
                const existingGuild = await GuildPremium.findOne({ guildID: guildId });
                if (existingGuild) {
                    return interaction.reply({
                        embeds: [errorEmbed.setDescription(`❌ The guild with ID \`${guildId}\` already has premium access.`)],
                        flags: MessageFlags.Ephemeral
                    });
                }

                await GuildPremium.create({ guildID: guildId });
                return interaction.reply({
                    embeds: [successEmbed.setDescription(`✅ Successfully added premium access to guild ID \`${guildId}\`.`)],
                    flags: MessageFlags.Ephemeral
                });
            }

            case 'guild-remove': {
                const existingGuild = await GuildPremium.findOne({ guildID: guildId });
                if (!existingGuild) {
                    return interaction.reply({
                        embeds: [errorEmbed.setDescription(`❌ The guild with ID \`${guildId}\` does not have premium access.`)],
                        flags: MessageFlags.Ephemeral
                    });
                }

                await GuildPremium.deleteOne({ guildID: guildId });
                return interaction.reply({
                    embeds: [successEmbed.setDescription(`✅ Successfully removed premium access from guild ID \`${guildId}\`.`)],
                    flags: MessageFlags.Ephemeral
                });
            }

            case 'check': {
                const userPremium = await UserPremium.findOne({ userID: interaction.user.id });
                const guildPremium = await GuildPremium.findOne({ guildID: interaction.guild.id });

                const embed = new EmbedBuilder()
                    .setTitle('Premium Status')
                    .setTimestamp();

                if (userPremium || guildPremium) {
                    embed
                        .setColor('Green')
                        .setDescription('✅ You have premium access!');
                } else {
                    embed
                        .setColor('Red')
                        .setDescription('❌ You do not have premium access.');
                }

                return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }
        }
    }
};
