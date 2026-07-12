const axios = require("axios");
const CONFIG = require("./config");

class DiscordAPI {

    constructor() {
        this.token = CONFIG.DISCORD_TOKEN;
    }

    async sendMessage(channelId, message) {

        try {

            const response = await axios.post(

                `https://discord.com/api/v10/channels/${channelId}/messages`,

                {
                    content: message
                },

                {
                    headers: {
                        Authorization: `Bot ${this.token}`
                    }
                }

            );

            console.log("送信成功");
            return response.data;

        } catch (error) {

            console.error("送信失敗");

            if (error.response) {
                console.error(error.response.status);
                console.error(error.response.data);
            } else {
                console.error(error.message);
            }

        }

    }

    async getMessage(channelId, messageId) {

    const response = await axios.get(
        `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
        {
            headers: {
                Authorization: `Bot ${this.token}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
    }

    async getReactionCount(channelId, messageId, emojiName) {

    const message = await this.getMessage(channelId, messageId);

    if (!message.reactions) {
        return 0;
    }

    for (const reaction of message.reactions) {

        if (reaction.emoji.name === emojiName) {
            return reaction.count;
        }

    }

    return 0;
    }

}

module.exports = DiscordAPI;