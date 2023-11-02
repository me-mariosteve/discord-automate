const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	needs_config: true,
	data: new SlashCommandBuilder()
		.setName('setupsaver')
		.setDescription('Change settings about messages saving behavior.')
		.addSubcommand(subcommand =>
			subcommand.setName('cansave')
			.setDescription('Which role can use the command to save messages.')
			.addRoleOption(option =>
				option.setName('role')
				.setDescription('The role')
			)
		)
		.addSubcommand(subcommand =>
			subcommand.setName('cansetup')
			.setDescription('Which role can change parameters of the bot.')
			.addRoleOption(option =>
				option.setName('role')
				.setDescription('The role')
			)
		),
	async execute(interaction) {
		const { user, guild, guildId, member, options } = interaction;
		if (!(
			user.id === guild.ownerId
			|| (
				guildId in this.config
				&& member.roles.cache.has(this.config['guildSettings'][guildId]['cansetup'])
			)
		)) {
			await interaction.reply('You do not have the permissions to use this command.')
			return;
		}
		if (typeof this.config['guildSettings'][guildId] === 'undefined') {
			this.config['guildSettings'][guildId] = {
				'cansave': null,
				'cansetup': null
			};
		}
		if (options.getSubcommand() === 'cansave') {
			this.config['guildSettings'][guildId]['cansave'] = options.getRole('role').id;
		} else if (options.getSubcommand() === 'cansetup') {
			this.config['guildSettings'][guildId]['cansetup'] = options.getRole('role').id;
		}
		interaction.reply('Done');
	}
}

