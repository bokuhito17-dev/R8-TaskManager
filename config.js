require("dotenv").config();
const CONFIG = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  CHANNEL_ID: process.env.CHANNEL_ID,
  NOTION_TOKEN: process.env.NOTION_TOKEN,
  TASK_DATABASE_ID: process.env.TASK_DATABASE_ID,
  NOTIFICATION_DATABASE_ID: process.env.NOTIFICATION_DATABASE_ID,
  USER_DATABASE_ID: process.env.USER_DATABASE_ID
};


module.exports = CONFIG;