import { SlashCommandBuilder } from "discord.js";

import readableTime from "../../_modules/readableTime/index.js";


export default {
    data: new SlashCommandBuilder()
        .setName("botinfo")
        .setDescription("Show bot details"),
    async execute(client, interaction, version) {
        var content = "";
        switch (Math.floor(Math.random() * 2)) {
            case 0:
                content = "看到這行的人可以獲得一塊餅乾 ฅ ^• ω •^ ฅ";
                break;
            case 1:
                content = "看到這行的人可以獲得一罐雪碧 ฅ ^• ω •^ ฅ";
                break;
        }
        const msg = await interaction.channel.send({
            content: content,
            fetchReply: true
        });

        const networkLatency = msg.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = client.ws.ping;
        const latency = networkLatency + apiLatency;
        var emoji;
        var emojitext;

        switch (true) {
            case (latency < 100):
                emoji = ":laughing:";
                emojitext = "Very good !";
                break;
            case (latency < 500):
                emoji = ":confused:";
                emojitext = "Uh, A bit laggy ...";
                break;
            case (latency < 1000):
                emoji = ":confounded:";
                emojitext = "It looks like we have a bad network connection ...";
                break;
            default:
                emoji = ":exploding_head:";
                emojitext = "Oh my, it looks terrible !\n***Are you on the moon ?***";
                break;
        }

        await interaction.reply({
            embeds: [{
                color: parseInt("4169e1", 16),
                title: "Bot info",
                fields: [
                    {
                        name: "API Latency :",
                        value: `\`${apiLatency} ms\``,
                        inline: true
                    },
                    {
                        name: "Network Latency :",
                        value: `\`${networkLatency} ms\``,
                        inline: true
                    },
                    {
                        name: `Rate : ${emoji}`,
                        value: emojitext,
                        inline: false
                    },
                    {
                        name: "Uptime :",
                        value: `\`${readableTime(client.uptime)["string"]}\``,
                        inline: true
                    },
                    {
                        name: "Start time :",
                        value: `\`${client.readyAt.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })} (GMT+8)\``,
                        inline: true
                    },
                    {
                        name: "Version :",
                        value: `\`V ${version}\``,
                        inline: false
                    }
                ],
                footer: {
                    text: `Bot \`V ${version}\``
                },
                timestamp: new Date(),
            }]
        });

        await msg.delete();
    }
};