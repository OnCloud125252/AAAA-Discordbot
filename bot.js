import { Client, GatewayIntentBits, Partials, Collection, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import mongoose from "mongoose";
import express from "express";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

import registerSlashCommands from "./SlashCommands/register.js";
import readableTime from "./_modules/readableTime/index.js";
import uuid from "./_modules/uuid/uuid.js";
import contentHandler from "./Contents/handler.js";

const startTime = performance.now();

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const server = express();
const host = (process.env.DEV ? process.env.DEV_HOST : process.env.HOST) || "localhost";
const port = (process.env.DEV ? process.env.DEV_PORT : process.env.PORT) || 3000;

const packageJSON = JSON.parse(readFileSync("./package.json"));

if (!(process.env.DEV ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN)) throw Error("Server : \"BOT_TOKEN\" not found in environment variable");
const BOT_TOKEN = (process.env.DEV ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN);

await registerSlashCommands();

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();
const commandsPath = join(__dirname, "/SlashCommands", "/commands");
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const { default: command } = await import(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`registerSlashCommands : the command at ${filePath} is missing a required "data" or "execute" property`);
    }
}

client.on("interactionCreate", async interaction => {
    const errorUUID = uuid();
    console.log(interaction.commandName + interaction.options._subcommand + interaction.options._hoistedOptions);

    process.on("uncaughtException", (error) => {
        console.error(error);
        logErrorToDiscord(errorUUID, {
            client,
            interaction,
            error,
            command: {
                name: interaction.commandName,
                subcommand: interaction.options._subcommand,
                options: interaction.options._hoistedOptions.map(option => { return { name: option.name, value: option.value }; })
            }
        });
    });

    try {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Slash command : no command matching ${interaction.commandName} was found`);
            return;
        }

        await command.execute(client, interaction, packageJSON.version);
    } catch (error) {
        console.error(error);
        logErrorToDiscord(errorUUID, {
            client,
            interaction,
            error,
            command: {
                name: interaction.commandName,
                subcommand: interaction.options._subcommand,
                options: interaction.options._hoistedOptions.map(option => { return { name: option.name, value: option.value }; })
            }
        });

        const contactRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Report error to admin")
                    .setURL("https://discord.com/users/755269122597585018")
                    .setStyle(ButtonStyle.Link)
            );
        await interaction.channel.send({
            embeds: [{
                color: parseInt("ff0000", 16),
                title: "Error occurred",
                description: "Please copy and paste the following information to admin :",
                fields: [
                    {
                        name: "1. Error ID",
                        value: `\`${errorUUID}\``,
                        inline: false
                    },
                    {
                        name: "2. The screenshot of the command(s)",
                        value: "(insert the screenshot)",
                        inline: false
                    },
                ],
                footer: {
                    text: `Bot V ${packageJSON.version}`
                },
                timestamp: new Date(),
            }],
            components: [contactRow]
        });
    }
});

client.on("messageCreate", contentHandler);

client.on("ready", async () => {
    mongoose.set("strictQuery", false);
    const db = await mongoose.connect((process.env.DEV ? process.env.DEV_MONGO_URI : process.env.MONGO_URI), { keepAlive: true });
    console.log(`Server : successfully connected to MongoDB, Database name: "${db.connections[0].name}"`);

    server.set("port", port);
    server.set("host", host);
    const app = server.listen(server.get("port"), server.get("host"), () => {
        const finishTime = performance.now();
        console.error(`Keepalive : listening on ${host}:${app.address().port}`);
        console.log(`Bot : logged in as ${client.user.tag}`);
        console.log(`Server : client is on (took ${readableTime(Math.round(finishTime - startTime))["string"]})`);
    });
    server.get("/", (_, res) => {
        res.status(200).json(`Service is up : ${readableTime(Math.round(performance.now()))["string"]}`);
    });

    (function loop() {
        client.user?.setPresence({
            status: "online",  // online, idle, dnd, invisible

            activities: [{
                name: `/help | ${client.ws.ping}ms | V${packageJSON.version}`,
                type: ActivityType.Listening
            }],
        });
        setTimeout(() => {
            loop();
        }, 10 * 1000);
    })();
});

client.login(BOT_TOKEN);

function logErrorToDiscord(errorUUID, errorObject) {
    const { client, interaction, error, command } = errorObject;

    client.channels.cache.get((process.env.DEV ? process.env.DEV_LOG_CHANNEL : process.env.LOG_CHANNEL)).send({
        content: `<@755269122597585018>\nThere's an error occurred in guild \`${interaction.guild.name}\``,
        embeds: [{
            color: parseInt("ff0000", 16),
            title: `Error \`${errorUUID}\``,
            fields: [
                {
                    name: "\u200b",
                    value: "**Guild**",
                    inline: false
                },
                {
                    name: "Name",
                    value: `\`${interaction.guild.name}\``,
                    inline: true
                },
                {
                    name: "ID",
                    value: `\`${interaction.guildId}\``,
                    inline: true
                },
                {
                    name: "\u200b",
                    value: "**Channel**",
                    inline: false
                },
                {
                    name: "Name",
                    value: `\`${interaction.channel.name}\``,
                    inline: true
                },
                {
                    name: "ID",
                    value: `\`${interaction.channelId}\``,
                    inline: true
                },
                {
                    name: "\u200b",
                    value: "**Command**",
                    inline: false
                },
                {
                    name: "Name",
                    value: "```\n" + command.name + "\n```",
                    inline: true
                },
                (command.subcommand ? {
                    name: "Subcommand",
                    value: "```\n" + command.subcommand + "\n```",
                    inline: true
                } : null),
                (command.options[0] ? {
                    name: "Options",
                    value: "```\n" + command.options.map(option => JSON.stringify(option, null, 4)).join(",\n") + "\n```",
                    inline: true
                } : null),
                {
                    name: "Full error",
                    value: "```\n" + error + "\n```",
                    inline: false
                },
            ].filter(obj => obj),
            footer: {
                text: `Bot V ${packageJSON.version}`
            },
            timestamp: new Date(),
        }]
    });
}