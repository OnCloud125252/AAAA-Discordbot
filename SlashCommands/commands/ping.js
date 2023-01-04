import { SlashCommandBuilder } from "discord.js";


export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong and calculate latency"),
    async execute(client, interaction, version) {
        const messageCreateTime = new Date().getTime();

        await interaction.reply({
            embeds: [{
                color: parseInt("ffff00", 16),
                title: "Caculating ping . . .",
                footer: {
                    text: `Bot V ${version}`
                },
                timestamp: new Date(),
            }]
        });

        const networkLatency = messageCreateTime - interaction.createdTimestamp;
        const apiLatency = client.ws.ping;

        await interaction.editReply({
            embeds: [{
                color: parseInt("00FF00", 16),
                title: "Pong 🏓",
                fields: [
                    {
                        name: "API latency",
                        value: `\`${apiLatency} ms\``,
                        inline: true
                    },
                    {
                        name: "Network Latency",
                        value: `\`${networkLatency} ms\``,
                        inline: true
                    }
                ],
                footer: {
                    text: `Bot V ${version}`
                },
                timestamp: new Date(),
            }]
        });
    }
};