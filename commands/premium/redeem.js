const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment');
const Code = require('../../Schemas/models/premiumcode');
const User = require('../../Schemas/models/user');
const soycanvas = require('soycanvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('redeem')
        .setDescription('Redeem your Premium Code.')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Introduce your Premium Code.')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const input = interaction.options.getString('code').toUpperCase();
        const user = await User.findOne({ Id: interaction.user.id });
        const code = await Code.findOne({ code: input });
        const premiumID = soycanvas.Util.captchaKey(12);

        if (user?.isPremium) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(`\`❌\` | You are already a premium user.`)]
            });
        }

        if (!code) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor('#800080').setDescription(`\`❌\` | The provided code was invalid. Please try again.`)]
            });
        }

        const durationMap = {
            minutely: 300000,
            daily: 86400000,
            weekly: 86400000 * 7,
            monthly: 86400000 * 30,
            yearly: 86400000 * 365,
            lifetime: 86400000 * 365 * 100
        };

        const duration = durationMap[code.plan];
        const expiresAt = Date.now() + duration;

        const userData = {
            Id: interaction.user.id,
            isPremium: true,
            PremID: premiumID,
            redeemedAt: Date.now(),
            expiresAt: durationMap[code.plan] === durationMap.lifetime ? null : expiresAt,
            plan: code.plan
        };

        if (user) {
            Object.assign(user, userData);
            await user.save();
        } else {
            await new User(userData).save();
        }

        await Code.deleteOne({ code: input });
        

        const time = await User.findOne({ Id: interaction.user.id });
        const expires = time.expiresAt ? moment(time.expiresAt).format('dddd, MMMM Do YYYY HH:mm:ss') : 'Never';

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Premium Redeemed!', iconURL: interaction.client.user.displayAvatarURL() })
            .setDescription(`Congratulations ${interaction.member}, you've successfully redeemed your premium code.`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setColor('#800080')
            .setTimestamp();

        embed.addFields([
            { name: `\`👥\` • Redeemed By`, value: `\`\`\`${interaction.member.displayName}\`\`\``, inline: true },
            { name: `\`💠\` • Plan Type`, value: `\`\`\`${time.plan}\`\`\``, inline: true },
            { name: `\`🕓\` • Expired Time`, value: `\`\`\`${expires}\`\`\``, inline: false },
            { name: `\`🆔\` • Premium ID`, value: `\`\`\`${time.PremID}\`\`\``, inline: false }
        ]);

        return interaction.editReply({ embeds: [embed] });
    }
};
