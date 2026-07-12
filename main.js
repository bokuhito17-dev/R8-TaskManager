const NotionAPI = require("./notion");
const DiscordAPI = require("./discord");
const CONFIG = require("./config");
const Task = require("./task");

const DEBUG = true;

async function main() {
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

            const channelId = departmentPage.properties["DiscordchannelId"].rich_text[0]?.plain_text;
        
            /*if (task.isSent()) {
                console.log(`${task.name} は送信済みなのでスキップ`);
                continue;
            }*/

            const message = await discord.sendMessage(channelId,task.toString());

            /*await notion.updateDiscordMessageId(page.id,message.id);
            */
            await notion.createDiscordNotification({

                name:task.name,

                channelId:channelId,

                messageId:message.id

            });

            if (DEBUG) {
                console.log(task.toString());
            }


        }
    }
}
main();

