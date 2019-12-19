const discord = require('discord.js');
const fs = require('fs');
const { sep } = require('path');
const { prefix, token, guild_id, hubot_testing } = require('./config.json');

const client = new discord.Client();
client.queue = new Map();
client.commands = new discord.Collection();


const load = (dir = './commands/') => {
	fs.readdirSync(dir).forEach(dirs => {
	// we read the commands directory for sub folders and filter the files with name with extension .js
		const commands = fs.readdirSync(`${dir}${sep}${dirs}${sep}`).filter(files => files.endsWith('.js'));
		// we use for loop in order to get all the commands in sub directory
		for (const file of commands) {
		// We make a pull to that file so we can add it the bot.commands collection
			const pull = require(`${dir}/${dirs}/${file}`);
			client.commands.set(pull.name, pull);
		}
	});
};

// we call the function to all the commands.
load();

client.on('guildMemberAdd', member => {
	// change this to the channel you want to send the greeting to
	const channel = member.guild.channels.find(c => c.name === 'general');
	if (!channel) return;
	channel.send(`Welcome ${member}!`);
});

client.on('ready', () => {
	console.log('Connected as ' + client.user.tag);
	client.user.setActivity('Youtube', { type: 'WATCHING' });
	const d = new Date();

	// 3 is wednesday
	if(d.getDay() == 4) {
		if(d.getHours() == 11 && d.getMinutes() == 3 && d.getSeconds() == 0) {
			console.log(d.getDay() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
			const guild = client.guilds.get(guild_id);
			const channel = guild.channels.get(hubot_testing);
			const args = [ 'schedule', 'next' ];
			const command = args.shift().toLowerCase();
			client.commands.get(command).execute(channel, args);
		}
	}
});

client.on('message', (message) => {
	messageContains(message);

	if (!message.content.startsWith(prefix) || message.author.bot) return;

	// whitespace
	const args = message.content.slice(prefix.length).split(/ +/);
	args.push(client);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && args.length == 1) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	try {
		command.execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}


});

function messageContains(message) {
	if(message.content.includes('food')) {
		message.react('🥞');
	}
	if(includes(message, 'died') || includes(message, 'death') || includes(message, 'kill') || includes(message, 'die')) {
		message.react('☠');
	}
}
function includes(message, val) {return message.content.includes(val);}

client.login(token);