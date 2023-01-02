import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Lists all available slash commands"),
    async execute(client, interaction, version) {
        var commandList = [];

        const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith(".js"));

        for (const file of commandFiles) {
            const { default: command } = await import(`./${file}`);
            commandList.push({
                name: command.data.name,
                value: command.data.description
            });
        }

        await interaction.reply({
            embeds: [{
                color: parseInt("ba03fc", 16),
                title: "Available slash commands",
                fields: commandList,
                footer: {
                    text: `Bot V ${version}`
                },
                timestamp: new Date(),
            }],
            ephemeral: true
        });
    }
};