import { schema_guild } from "../_schema.js";


export default async function updateGuild(guildID, datas) {
    switch (true) {
        case (datas === null):
            break;

        case (!Array.isArray(datas)):
            throw new Error("Data is not array");

        case (datas.length === 0):
            throw new Error("Data is empty");
    }
    try {
        let updatedData = null;

        const existingGuild = await schema_guild.findOne({ guildID: guildID });

        if (existingGuild) {
            datas.forEach(({ key, editor }) => {
                existingGuild[key] = editor(existingGuild[key] ?? null);
            });

            updatedData = existingGuild;

            await existingGuild.save();
        }
        else {
            const newGuild = new schema_guild({
                guildID: guildID
            });

            datas.forEach(({ key, editor }) => {
                newGuild[key] = editor(newGuild[key] ?? null);
            });

            updatedData = newGuild;

            await newGuild.save();
        }

        return updatedData;
    }
    catch (error) {
        throw new Error("An error occurred while updating or creating the chat record");
    }
}