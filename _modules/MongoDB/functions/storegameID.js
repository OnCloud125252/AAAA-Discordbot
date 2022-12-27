import axios from "axios";
import { load } from "cheerio";

import { schema_gameID } from "./_schema.js";


export default async function storegameID(discordID, gameID) {
    let errcode = 0;
    try {
        let data = await schema_gameID.findOne({ discordID: discordID }).exec();
        if (data == null) {
            let code = await axios.request({
                method: "GET",
                url: `https://stats.warbrokers.io/players/i/${gameID}`,
            }).then(async (response) => {
                let $ = load(response.data);
                let gameName_long = $("head > title").text().toString();
                let gameName = gameName_long.substring(0, gameName_long.length - 14);
                if (gameName.length > 0) {
                    await new schema_gameID({
                        discordID: discordID,
                        gameID: gameID
                    }).save();
                    return 1;
                }
                else {
                    return 3;
                }
            });
            return errcode = code;
        }
        else if (data.discordID == discordID) {
            return errcode = 2;
        }
    } catch (error) {
        return errcode;
    }
}