const { Events, ChannelType, EmbedBuilder } = require('discord.js');
const ModmailData = require('../Schemas/Modmail/modmail'); // Path to your Modmail schema
const guildId = '1323741291997298748'; // your guildId, for the modmails
const modmailCategory = '1323741292508745791'; // The category where the modmail tickets should be created
const userIDs = ['1323441887503450228']; // Users who should see the modmail tickets
const roleIDs = ['1325645567183028315', '1325645584270491648']; // Roles who should see the modmail tickets

module.exports = {
  name: Events.MessageCreate, // Usamos MessageCreate para detectar nuevos mensajes
  async execute(message) {
   const userId = message.author.id;
   const guild = await message.client.guilds.fetch(guildId);
	 const UserMessage = message.content;

	if (message.author.bot) return;
	if (message.channel.type === ChannelType.DM) {

		try {

			const modmailData = await ModmailData.findOne({ userId: userId });
			const welcomeStatus = modmailData?.welcome ?? false;
			const modmailReason = modmailData?.issue ?? null;
			const modmailChannel = modmailData?.channel ?? null;

			if (welcomeStatus === false) {
				const welcomeEmbed = new EmbedBuilder()
				.setTitle('Welcome')
				.setColor('Green')
				.setDescription('Welcome to our Modmail system.\nIf you wish to contact our Team, please send in the next message your issue or send `cancel` to cancel the Modmail.')
				.setTimestamp();

				await message.channel.send({ embeds: [welcomeEmbed] });

				await ModmailData.updateOne(
					{ userId: userId },
					{ $set: { welcome: true } },
					{ upsert: true }
				);

				return;
			};

			if (welcomeStatus === true) {
				if (!modmailReason) {

					if (UserMessage !== 'cancel') {

						await ModmailData.updateOne(
							{ userId: userId },
							{ $set: { issue: UserMessage } },
							{ upsert: true }
						);

						const Category = await guild.channels.fetch(modmailCategory);

						const channel = await guild.channels.create({
							name: `${message.author.tag}`,
							type: ChannelType.GuildText,
							parent: Category,
						});

						await channel.permissionOverwrites.edit(guild.id, { ViewChannel: false });

						for (const userID of userIDs) {
							const user = await message.client.users.fetch(userID);

							await channel.permissionOverwrites.edit(user.id, {
								ViewChannel: true,
							});
						}

						for (const roleID of roleIDs) {
							const role = await guild.roles.fetch(roleID);
							await channel.permissionOverwrites.edit(role.id, {
								ViewChannel: true,
							});
						}


						await ModmailData.updateOne(
							{ userId: userId },
							{ $set: { channel: channel.id } },
							{ upsert: true }
						);

						const startEmbed = new EmbedBuilder()
						.setTitle('Connected!')
						.setColor('Green')
						.setDescription('You are now connected to our staff.')
						.setTimestamp();

						await message.channel.send({ embeds: [startEmbed] });

						const infoEmbed = new EmbedBuilder()
						.setTitle('Modmail')
						.setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL() })
						.setDescription(`${message.author} (${message.author.tag}) needs our help!\n\nIssue: \`${UserMessage}\``)
						.setColor('Green')
						.setTimestamp();

						const infoMessage = await channel.send({ embeds: [infoEmbed] });
						await infoMessage.pin()
					} else {

						await ModmailData.deleteOne({ userId: userId });

						const cancelEmbed = new EmbedBuilder()
						.setTitle('Cancel')
						.setColor('Red')
						.setDescription('You have canceled the modmail.')

						await message.channel.send({ embeds: [cancelEmbed] })
					};

					return;
				} else {

					const userChannel = await message.client.channels.fetch(modmailChannel);

					const embedMessage = new EmbedBuilder()
					.setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL() })
					.setDescription(message.content)
					.setTimestamp();

					try {
						await userChannel.send({ embeds: [embedMessage] });
						await message.react('✅');
					} catch (err) {
						console.log(`An error occurred while sending ${message.author.tag} modmail message.\nError:\n${err}`);
						await message.channel.send('An error occurred while sending your message.');
						await message.react('❌');
					}

					return;
				}
			}
		} catch (err) {
			await message.channel.send('An error occurred, please try again later.');
			console.log(`An error occurred while in chat with ${message.author.tag}\nError:\n${err}`);
			return;
		}
	};

	try {
		if (message.channel.type === ChannelType.GuildText) {

			const modmailServerData = await ModmailData.findOne({ channel: message.channel.id });
			const modmailUserId = modmailServerData?.userId ?? null;
			const modmailChannelId = modmailServerData?.channel ?? null;

			if (!modmailChannelId) return;

			const user = await message.client.users.fetch(modmailUserId);

			if (message.channel.id !== modmailChannelId) return;

			if (message.content === '!ping') {

				const wakeup = new EmbedBuilder()
				.setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL() })
				.setTitle('Wake up!')
				.setDescription('Please response in this modmail, or this modmail will be closed soon.')
				.setColor('Red')
				.setTimestamp();

				await user.send({ embeds: [wakeup] });
				wakeup.setDescription('The message was sent to the user!');
				await message.reply({ embeds: [wakeup] });
				return;
			} if (message.content === '!close') {
				const close = new EmbedBuilder()
				.setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL() })
				.setTitle('Close')
				.setColor('Red')
				.setDescription('The modmail is now closed. Delete the ticket with !delete')
				.setTimestamp();

				await message.reply({ embeds: [close] });
				close.setDescription('The modmail is now closed.');
				await user.send({ embeds: [close] });
				return;
			} if (message.content === '!delete') {
				const deleteEmbed = new EmbedBuilder()
				.setTitle('Delete')
				.setDescription('The ticket will be deleted in 5 seconds.')
				.setColor('Red')
				.setTimestamp();

				await user.send({ embeds: [deleteEmbed] });
				await message.reply({ embeds: [deleteEmbed] });

				setTimeout(async () => {

					deleteEmbed.setDescription('The ticket is now deleted.');

					await message.channel.delete();

					await ModmailData.deleteOne({ userId: user.id });

					await user.send({ embeds: [deleteEmbed] });
				}, 5000);
			} else {
				const embedMessage = new EmbedBuilder()
				.setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL() })
				.setDescription(message.content)
				.setTimestamp();

				try {
					await user.send({ embeds: [embedMessage] });
					await message.react('✅');
				} catch (err) {
					await message.reply('An error occurred, please try again later.')
					await message.react('❌');
					console.log(`An error occurred while ${message.author.tag} trys to contact ${user.tag}\nError:\n${err}`);
				}
			}
		}
	} catch (err) {
		console.log(`An error occurred while sending modmail message to ${message.author.tag}\nError:\n${err}`);
		await message.reply('An error occurred while sending your message.');
		await message.react('❌');
	}
  }
};