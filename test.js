const axios = require("axios");

const TOKEN = "MTUyMzMwMjMzMDUwMDY0ODk5MA.GShzM-.m40FYu7M2RCs5jzFabD0eKPVW_1kGHa0OFMeoE";
const CHANNEL_ID = "1523304377652347046";

async function main() {
  try {
    const res = await axios.post(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`,
      {
        content: "VS Codeから送信テスト"
      },
      {
        headers: {
          Authorization: `Bot ${TOKEN}`
        }
      }
    );

    console.log("成功！");
    console.log(res.status);
    console.log(res.data);

  } catch (e) {
    console.log("失敗");
    console.log(e.response?.status);
    console.log(e.response?.data);
  }
}

main();