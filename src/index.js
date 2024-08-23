const dotenv = require('dotenv');
dotenv.config();

const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Create new Client Instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// to access .commands in other file
client.commands = new Collection();

// Retrieve all command files
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFile = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFile) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // set new item to the collection
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing required data or execute function`);
        }
    }
}

// Check client ready or not
client.once(Events.ClientReady, readyClient => {
    console.log(`Bot is activated! ${readyClient.user.tag}`);
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Command ${interaction.commandName} not found`);
        return;
    };

    try {
        await command.execute(interaction);
    } catch (e) {
        console.error(e);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "There was an error while executing this command!",
                ephemeral: true
            })
        } else {
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true
            })
        }
    }
})

// Login to Discord
client.login(process.env.BOT_TOKEN);