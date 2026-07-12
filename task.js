class Task {

    constructor(page) {
        
        this.name 
        = page.properties["名前"].title[0].plain_text;
        
        this.status
        = page.properties["状態"].status.name;

        this.requiredPeople
        = page.properties["必要人数"].number;

        this.currentPeople
        = page.properties["現在人数"].number;

        this.deadline
        = page.properties["期限"].date?.start ?? null;

        this.discordMessageId = 
            page.properties["DiscordMessageId"]
            .rich_text[0]?.plain_text ?? null;
    }

    toString(){
    return `📋${this.name}`
    + `\n状態: ${this.status　?? "未設定"}`
    + `\n必要人数: ${this.requiredPeople ?? "未設定"}`
    + `\n現在人数: ${this.currentPeople ??"未設定"}`
    + `\n期限: ${this.deadline ?? "未設定"}`;
    }

    isSent(){
        return this.discordMessageId !== null;
    }

}

module.exports = Task;

