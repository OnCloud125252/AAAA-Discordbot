import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import WBmanager from "../../_modules/WBmanager/index.js";


const manager = new WBmanager();

export default {
    data: new SlashCommandBuilder()
        .setName("kd")
        .setDescription("Display Warbrokers KD data for user")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("The target user you want to look at")
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option
                .setName("visible")
                .setDescription("Response message visibility, default is false")
                .setRequired(false)
        ),
    async execute(client, interaction, version) {
        const authorID = interaction.options.getUser("target")?.id ?? interaction.user.id;
        const responseMessageVisibility = !(interaction.options.getBoolean("visible") ?? false);

        await interaction.reply({
            embeds: [{
                color: parseInt("ffff00", 16),
                title: "This might take a few seconds . . .",
                footer: {
                    text: `Bot V ${version}`
                },
                timestamp: new Date(),
            }],
            ephemeral: responseMessageVisibility
        });

        const playerDetailsObj = await manager.getPlayerDetails(authorID);
        if (!playerDetailsObj.error) {
            const statsRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel(`${playerDetailsObj.gameName} 的完整資訊面板`)
                        .setURL(`https://stats.warbrokers.io/players/i/${playerDetailsObj.gameID}`)
                        .setStyle(ButtonStyle.Link)
                );

            await interaction.editReply({
                embeds: [{
                    color: parseInt("fccbcb", 16),
                    title: `玩家名稱 : ${playerDetailsObj.gameName}`,
                    description: `小隊 : **${playerDetailsObj.squad}**`,
                    fields: [
                        {
                            name: `您的 KD 值 : \`${playerDetailsObj.rounded_currentKD}\``,
                            value: `您需要 \`${playerDetailsObj.rounded_neededKills}\` 次擊殺來增加 KD 值\n您可以在 KD 值下降之前死亡 \`${playerDetailsObj.rounded_neededDeaths}\` 次`,
                            inline: true
                        },
                        {
                            name: "目前狀況",
                            value: `總擊殺次數 : \`${playerDetailsObj.kills}\`\n總死亡次數 : \`${playerDetailsObj.deaths}\``,
                        },
                        {
                            name: `等級 : ${playerDetailsObj.level}`,
                            value: `\`[${playerDetailsObj.levelProgressBar}]\` ${playerDetailsObj.levelProgress}%`,
                        },
                    ],
                    footer: {
                        text: `Bot V ${version}`
                    },
                    timestamp: new Date(),
                }],
                components: [statsRow],
                ephemeral: responseMessageVisibility
            });
        }
        else {
            await interaction.editReply({
                embeds: [{
                    color: parseInt("ff0000", 16),
                    title: "Invalid user",
                    footer: {
                        text: `Bot V ${version}`
                    },
                    timestamp: new Date(),
                }],
                ephemeral: responseMessageVisibility
            });
            // await interaction.editReply({
            //     embeds: [{
            //         color: parseInt("ff0000", 16),
            //         title: "***您似乎尚未連結帳號 ?***",
            //         fields: [
            //             {
            //                 name: "**連結方式 :**",
            //                 value: "WBnew <頁面網址>",
            //             },
            //             {
            //                 name: "**舉例 :**",
            //                 value: "`A WB new https://stats.warbrokers.io/players/i/5de3a718bfea714d3b292bcb`",
            //             },
            //             {
            //                 name: "***需要幫助 ?***",
            //                 value: "輸入 `A WB help` 以獲得更多資訊",
            //             }
            //         ],
            //         footer: {
            //             text: `Bot V ${version}`
            //         },
            //         timestamp: new Date(),
            //     }],
            //     ephemeral: responseMessageVisibility
            // });
        }
    }
};