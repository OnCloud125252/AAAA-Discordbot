import readgameID from "./functions/readgameID.js";
import storegameID from "./functions/storegameID.js";


export default class MongoDB {
    async readgameID(discordID) {
        if (typeof (discordID) === "string") {
            return await readgameID(discordID);
        }
        else {
            throw Error("type error : \"discordID\" should be string");
        }
    }
    storegameID(discordID, gameID) {
        return storegameID(discordID, gameID);
    }
}