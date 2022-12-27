import getPlayerDetails from "./functions/getPlayerDetails.js";
import readgameID from "../MongoDB/functions/readgameID.js";


export default class WBmanager {
    async getPlayerDetails(discordID) {
        if (typeof (discordID) === "string") {
            const dbResponse = await readgameID(discordID);
            switch (dbResponse.errcode) {
                case 1:
                    return await getPlayerDetails(dbResponse.gameID);
                case 2:
                    return { error: "readgameID : \"gameID\" not found in database" };
            }

        }
        else {
            throw Error("type error : \"discordID\" should be string");
        }
    }
}   