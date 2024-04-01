import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import isDevEnvironment from "../_modules/isDevEnvironment/index.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

if (!(isDevEnvironment ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN))
  throw Error(
    "registerSlashCommands : \"BOT_TOKEN\" not found in environment variable"
  );
if (!(isDevEnvironment ? process.env.DEV_CLIENT_ID : process.env.CLIENT_ID))
  throw Error(
    "registerSlashCommands : \"CLIENT_ID\" not found in environment variable"
  );
if (!(isDevEnvironment ? process.env.DEV_GUILD_ID : process.env.GUILD_ID))
  throw Error(
    "registerSlashCommands : \"GUILD_ID\" not found in environment variable"
  );

const BOT_TOKEN = isDevEnvironment
  ? process.env.DEV_BOT_TOKEN
  : process.env.BOT_TOKEN;
const CLIENT_ID = isDevEnvironment
  ? process.env.DEV_CLIENT_ID
  : process.env.CLIENT_ID;
const GUILD_ID =
  (isDevEnvironment ? process.env.DEV_GUILD_ID : process.env.GUILD_ID) || null;

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

export default async function registerSlashCommands() {
  const commands = [];
  const commandFiles = fs
    .readdirSync(join(__dirname, "/commands"))
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const { default: command } = await import(`./commands/${file}`);
    if (!command) break;
    commands.push(command.data.toJSON());
  }

  const guildCommands = [];
  // const guildCommandFiles = fs.readdirSync(join(__dirname, "/guildCommands")).filter(file => file.endsWith(".js"));
  // for (const file of guildCommandFiles) {
  //     const { default: guildCommand } = await import(`./guildCommands/${file}`);
  //     if (!guildCommand) break;
  //     guildCommands.push(guildCommand.data.toJSON());
  // }

  try {
    console.log("registerSlashCommands : started refreshing slash commands");

    if (GUILD_ID && guildCommands[0]) {
      await rest.put(
        Routes.applicationGuildCommands(
          CLIENT_ID.toString(),
          GUILD_ID.toString()
        ),
        {
          body: guildCommands
        }
      );
      console.log(
        `registerSlashCommands : successfully reloaded ${guildCommands.length} slash commands for guild ${GUILD_ID}`
      );
    }

    if (commands[0]) {
      await rest.put(Routes.applicationCommands(CLIENT_ID.toString()), {
        body: commands
      });
      console.log(
        `registerSlashCommands : successfully reloaded ${commands.length} gloabl slash commands`
      );
    }
  }
  catch (error) {
    console.error(error);
  }
}
