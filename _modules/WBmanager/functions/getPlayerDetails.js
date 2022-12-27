import axios from "axios";
import { load } from "cheerio";


export default async function getPlayerDetails(gameID) {
    try {
        const response = await axios.get(`https://stats.warbrokers.io/players/i/${gameID}`);

        if (response.status == 200) {
            const $ = load(response.data);
            const gameName_long = $("head > title").text().toString();
            const gameName = gameName_long.substring(0, gameName_long.length - 14);
            const kills = Number($("#player-details-summary-grid > div:nth-child(2) > div.player-details-number-box-value").text().replace(/,/g, "").replace(/\n/g, "").replace(/ /g, ""));
            const deaths = Number($("#player-details-summary-grid > div:nth-child(3) > div.player-details-number-box-value").text().replace(/,/g, "").replace(/\n/g, "").replace(/ /g, ""));
            const currentKD = (kills / deaths);
            const rounded_currentKD = Math.round(currentKD * 10) / 10;
            const nextKD = (rounded_currentKD + 0.05);
            const neededKills = (nextKD * deaths - kills);
            const rounded_neededKills = Math.round(neededKills * 1) / 1;
            const KDdrop = (rounded_currentKD - 0.06);
            const neededDeaths = (kills / KDdrop - deaths);
            const rounded_neededDeaths = Math.round(neededDeaths * 1) / 1;

            return {
                gameID,
                gameName_long,
                gameName,
                kills,
                deaths,
                currentKD,
                rounded_currentKD,
                nextKD,
                neededKills,
                rounded_neededKills,
                neededDeaths,
                rounded_neededDeaths,
                KDdrop
            };
        }
    }
    catch (_) {
        /* empty */
    }
    return {
        error: "getPlayerDetails : error during fetching data"
    };
}