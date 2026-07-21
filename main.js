const NotionAPI = require("./notion");
const DiscordAPI = require("./discord");
const Task = require("./task");
const CONFIG = require("./config");
const axios = require("axios");

const DEBUG = true;

const formattedDate = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Tokyo"
});
    

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
        
            const message = await discord.sendMessage(channelId,"⚠️本日予定のタスク⚠️\n"+ task.toStringmorning());

            await notion.createDiscordNotification({name:task.name, channelId:channelId, messageId:message.id,taskPageId:page.id});

            if (DEBUG) {console.log(task.toStringmorning());}
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function participantsUpdate(){//トリガーは毎５分に設定
    console.log("participants START", new Date().toISOString());
    const notion = new NotionAPI();
    const discord = new DiscordAPI();
    const notifications = await notion.getDiscordNotifications();
    const emoji = "✅";
    
    const totals = {};
    const participants = {};

    for (const notification of notifications.results) {
        const channelId = notification.properties["DiscordChannelId"].rich_text[0]?.plain_text;
        const messageId = notification.properties["DiscordMessageId"].rich_text[0]?.plain_text;
        const reactionCount = await discord.getReactionCount(channelId,messageId,emoji)
        await notion.updateNotificationParticipantCount(notification.id,reactionCount);
        
        const taskPageId = notification.properties["TaskPageId"].rich_text[0]?.plain_text;
        totals[taskPageId] = (totals[taskPageId]||0)+ reactionCount;
        if (!participants[taskPageId]){
            participants[taskPageId] = [];
        }

        await sleep(300);
        
        const users = await discord.getReactionUsers(channelId,messageId,emoji);
        for (const user of users){
            const result = await notion.getDiscordUsers(user.id)
            
            if (result.results.length === 0){
                continue;
            }
            
            const userPageId = result.results[0].id
        
            if(userPageId && !participants[taskPageId].includes(userPageId)){
                participants[taskPageId].push(userPageId);
            }
        }
    }

    for (const taskPageId in totals){
        console.log(taskPageId);
　　　　　console.log(participants[taskPageId]);
        await notion.addParticipantsinTaskDatabase(taskPageId,participants[taskPageId]);
    }
        
    for (const taskPageId in totals){
        await notion.updateTaskCurrentCount(taskPageId, totals[taskPageId]);
    }

const todayString = formattedDate;

const updatedUsers = new Set();

for (const taskPageId in participants) {

    for (const userPageId of participants[taskPageId]) {

        if (updatedUsers.has(userPageId)) continue;

        await notion.removeAvailableDate(userPageId, todayString);

        updatedUsers.add(userPageId);

    }

}
}



async function checkTaskALert(){ // トリガーは毎分に設定
    console.log("participants START", new Date().toISOString());
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

            const dateString = page.properties["取り組み予定日時"].date.start;

            // 時刻が設定されていない場合は通知しない
            if (!dateString.includes("T")) {
                continue;
            }

            const startTime = new Date(dateString);

            const diff = startTime - now;
            const diffMinutes = diff / (1000 * 60);

            const is15 = diffMinutes <= 15 && diffMinutes >= 14;
            const is5 = diffMinutes <= 5 && diffMinutes >= 4;

            if (is15 || is5) {

                if (task.requiredPeople == null) {

                    await discord.sendMessage(
                        channelId,
                        "⚠️間もなく開始⚠️\n"
                        + task.toStringmorning()
                        + "\n"
                        + Math.round(diffMinutes)
                        + "分後に開始予定\n"
                        + "⚠️人員不足状況は不明です（必要人数が設定されていません）"
                    );

                } else if (task.currentPeople < task.requiredPeople) {

                    await discord.sendMessage(
                        channelId,
                        "⚠️間もなく開始⚠️\n"
                        + task.toStringmorning()
                        + "\n"
                        + Math.round(diffMinutes)
                        + "分後に開始予定"
                    );

                }

                if (DEBUG) {
                    console.log(task.toStringmorning());
                }

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
        
            const message = await discord.sendMessage(channelId,"⚠️本日やりきれなかったタスク⚠️\n" + task.toStringevening());

            if (DEBUG) {console.log(task.toStringevening());}
        }
    }

    const notifications = await notion.getDiscordNotifications();
    for (const notification of notifications.results) {
        await notion.deleteDiscordNotification(notification.id);
    }
}

    async function main() {

    const mode = process.argv[2];

    switch(mode){

        case "morning":
            await morningReminder();
            break;

        case "participants":
            await participantsUpdate();
            break;

        case "alert":
            await checkTaskALert();
            break;

        case "evening":
            await eveningReminder();
            break;

        default:
            console.log("使い方:");
            console.log("node main.js morning");
            console.log("node main.js participants");
            console.log("node main.js alert");
            console.log("node main.js evening");
    }

}

main();


