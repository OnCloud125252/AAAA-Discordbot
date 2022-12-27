import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
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
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Slash command : no command matching ${interaction.commandName} was found`);
        return;
    }

    try {
        await command.execute(client, interaction, packageJSON.version);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "Slash command : there was an error while executing this command", ephemeral: true });
    }
});

client.on("messageCreate", message => {
    if (message.author.bot) return;
    message.channel.send(`Message ${message.author} send > \`${message.content}\``);
});

client.on("ready", async () => {
    setInterval(() => {
        client.user?.setPresence({
            status: "online",  // online, idle, dnd, invisible
        });
        client.user?.setActivity({
            name: `[A] | ${client.ws.ping}ms | V${packageJSON.version}`,
            type: "STREAMING", // PLAYING, WATCHING, LISTENING, STREAMING
            url: "https://youtu.be/4hbf3eybAPk"
        });
    }, 30000);

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
    server.get("/ping", (_, res) => {
        res.status(200).json(`Service is up : ${readableTime(Math.round(performance.now()))["string"]}`);
    });
});

client.login(BOT_TOKEN);