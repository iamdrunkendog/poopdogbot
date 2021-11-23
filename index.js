const { Client, Intents } = require("discord.js");
const config = require("./config.json");
const request = require("request");
const cheerio = require("cheerio");
const iconv = require("iconv");

const prefix = "똥개야";
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const getCharInfo = async (charName, message) => {
  let charInfo = {};
  await request(
    {
      url: `https://lostark.game.onstove.com/Profile/Character/${encodeURI(
        charName
      )}`,
      method: "GET",
    },
    async (error, response, body) => {
      if (error) {
        console.error("에러");
        return;
      }
      if (response.statusCode === 200) {
        const $ = cheerio.load(body);
        charInfo["itemLevel"] = await $(
          "#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.level-info2 > div.level-info2__item > span:nth-child(2)"
        )
          .text()
          .slice(3);
      }
      message.reply(`템렙 ${charInfo.itemLevel}`);
    }
  );
  return charInfo;
};

client.on("messageCreate", async (message) => {
  if (message.author.bot) return false;
  console.log(`Message from ${message.author.username}: ${message.content}`);
  if (message.content === prefix) {
    message.reply("왜");
  }
  if (message.content.startsWith(prefix)) {
    const commandBody = message.content.slice(prefix.length + 1);
    const args = commandBody.split(" ");
    const command = args[0];
    if (command === "경매") {
      console.log(args[1]);
      const price = parseInt(args[1]);
      if (isNaN(price)) {
        message.reply("똑바로 말해");
      } else {
        //0.83125 0.76
        const eight = parseInt((price * 0.83125) / 1.1);
        //0.7125 0.65
        const four = parseInt((price * 0.7125) / 1.1);
        message.reply(`입찰상한가\n- 4인 ${four}\n- 8인 ${eight}\n`);
      }
    } else if (command === "분배") {
      console.log(args[1]);
      const price = parseInt(args[1]);
      if (isNaN(price)) {
        message.reply("똑바로 말해");
      } else {
        //0.83125 0.76
        const eight = parseInt(price * 0.83125);
        //0.7125 0.65
        const four = parseInt(price * 0.7125);
        message.reply(
          `수수료를 감안한 균등 분배\n- 4인 ${four}\n- 8인 ${eight}\n`
        );
      }
    } else if (command === "정보") {
      await getCharInfo(args[1], message);
    }
  }
});

client.login(config.BOT_TOKEN);
