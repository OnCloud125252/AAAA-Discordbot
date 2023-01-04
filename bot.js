import { Client, GatewayIntentBits, Partials, Collection, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import mongoose from "mongoose";
import express from "express";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

import registerSlashCommands from "./SlashCommands/register.js";
import readableTime from "./_modules/readableTime/index.js";


const startTime = performance.now();

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const server = express();
const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

const packageJSON = JSON.parse(readFileSync("./package.json"));

if (!process.env.BOT_TOKEN) throw Error("Server : \"BOT_TOKEN\" not found in environment variable");
const BOT_TOKEN = process.env.BOT_TOKEN;

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
    process.on("uncaughtException", (error) => {
        console.error(error);
        client.channels.cache.get("1060304066707722281").send({
            embeds: [{
                color: parseInt("ff0000", 16),
                title: "Error occurred",
                fields: [
                    {
                        name: "Guild ID",
                        value: `\`${interaction.guildId}\``,
                        inline: true
                    },
                    {
                        name: "Channel ID",
                        value: `\`${interaction.channelId}\``,
                        inline: true
                    },
                    {
                        name: "Full error",
                        value: "```\n" + error + "\n```",
                        inline: false
                    },
                ],
                footer: {
                    text: `Bot V ${packageJSON.version}`
                },
                timestamp: new Date(),
            }]
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
        client.channels.cache.get("1060304066707722281").send({
            embeds: [{
                color: parseInt("ff0000", 16),
                title: "Error occurred",
                fields: [
                    {
                        name: "Guild ID",
                        value: `\`${interaction.guildId}\``,
                        inline: true
                    },
                    {
                        name: "Channel ID",
                        value: `\`${interaction.channelId}\``,
                        inline: true
                    },
                    {
                        name: "Full error",
                        value: "```\n" + error + "\n```",
                        inline: false
                    },
                ],
                footer: {
                    text: `Bot V ${packageJSON.version}`
                },
                timestamp: new Date(),
            }]
        });

        const contactRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Send admin a message")
                    .setURL("https://discord.com/users/755269122597585018")
                    .setStyle(ButtonStyle.Link)
            );

        interaction.channel.send({
            embeds: [{
                color: parseInt("ff0000", 16),
                title: "Error occurred",
                fields: [
                    {
                        name: error.name,
                        value: "```\n" + error.message + "\n```",
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

client.on("messageCreate", message => {
    if (message.author.bot) return;
    if (message.content.startsWith("A ")) {
        const command = message.content.toLowerCase().split(" ").slice(1).join(" ");
        switch (message.content.toLowerCase()) {
            case "a ping":
            case "a botinfo":
                message.reply(`:warning::warning::warning: WARNING :warning::warning::warning:\n\n> All commands are converted to slash command (\`/\`).\n> Please try to use \`/${command}\` instead!\n> For more information about slash command usage, please use \`/help\` command.`);
                break;
        }
    }
    else if (message.content.toLowerCase() === "kd") {
        message.reply(`:warning::warning::warning: WARNING :warning::warning::warning:\n\n> All commands are converted to slash command (\`/\`).\n> Please try to use \`/${message.content.toLowerCase()}\` instead!\n> For more information about slash command usage, please use \`/help\` command.`);
    }
});

client.on("ready", async () => {
    mongoose.set("strictQuery", false);
    const db = await mongoose.connect(process.env.MONGO_URI, { keepAlive: true });
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