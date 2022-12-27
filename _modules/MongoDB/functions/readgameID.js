import { schema_gameID } from "./_schema.js";


export default async function readgameID(discordID) {
    let errcode = 0;
    let gameID = "";
    let data = await schema_gameID.findOne({ discordID: discordID }).exec();
    if (data) {
        errcode = 1;
        gameID = data.gameID;
    }
    else if (data == null) {
        errcode = 2;
    }
    return {
        errcode: errcode,
        gameID: gameID
    };
}