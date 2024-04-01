import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv";


dotenv.config();

if (!(process.env.DEV ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN))
  throw Error(
    "unRegisterSlashCommands : \"BOT_TOKEN\" not found in environment variable"
  );
if (!(process.env.DEV ? process.env.DEV_CLIENT_ID : process.env.CLIENT_ID))
  throw Error(
    "unRegisterSlashCommands : \"CLIENT_ID\" not found in environment variable"
  );
if (!(process.env.DEV ? process.env.DEV_GUILD_ID : process.env.GUILD_ID))
  throw Error(
    "unRegisterSlashCommands : \"GUILD_ID\" not found in environment variable"
  );

const BOT_TOKEN = process.env.DEV
  ? process.env.DEV_BOT_TOKEN
  : process.env.BOT_TOKEN;
const CLIENT_ID = process.env.DEV
  ? process.env.DEV_CLIENT_ID
  : process.env.CLIENT_ID;
const GUILD_ID =
  (process.env.DEV ? process.env.DEV_GUILD_ID : process.env.GUILD_ID) || null;

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

export default async function unRegisterSlashCommands() {
  try {
    console.log("unRegisterSlashCommands : started refreshing slash commands");

    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(
          CLIENT_ID.toString(),
          GUILD_ID.toString()
        ),
        {
          body: []
        }
      );
      console.log(
        `unRegisterSlashCommands : successfully deleted all slash commands for guild ${GUILD_ID}`
      );
    }

    await rest.put(Routes.applicationCommands(CLIENT_ID.toString()), {
      body: []
    });
    console.log(
      "unRegisterSlashCommands : successfully deleted all gloabl slash commands"
    );
  }
  catch (error) {
    console.error(error);
  }
}

unRegisterSlashCommands();
