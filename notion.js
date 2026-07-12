const axios = require("axios");
const CONFIG = require("./config");

class NotionAPI {

    constructor() {
        this.token = CONFIG.NOTION_TOKEN;
        this.databaseId = CONFIG.TASK_DATABASE_ID;
    }

    
    async getTasks() {
        const today = new Date()
        const formattedDate =  today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

        console.log("今日" + formattedDate + "のタスク一覧を送信します");

        const response = await axios.post(

            `https://api.notion.com/v1/databases/${this.databaseId}/query`,

            {
                filter:{
                    "property":"取り組み予定日時",
                    "date":{
                        "equals": formattedDate
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

    async updateDiscordMessageId(pageId,messageId){
        await axios.patch(
            `https://api.notion.com/v1/pages/${pageId}`,
            {
                properties:{
                    DiscordMessageId:{
                        rich_text:[
                            {
                                text:{
                                    content:messageId
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

        console.log("Notion更新成功");
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
                    "DiscordchannelId":{
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
}

module.exports = NotionAPI;