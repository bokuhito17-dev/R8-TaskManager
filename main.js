const NotionAPI = require("./notion");
const DiscordAPI = require("./discord");
const Task = require("./task");
const CONFIG = require("./config");

const DEBUG = true;

const today = new Date()
const formattedDate = today.getFullYear() + "年" + String(today.getMonth() + 1).padStart(2, "0") + "月" + String(today.getDate()).padStart(2, "0")+ "日";
    

async function morningReminder() {//トリガーは毎日7:00に設定
    const notion = new NotionAPI();
    const discord = new DiscordAPI();

    const tasks = await notion.getTasks(formattedDate);
    console.log("取得件数:", tasks.results.length);

    await discord.sendMessage(CONFIG.CHANNEL_ID, "7:00です。今日" + formattedDate + "のタスク一覧を、各部門チャンネルに送信します");
    
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

async function participantsUpdate(){//トリガーは毎５分に設定
    const notion = new NotionAPI();
    const discord = new DiscordAPI();
    const notifications = await notion.getDiscordNortifications();
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

async function checkTaskALert(){ // トリガーは毎分に設定
    const notion = new NotionAPI();
    const discord = new DiscordAPI();
    const now = new Date();

    const tasks = await notion.getTasks(formattedDate);
    console.log("取得件数:", tasks.results.length);

    for (const page of tasks.results) {
        const task = new Task(page);

        for (const department of page.properties["部門"].relation) {
            const departmentPage = await notion.getDepartment(department.id);
            const channelId = departmentPage.properties["DiscordChannelId"].rich_text[0]?.plain_text;
                
            const startTime = new Date(page.properties["取り組み予定日時"].date.start);
            const diff = startTime -now;
            const diffMinutes = diff/(1000*60); 

            const is15 = diffMinutes <= 15 && diffMinutes >= 14;
            const is5 = diffMinutes <= 5 && diffMinutes >= 4;

            if (is15 ||  is5) {
                await discord.sendMessage(channelId, "⚠️間もなく開始⚠️\n" + task.toString() + "\n" + Math.round(diffMinutes) + "分後に開始予定");

            if (DEBUG) {console.log(task.toString());}
            }
        }
    }
}
async function eveningReminder(){
    const notion = new NotionAPI();
    const discord = new DiscordAPI();

    const tasks = await notion.getTasks(formattedDate);
    console.log("取得件数:", tasks.results.length);

    await discord.sendMessage(CONFIG.CHANNEL_ID, "19:00です。今日" + formattedDate + "に予定されていたものの未完了のタスク一覧を、各部門チャンネルに送信します");
    
    for (const page of tasks.results) {
        const task = new Task(page);

        for (const department of page.properties["部門"].relation) {

            const departmentPage = await notion.getDepartment(department.id);

            const channelId = departmentPage.properties["DiscordChannelId"].rich_text[0]?.plain_text;
        
            const message = await discord.sendMessage(channelId,task.toString());

            if (DEBUG) {console.log(task.toString());}
        }
    }

    const notifications = await notion.getDiscordNortifications();
    for (const notification of notifications.results) {
        await notion.deleteDiscordNortification(notification.id);
    }
}

async function main() {
    await participantsUpdate();
}

main();

