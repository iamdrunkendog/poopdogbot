const {
  Client,
  Intents,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} = require("discord.js");
const config = require("./config.json");
const request = require("request");
const cheerio = require("cheerio");
const iconv = require("iconv");
const moment = require("moment");
const wait = require("util").promisify(setTimeout);

let alive = true;

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
  if (message.channel.name === "인력사무소테스트" && alive) {
    const buttonRowLostArk = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("DPS_REQUEST")
          .setLabel("딜러로 참여")
          .setStyle("DANGER")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("SUPPORT_REQUEST")
          .setLabel("서포터로 참여")
          .setStyle("SUCCESS")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("ANY_REQUEST")
          .setLabel("역할 무관")
          .setStyle("PRIMARY")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("I_AM_OUT")
          .setLabel("참여 취소하기")
          .setStyle("SECONDARY")
      );

    const firstRow = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("CREATE_PARTY")
          .setLabel("파티 모집하기")
          .setStyle("PRIMARY")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("DISMISS")
          .setLabel("안할래요")
          .setStyle("SECONDARY")
      );

    const collector = message.channel
      .createMessageComponentCollector()
      .on("collect", async (i) => {
        try {
          const username = i.member.nickname;
          const getPartyMembers = (text) => {
            let lines = text.split("\n");
            let members = [];
            for (let line of lines) {
              let memberText = line.split(":")[1].trim();
              if (!memberText) {
                members.push([]);
                continue;
              } else if (memberText.indexOf(",") < 0) {
                members.push([memberText]);
                continue;
              } else {
                let list = [];
                for (let member of memberText.split(",")) {
                  list.push(member.trim());
                }
                members.push(list);
                continue;
              }
            }
            return members;
          };
          if (i.customId === "DPS_REQUEST") {
            await i.deferUpdate();
            await wait(1000);
            let [dps, heal, any] = await getPartyMembers(i.message.content);
            if (dps.indexOf(username) > -1) {
              return;
            }
            if (heal.indexOf(username) > -1) {
              heal.splice(heal.indexOf(username), 1);
            }
            if (any.indexOf(username) > -1) {
              any.splice(any.indexOf(username), 1);
            }
            dps.push(username);
            const content = `딜러(${dps.length}명) : ${dps.toString()}\n서폿(${
              heal.length
            }명) : ${heal.toString()}\n무관(${
              any.length
            }명) : ${any.toString()}`;
            console.log(content);
            await i.editReply({
              content: content,
            });
          }
          if (i.customId === "SUPPORT_REQUEST") {
            await i.deferUpdate();
            await wait(1000);
            let [dps, heal, any] = await getPartyMembers(i.message.content);

            if (heal.indexOf(username) > -1) {
              return;
            }
            if (dps.indexOf(username) > -1) {
              dps.splice(dps.indexOf(username), 1);
            }
            if (any.indexOf(username) > -1) {
              any.splice(any.indexOf(username), 1);
            }
            heal.push(username);
            const content = `딜러(${dps.length}명) : ${dps.toString()}\n서폿(${
              heal.length
            }명) : ${heal.toString()}\n무관(${
              any.length
            }명) : ${any.toString()}`;
            console.log(content);
            await i.editReply({
              content: content,
            });
          }
          if (i.customId === "ANY_REQUEST") {
            await i.deferUpdate();
            await wait(1000);
            let [dps, heal, any] = await getPartyMembers(i.message.content);
            if (any.indexOf(username) > -1) {
              return;
            }
            if (heal.indexOf(username) > -1) {
              heal.splice(heal.indexOf(username), 1);
            }
            if (dps.indexOf(username) > -1) {
              dps.splice(dps.indexOf(username), 1);
            }
            any.push(username);
            const content = `딜러(${dps.length}명) : ${dps.toString()}\n서폿(${
              heal.length
            }명) : ${heal.toString()}\n무관(${
              any.length
            }명) : ${any.toString()}`;
            console.log(content);
            await i.editReply({
              content: content,
            });
          }
          if (i.customId === "I_AM_OUT") {
            await i.deferUpdate();
            await wait(1000);
            let [dps, heal, any] = await getPartyMembers(i.message.content);
            if (any.indexOf(username) > -1) {
              any.splice(any.indexOf(username), 1);
            }
            if (heal.indexOf(username) > -1) {
              heal.splice(heal.indexOf(username), 1);
            }
            if (dps.indexOf(username) > -1) {
              dps.splice(dps.indexOf(username), 1);
            }

            const content = `딜러(${dps.length}명) : ${dps.toString()}\n서폿(${
              heal.length
            }명) : ${heal.toString()}\n무관(${
              any.length
            }명) : ${any.toString()}`;
            console.log(content);
            await i.editReply({
              content: content,
            });
          }
          if (i.customId === "DISMISS") {
            await i.deferUpdate();
            await wait(1000);
            await i.deleteReply();
          }
          if (i.customId === "CREATE_PARTY") {
            await i.deferUpdate();
            await wait(1000);
            await i.message.startThread({
              name: `${i.member.nickname}-님의-구인-공고`,
              autoArchiveDuration: 60,
            });
            await i.editReply({
              content: "딜러(0명) : \n서폿(0명) : \n무관(0명) : ",
              components: [buttonRowLostArk],
            });
          }
        } catch (e) {
          console.log(e);
        }
        // console.log(i);
      });
    // console.log(collector);
    // collector.on("collect", async (i) => {
    //   console.log(i);
    //   if (i.customID === "DPS") {
    //     await i.editReply({ content: "딜러클릭" });
    //   }
    // });

    const username = message.member.nickname;
    const partyEmbed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("구인 공고")
      .setDescription(message.content)
      .setAuthor(username, message.author.avatarURL());

    message.reply({
      components: [firstRow],
      content: "이 내용으로 파티를 모집할까요?",
      embeds: [partyEmbed],
    });
    return;
  }

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
        return;
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

        return;
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
      return;
      // } else if (command === "정보") {
      // await getCharInfo(args[1], message);
      // } else if (command === "모험섬") {
      //   await getIslands(message);
    } else if (command === "죽어") {
      message.reply("으악");
      alive = false;
      return;
    } else if (command === "돌아와") {
      message.reply("하이");
      alive = true;
    } else {
      message.reply("뭐래");
      return;
    }
  }
});

client.login(config.BOT_TOKEN);

// const getIslands = async (message) => {
//   await request(
//     {
//       url: "https://loawa.com/main",
//       headers: { "User-Agent": "Mozilla/5.0" },
//     },
//     async (error, response, body) => {
//       if (error) {
//         console.error(error);
//       } else {
//         if (response.statusCode === 200) {
//           const $ = cheerio.load(body);
//           let islands = [];
//           islands[0] = {
//             name: await $(
//               "body > div:nth-child(6) > div > div.col-lg-6.col-md-8.col-xl-6.pl-0.pr-0 > div:nth-child(3) > div.row.pl-1.pr-1.pt-0.pb-0.m-0.justify-content-md-center > div:nth-child(1) > p > strong"
//             ).text(),
//             reward: await $(
//               "body > div:nth-child(6) > div > div.col-lg-6.col-md-8.col-xl-6.pl-0.pr-0 > div:nth-child(3) > div.row.pl-1.pr-1.pt-0.pb-0.m-0.justify-content-md-center > div:nth-child(1) > p > span > strong"
//             ).text(),
//           };
//           islands[1] = {
//             name: await $(
//               "body > div:nth-child(6) > div > div.col-lg-6.col-md-8.col-xl-6.pl-0.pr-0 > div:nth-child(3) > div.row.pl-1.pr-1.pt-0.pb-0.m-0.justify-content-md-center > div:nth-child(2) > p > strong"
//             ).text(),
//             reward: await $(
//               "body > div:nth-child(6) > div > div.col-lg-6.col-md-8.col-xl-6.pl-0.pr-0 > div:nth-child(3) > div.row.pl-1.pr-1.pt-0.pb-0.m-0.justify-content-md-center > div:nth-child(2) > p > span > strong"
//             ).text(),
//           };
//           islands[2] = {
//             name: await $(
//               "body > div:nth-child(6) > div > div.col-lg-6.col-md-8.col-xl-6.pl-0.pr-0 > div:nth-child(3) > div.row.pl-1.pr-1.pt-0.pb-0.m-0.justify-content-md-center > div:nth-child(3) > p > strong"
//             ).text(),
//             reward: await $(
//               "body > div:nth-child(6) > div > div.col-lg-6.col-md-8.col-xl-6.pl-0.pr-0 > div:nth-child(3) > div.row.pl-1.pr-1.pt-0.pb-0.m-0.justify-content-md-center > div:nth-child(3) > p > span > strong"
//             ).text(),
//           };
//           let answerText = `[${moment().format("YYYY년 MM월 DD일")} 모험섬]\n`;
//           for (let i = 0; i < islands.length; i++) {
//             answerText =
//               answerText + `${islands[i].name} : ${islands[i].reward}`;
//             if (i !== islands.length - 1) {
//               answerText += "\n";
//             }
//           }
//           message.reply(answerText);
//         }
//       }
//     }
//   );
// };
