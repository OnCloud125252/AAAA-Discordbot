import { readFileSync } from "fs";


const packageJSON = JSON.parse(readFileSync("./package.json"));

export default function logErrorToDiscord(errorUUID, errorObject) {
    const { client, interaction, error, command } = errorObject;

    client.channels.cache.get((process.env.DEV ? process.env.DEV_LOG_CHANNEL : process.env.LOG_CHANNEL)).send({
        content: `<@755269122597585018>\nThere's an error occurred in guild \`${interaction.guild.name}\``,
        embeds: [{
            color: parseInt("ff0000", 16),
            title: `Error \`${errorUUID}\``,
            fields: [
                {
                    name: "\u200b",
                    value: "**Guild**",
                    inline: false
                },
                {
                    name: "Name",
                    value: `\`${interaction.guild.name}\``,
                    inline: true
                },
                {
                    name: "ID",
                    value: `\`${interaction.guildId}\``,
                    inline: true
                },
                {
                    name: "\u200b",
                    value: "**Channel**",
                    inline: false
                },
                {
                    name: "Name",
                    value: `\`${interaction.channel.name}\``,
                    inline: true
                },
                {
                    name: "ID",
                    value: `\`${interaction.channelId}\``,
                    inline: true
                },
                {
                    name: "\u200b",
                    value: "**Command**",
                    inline: false
                },
                {
                    name: "Name",
                    value: "```\n" + command.name + "\n```",
                    inline: true
                },
                (command.subcommand ? {
                    name: "Subcommand",
                    value: "```\n" + command.subcommand + "\n```",
                    inline: true
                } : null),
                (command.options[0] ? {
                    name: "Options",
                    value: "```\n" + command.options.map(option => JSON.stringify(option, null, 4)).join(",\n") + "\n```",
                    inline: true
                } : null),
                {
                    name: "Full error",
                    value: "```\n" + error + "\n```",
                    inline: false
                },
            ].filter(obj => obj),
            footer: {
                text: `Bot V ${packageJSON.version}`
            },
            timestamp: new Date(),
        }]
    });
}