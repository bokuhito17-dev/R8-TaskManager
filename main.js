const NotionAPI = require("./notion");
const DiscordAPI = require("./discord");
const Task = require("./task");
const CONFIG = require("./config");

const DEBUG = true;

async function morningReminder() {
    const notion = new NotionAPI();
    const discord = new DiscordAPI();

    const tasks = await notion.getTasks();
    console.log("取得件数:", tasks.results.length);

    const today = new Date()
    const formattedDate = today.getFullYear() + "年" + String(today.getMonth() + 1).padStart(2, "0") + "月" + String(today.getDate()).padStart(2, "0")+ "日";
    await discord.sendMessage(CONFIG.CHANNEL_ID, "朝7:00です。今日" + formattedDate + "のタスク一覧を、各部門チャンネルに送信します");
    
    for (const page of tasks.results) {
        const task = new Task(page);

        for (const department of page.properties["部門"].relation) {

            const departmentPage = await notion.getDepartment(department.id);

            const channelId = departmentPage.properties["DiscordChannelId"].rich_text[0]?.plain_text;
        
            const message = await discord.sendMessage(channelId,task.toString());

            await notion.createDiscordNotification({name:task.name, channelId:channelId, messageId:message.id,taskPageId:page.id});

            if (DEBUG) {console.log(task.toString());}
        }
    }
}

async function participantsUpdate(){
    const notion = new NotionAPI();
    const discord = new DiscordAPI();
    const notifications = await notion.getDiscordNotifications();
    const emoji = "✅";
    
    const totals = {};

    for (const notification of notifications.results) {
        const channelId = notification.properties["DiscordChannelId"].rich_text[0]?.plain_text;
        const messageId = notification.properties["DiscordMessageId"].rich_text[0]?.plain_text;
        const reactionCount = await discord.getReactionCount(channelId,messageId,emoji)
        await notion.updateNotificationParticipantCount(notification.id,reactionCount);
        const taskPageId = notification.properties["TaskPageId"].rich_text[0]?.plain_text;
        totals[taskPageId] = (totals[taskPageId]||0)+ reactionCount;
    }

    console.log(totals);

    for (const taskPageId in totals){
        await notion.updateTaskCurrentCount(taskPageId, totals[taskPageId]);
    }

}

async function checkTaskALert(){

}
async function eveningReminder(){

}

async function clearDiscordNotificaitons(){

}

async function main() {
    await participantsUpdate();
}

main();

