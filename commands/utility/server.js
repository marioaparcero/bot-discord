const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('servidor')
		.setDescription('Provee información sobre el servidor actual.'),
	async execute(interaction) {
		const onlineMembers = interaction.guild.members.cache.filter(member => member.presence?.status === 'online').size;
		const boostCount = interaction.guild.premiumSubscriptionCount;
		const textChannels = interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size;
		const voiceChannels = interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size;
		const totalChannelSize = textChannels + voiceChannels;
		const verificationLevel = interaction.guild.verificationLevel;

		const embed = new EmbedBuilder()
			.setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
			.addFields([
				{ name: '🆔 ID del servidor', value: interaction.guild.id, inline: true },
				{ name: '👑 Dueño', value: `<@${interaction.guild.ownerId}>`, inline: true },
				{ name: '📅 Fecha de creación', value: interaction.guild.createdAt.toDateString(), inline: true },
				{ name: `👥 Miembros ${interaction.guild.memberCount}`, value: `**${onlineMembers}** en línea\n ${boostCount} Boosts ⭐`, inline: true },
				{ name: `💬 Canales ${totalChannelSize}`, value: `**${textChannels}** de texto | **${voiceChannels}** de voz`, inline: true },
				{ name: `🌍 Otros`, value: `**Nivel de verificación:** ${verificationLevel}`, inline: true },
				{ name: `🔐 Roles ${interaction.guild.roles.cache.size}`, value: 'Para ver los roles usa /roles', inline: true }
			])
			.setThumbnail(interaction.guild.iconURL())
			.setColor('#2b2d30')

		await interaction.reply({ embeds: [embed] });
	},
};