class Task {

    constructor(page) {
        this.name 
    　　= page.properties["名前"].title?.[0]?.plain_text ?? null;
        
        this.requiredPeople
        = page.properties["必要人数"].number ?? null;

        this.currentPeople
        = page.properties["現在人数"].number ?? null;

        this.deadline
        = page.properties["期限"].date?.start ?? null;

        this.discordMessageId 
        = page.properties["DiscordMessageId"].rich_text?.[0]?.plain_text ?? null;
        
        this.place
        = page.properties["場所"].rich_text?.[0]?.plain_text ?? null;
    }

    toStringmorning(){
    return `📋${this.name}`
    + `\n必要人数: ${this.requiredPeople ?? "未設定"}`
    + `\n現在人数: ${this.currentPeople ??"未設定"}`
    + `\n期限: ${this.deadline ?? "未設定"}`
    + `\n場所: ${this.place ?? "未設定"}`;
    }

    toStringevening(){
    return `📋${this.name}`
    + `\n期限: ${this.deadline ?? "未設定"}`;
    }

    isSent(){
        return this.discordMessageId !== null;
    }

}

module.exports = Task;

