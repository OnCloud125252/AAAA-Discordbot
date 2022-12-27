import { SlashCommandBuilder } from "discord.js";


export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong and calculate latency"),
    async execute(client, interaction, version) {
        const msg = await interaction.channel.send({
            content: "Caculating ping . . .",
            fetchReply: true
        });

        const networkLatency = msg.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = client.ws.ping;

        await interaction.reply({
            embeds: [{
                color: parseInt("00FF00", 16),
                title: "Pong 🏓",
                fields: [
                    {
                        name: "API latency :",
                        value: `\`${apiLatency} ms\``,
                        inline: true
                    },
                    {
                        name: "Network Latency :",
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

        await msg.delete();
    }
};