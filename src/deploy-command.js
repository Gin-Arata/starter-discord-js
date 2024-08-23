const dotenv = require('dotenv');
dotenv.config();

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');


const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for(const folder of commandFolders) {
    // Grab all command file from dir commands/utility
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    // Grab all command from command builder
    for(const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if("data" in command && "execute" in command) {
            commands.push(command.data.toJSON())
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing required data or execute function`);
        }
    }
}


// construct and prepare instance of REST module
const rest = new REST().setToken(process.env.BOT_TOKEN);

// deploy command to discord
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Refresh the command
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch(e) {
        console.log(e);
    }
})();
