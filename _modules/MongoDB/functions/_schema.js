import mongoose from "mongoose";


const Schema = mongoose.Schema;

const gameID = new Schema({
    discordID: String,
    gameID: String,
    kdData: Object,
});

export const schema_gameID = mongoose.model("gameID", gameID, "gameIDs");