const axios = require("axios");
const CONFIG = require("./config");

class NotionAPI {

    constructor() {
        this.token = CONFIG.NOTION_TOKEN;
        this.databaseId = CONFIG.TASK_DATABASE_ID;
        this.notificationDatabaseId = CONFIG.NOTIFICATION_DATABASE_ID;
        this.userdatabaseId = CONFIG.USER_DATABASE_ID
    }

    async getTasks(formattedDate) {
        const response = await axios.post(

            `https://api.notion.com/v1/databases/${this.databaseId}/query`,

            {
                filter:{
                    and:[
                {
                    "property":"取り組み予定日時",
                    "date":{
                        "equals": formattedDate
                    }
                },
                {
                    "property": "状態",
                    "status": {
                    "equals": "未完了"
                    }
                }
                ]
            }
            },

            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Notion-Version": "2022-06-28",
                    "Content-Type": "application/json"
                }
            }

        );

        return response.data;

    }

    async getDepartment(departmentId){
        const response = await axios.get(
            `https://api.notion.com/v1/pages/${departmentId}`,
            {
                headers:{
                    Authorization: `Bearer ${this.token}`,
                    "Notion-Version": "2022-06-28",
                    "Content-Type": "application/json"
                }
            }
        )
        return response.data;
        
    }

    async createDiscordNotification(data){
        const response = await axios.post(
            `https://api.notion.com/v1/pages`,
            {
                parent:{
                    database_id: CONFIG.NOTIFICATION_DATABASE_ID
                },
                properties:{
                    "通知名":{
                        title:[
                            {
                                text:{
                                    content:data.name
                                }
                            }
                        ]
                    },
                    "DiscordChannelId":{
                        rich_text:[
                            {
                                text:{
                                    content:data.channelId
                                }
                            }
                        ]
                    },
                    "DiscordMessageId":{
                        rich_text:[
                            {
                                text:{
                                    content:data.messageId
                                }
                            }
                        ]
                    },
                    "TaskPageId":{
                        rich_text:[
                            {
                                text:{
                                    content:data.taskPageId
                                }
                            }
                        ]
                    }
                }
            },
            {
                headers:{
                    Authorization:`Bearer ${this.token}`,
                    "Notion-Version":"2022-06-28",
                    "Content-Type":"application/json"
                }
            }
        )
    return response.data;
    }

    async getDiscordNotifications(){
        const response = await axios.post(
           `https://api.notion.com/v1/databases/${this.notificationDatabaseId}/query`,
            {},
            {
                headers:{
                    Authorization:`Bearer ${this.token}`,
                    "Notion-Version":"2022-06-28",
                    "Content-Type":"application/json" 
                }
            }
        )
        return response.data;
    }

    async updateNotificationParticipantCount(pageId, count){
        const response = await axios.patch(
            `https://api.notion.com/v1/pages/${pageId}`,
            {
                properties:{
                    "参加人数":{
                                number:count                    
                    }
                }
            },
            {
                headers:{
                    Authorization:`Bearer ${this.token}`,
                    "Notion-Version":"2022-06-28",
                    "Content-Type":"application/json" 
                }
            }

                )
    }
    
    async updateTaskCurrentCount(pageId, count){
        const response = await axios.patch(
            `https://api.notion.com/v1/pages/${pageId}`,
            {
                properties:{
                    "現在人数":{
                        number:count
                    }
                }
            },
            {
                headers:{
                    Authorization:`Bearer ${this.token}`,
                    "Notion-Version":"2022-06-28",
                    "Content-Type":"application/json"
                }
            }
        )
    }

    async getDiscordUsers(userId){
        const response = await axios.post(
            `https://api.notion.com/v1/databases/${this.userdatabaseId}/query`,
            {
                filter: {
                    property: "DiscordUserId",
                    rich_text: {
                        equals: userId
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Notion-Version": "2022-06-28",
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;
    }

   async addParticipantsinTaskDatabase(pageId, userIds) {
    try {

        console.log("pageId:", pageId);
        console.log("userIds:", userIds);

        const response = await axios.patch(
            `https://api.notion.com/v1/pages/${pageId}`,
            {
                properties: {
                    "参加者": {
                        relation: userIds.map(id => ({
                            id: id
                        }))
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Notion-Version": "2022-06-28",
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (err) {

        console.log(err.response?.data);

        throw err;
    }
}
    async removeAvailableDate(userPageId, todayString){
        // Fetch the page to get current multi_select values
        const resp = await axios.get(
            `https://api.notion.com/v1/pages/${userPageId}`,
            {
                headers: {
                    Authorization: `Bearer ${CONFIG.NOTION_TOKEN}`,
                    "Notion-Version": "2022-06-28"
                }
            }
        );

        const user = resp.data;
        const dates = user.properties["来れる日"].multi_select || [];
        const newDates = dates.filter(date => date.name !== todayString);

        await axios.patch(
            `https://api.notion.com/v1/pages/${userPageId}`,
            {
                properties:{
                    "来れる日":{
                        multi_select: newDates.map(date => ({ name: date.name }))
                    }
                }
            },
            {
                headers:{
                    Authorization:`Bearer ${CONFIG.NOTION_TOKEN}`,
                    "Notion-Version":"2022-06-28",
                    "Content-Type":"application/json"
                }
            }
        );
    }
    async getUserAvailable (pageId){
    const response = await axios.get(
        `https://api.notion.com/v1/pages/${pageId}`,
        {
            headers:{
                Authorization:`Bearer ${this.token}`,
                "Notion-Version":"2022-06-28",
                "Content-Type":"application/json"
            }
        }
    );

    return response.data;
}

    async deleteDiscordNotification(pageId){
        const response = await axios.patch(
            `https://api.notion.com/v1/pages/${pageId}`,
            {
                archived:true
            },
            {
                headers:{
                    Authorization: `Bearer ${this.token}`,
                    "Notion-Version":"2022-06-28",
                    "Content-Type":"application/json"
                }
            }
        );
        return response.data;
    }
}
module.exports = NotionAPI;
