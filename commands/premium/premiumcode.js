const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const voucher_codes = require("voucher-code-generator");
const CodeSchema = require('../../Schemas/models/premiumcode');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premiumcode')
        .setDescription('Generate a premium user code.')
        .addStringOption(option =>
            option.setName('plan')
                .setDescription('Select your plan.')
                .setRequired(true)
                .addChoices(
                    { name: 'Minutely', value: 'minutely' },
                    { name: 'Daily', value: 'daily' },
                    { name: 'Weekly', value: 'weekly' },
                    { name: 'Monthly', value: 'monthly' },
                    { name: 'Yearly', value: 'yearly' },
                    { name: 'Lifetime', value: 'lifetime' }
                )
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const plan = interaction.options.getString('plan');
        const codePremium = voucher_codes.generate({ pattern: "####-####-####" });
        const code = codePremium.toString().toUpperCase();

        // Verificar si el código ya existe en la base de datos
        const findCode = await CodeSchema.findOne({ code });
        if (!findCode) {
            // Crear un nuevo documento en la base de datos
            await CodeSchema.create({ code, plan });
        } else {
            return interaction.editReply({
                content: `A conflict occurred. Please try generating the code again.`,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('・Premium Codes')
            .setDescription(`\`\`\`Generated Premium User Code:\n\n--------\n${code}\n--------\`\`\``)
            .addFields({ name: `\`💠\` • Plan Type:`, value: `\`\`\`${plan}\`\`\``, inline: true })
            .setColor('#FFD700')
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};
