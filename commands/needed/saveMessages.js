const { SlashCommandBuilder } = require('discord.js');
const fetchAll = require('discord-fetch-all');
const path = require('node:path');
const fs = require('node:fs');


const SAVE_DIR = path.join(process.cwd(), 'saves');


async function justWriteItToFile(file, content) {
	if (!fs.existsSync(path.dirname(file))) {
		fs.mkdirSync(path.dirname(file), { recursive: true } );
	}
	fs.writeFile(file, content, err => { if (err) console.error(err) } );
}


module.exports = {
	needs_config: true,
	data: new SlashCommandBuilder()
		.setName('savemsg')
		.setDescription('Save messages in the current channel.')
		.addChannelOption(option =>
			option.setName('channel')
			.setDescription('Which channel to save the messages from [Where you sent the command]')
		)
		.addStringOption(option =>
			option.setName('saveas')
			.setDescription('A note for identifying the backup [Untitled]')
			.setRequired(false)
		)
		.addBooleanOption(option =>
			option.setName('nobot')
			.setDescription('Don\'t save messages from bots [False]')
			.setRequired(false)
		)
		.addBooleanOption(option =>
			option.setName('pinned')
			.setDescription('Save only pinned messages [False]')
			.setRequired(false)
		),
	async execute(interaction) {
		const { user, guildId, guild, member, options } = interaction;
		if (!(guildId in this.config['guildSettings'])) {
			interaction.reply('Please setup the bot for this server first!');
			return;
		}
		if (!(user.id === guild.ownerId || member.roles.cache.has(this.config['guildSettings'][guildId]['cansave']) )) {
			interaction.reply('No perms for that stuff');
			return;
		}
		const channel = options.getChannel('channel') ?? interaction.channel;
		const saveas = options.getString('saveas') ?? 'Untitled';
		const fetchOptions = {
			reverseArray: false,
			userOnly: options.getBoolean('nobot') ?? false,
			botOnly: false,
			pinnedOnly: options.getBoolean('pinned') ?? false
		};
		interaction.deferReply();
		const startTime = new Date();
		const allMessages = await fetchAll.messages(channel, fetchOptions);
		const jsonMsgs = JSON.stringify(allMessages);
		justWriteItToFile(
			path.join(SAVE_DIR, guildId,
				`${interaction.id}_${startTime.toISOString()}__${saveas}.sav`
			), jsonMsgs);
		const endTime = new Date();
		const totalTime = endTime - startTime;
		if (totalTime > 1000) {
			const totalHours = Math.floor(totalTime / 3600_1000 );
			const totalSeconds = Math.floor( (totalTime - totalHours * 3600 * 1000) / 1000 );
			interaction.editReply(`All messages were fetched and saved on disk in ${totalHours} hours ${totalSeconds} seconds.`);
		} else {
			interaction.editReply('Done!');
		}
	},
};


