const { Client, Intents } = require("discord.js");
const config = require("./config.json");
const request = require("request");
const cheerio = require("cheerio");
const iconv = require("iconv");
const moment = require("moment");

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

const getIslands = async (message) => {
  await request(
    {
      url: "https://loawa.com/main",
      headers: { "User-Agent": "Mozilla/5.0" },
    },
    async (error, response, body) => {
      if (error) {
        console.error(error);
      } else {
        if (response.statusCode === 200) {
          const $ = cheerio.load(body);
          let islands = [];
          islands[0] = {
            name: await $(
              "body > div:nth-child(6) > div > div.col-lg-6.col-md-8.col-xl-6.pl-0.pr-0 > div:nth-child(3) > div.row.pl-1.pr-1.pt-0.pb-0.m-0.justify-content-md-center > div:nth-child(1) > p > strong"
            ).text(),
            reward: await $(
              "body > div:nth-child(6) > div > div.col-lg-6.col-md-8.col-xl-6.pl-0.pr-0 > div:nth-child(3) > div.row.pl-1.pr-1.pt-0.pb-0.m-0.justify-content-md-center > div:nth-child(1) > p > span > strong"
            ).text(),
          };
          islands[1] = {
            name: await $(
              "body > div:nth-child(6) > div > div.col-lg-6.col-md-8.col-xl-6.pl-0.pr-0 > div:nth-child(3) > div.row.pl-1.pr-1.pt-0.pb-0.m-0.justify-content-md-center > div:nth-child(2) > p > strong"
            ).text(),
            reward: await $(
              "body > div:nth-child(6) > div > div.col-lg-6.col-md-8.col-xl-6.pl-0.pr-0 > div:nth-child(3) > div.row.pl-1.pr-1.pt-0.pb-0.m-0.justify-content-md-center > div:nth-child(2) > p > span > strong"
            ).text(),
          };
          islands[2] = {
            name: await $(
              "body > div:nth-child(6) > div > div.col-lg-6.col-md-8.col-xl-6.pl-0.pr-0 > div:nth-child(3) > div.row.pl-1.pr-1.pt-0.pb-0.m-0.justify-content-md-center > div:nth-child(3) > p > strong"
            ).text(),
            reward: await $(
              "body > div:nth-child(6) > div > div.col-lg-6.col-md-8.col-xl-6.pl-0.pr-0 > div:nth-child(3) > div.row.pl-1.pr-1.pt-0.pb-0.m-0.justify-content-md-center > div:nth-child(3) > p > span > strong"
            ).text(),
          };
          let answerText = `[${moment().format("YYYY년 MM월 DD일")} 모험섬]\n`;
          for (let i = 0; i < islands.length; i++) {
            answerText =
              answerText + `${islands[i].name} : ${islands[i].reward}`;
            if (i !== islands.length - 1) {
              answerText += "\n";
            }
          }
          message.reply(answerText);
        }
      }
    }
  );
};

client.on("messageCreate", async (message) => {
  if (message.author.bot) return false;
  console.log(`Message from ${message.author.username}: ${message.content}`);
  if (message.content === prefix) {
    message.reply("왜");
    return;
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
        const eightMin = parseInt((price * 0.83125) / 1.1);
        const eightMax = parseInt(price * 0.83125);
        //0.7125 0.65
        const fourMin = parseInt((price * 0.7125) / 1.1);
        const fourMax = parseInt(price * 0.7125);
        message.reply(
          `[최적 경매 가격]\n4인 : ${fourMin} ~ ${fourMax}\n8인 : ${eightMin} ~ ${eightMax}\n * 범위 안의 가격 입찰시 다음 입찰자는 무조건 손해\n * 범위보다 낮은 가격 입찰시 다음 입찰자는 이득\n * 범위보다 큰 가격 입찰시 호구`
        );
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
          `[균등 분배]\n4인 : ${four}\n8인 : ${eight}\n * 수수료를 고려한 균등 분배가격\n * 사서 파는사람 귀찮음 주의`
        );
      }
    } else if (command === "정보") {
      await getCharInfo(args[1], message);
    } else if (command === "모험섬") {
      await getIslands(message);
    } else {
      message.reply("뭐래");
    }
  }
});

client.login(config.BOT_TOKEN);
