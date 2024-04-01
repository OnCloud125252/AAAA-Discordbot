import { SlashCommandBuilder } from "discord.js";
import axios from "axios";

import isDevEnvironment from "../../_modules/isDevEnvironment/index.js";


export default {
  data: new SlashCommandBuilder()
    .setName("ipinfo")
    .setDescription("Lookup info for IPv4 address")
    .addStringOption((option) =>
      option.setName("ip").setDescription("IPv4 address").setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("zoom")
        .setDescription("Adjusts the scale of the map, default is 12")
        .setRequired(false)
    ),
  async execute(client, interaction, version) {
    const ipAddress = interaction.options.getString("ip");
    const zoom = interaction.options.getNumber("zoom") ?? 12;
    const validIpAddress = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(
      ipAddress
    );

    if (validIpAddress) {
      await interaction.reply({
        embeds: [
          {
            color: parseInt("ffff00", 16),
            title: `Looking up ip address \`${ipAddress}\` . . .`,
            footer: {
              text: `Bot V ${version}`
            },
            timestamp: new Date()
          }
        ]
      });

      const ipinfoResponse = await axios.get(`https://ipinfo.io/${ipAddress}`, {
        params: {
          token: isDevEnvironment
            ? process.env.DEV_IPINFO_TOKEN
            : process.env.IPINFO_TOKEN
        }
      });

      if (ipinfoResponse.data.bogon) {
        await interaction.editReply({
          embeds: [
            {
              color: parseInt("ff0000", 16),
              title: `The IP address \`${ipAddress}\` is a bogon IP`,
              footer: {
                text: `Bot V ${version}`
              },
              timestamp: new Date()
            }
          ]
        });
      }
      else {
        const mapResponse = await axios.get(
          "https://maptoolkit.p.rapidapi.com/staticmap",
          {
            params: {
              center: ipinfoResponse.data.loc,
              zoom: zoom.toString(),
              size: "1000x1000",
              maptype: "toursprung-terrain",
              format: "png",
              factor: "1",
              marker: `center:${ipinfoResponse.data.loc}|icon:https://i.ibb.co/GF7SFHj/map-marker-128.png|shadow:false`
            },
            headers: {
              "X-RapidAPI-Key": isDevEnvironment
                ? process.env.DEV_X_RapidAPI_Key
                : process.env.X_RapidAPI_Key,
              "X-RapidAPI-Host": "maptoolkit.p.rapidapi.com"
            },
            responseType: "arraybuffer"
          }
        );
        const imageBuffer = Buffer.from(mapResponse.data, "binary");
        const imageMessage = await client.channels.cache
          .get("874654634533343232")
          .send({
            files: [imageBuffer]
          });

        await interaction.editReply({
          embeds: [
            {
              color: parseInt("036bfc", 16),
              title: `Info for \`${ipAddress}\``,
              fields: [
                {
                  name: "Hostname",
                  value: `\`${ipinfoResponse.data.hostname}\``,
                  inline: false
                },
                {
                  name: "Organization",
                  value: `\`${ipinfoResponse.data.org}\``,
                  inline: false
                },
                {
                  name: "City",
                  value: `\`${ipinfoResponse.data.city}\``,
                  inline: false
                },
                {
                  name: "Region",
                  value: `\`${ipinfoResponse.data.region}\``,
                  inline: false
                },
                {
                  name: "Country",
                  value: `\`${ipinfoResponse.data.country}\``,
                  inline: false
                },
                {
                  name: "Timezone",
                  value: `\`${ipinfoResponse.data.timezone}\``,
                  inline: false
                },
                {
                  name: "Location",
                  value: `\`${ipinfoResponse.data.loc}\``,
                  inline: false
                }
              ],
              image: {
                url: imageMessage.attachments.first().url
              },
              footer: {
                text: `Bot V ${version}`
              },
              timestamp: new Date()
            }
          ]
        });
      }
    }
    else {
      await interaction.reply({
        embeds: [
          {
            color: parseInt("ff0000", 16),
            title: `IP address \`${ipAddress.replace(
              /`/g,
              "\\`"
            )}\` is invalid `,
            footer: {
              text: `Bot V ${version}`
            },
            timestamp: new Date()
          }
        ]
      });
    }
  }
};
