const axios = require("axios");
const CONFIG = require("./config");

class NotionAPI {

    constructor() {
        this.token = CONFIG.NOTION_TOKEN;
        this.databaseId = CONFIG.TASK_DATABASE_ID;
        this.notificationDatabaseId = CONFIG.NOTIFICATION_DATABASE_ID;
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

    async deleteDiscordNortifications(pageId){
        const response = await axios.patch(
            `https://api.notion.com/v1/pages/${pageId}`,
            {
                data:{
                    archived:true
                },
                headers:{
                    Authorization: `Bearer ${this.token}`,
                    "Notion-Version":"2022-06-28",
                    "Content-Type":"application/json"   
                } 
            }
        )
    }
}
module.exports = NotionAPI;