import TelegramBot from 'node-telegram-bot-api';
import { flag, Matches } from './matches.js';
import config from '../config.json';
import { StateTracker } from './state-mgmt.js';

function normalize(promisy) {
    return function (a,b,c,d) {
        promisy(a,b,c,d).catch((err) => console.error(err));
    }
}
let matches = new Matches();
const bot = new TelegramBot(config.token, {polling: true});

let msgs = [];
let state = new StateTracker(matches);

state.addTracker(async function () {
    for (let [fifa_id,msg] of msgs) {
        try {
            let match = matches.match(fifa_id);
            let text = matches.convert(match);
            if (msg.text === text) return; // message already exists, dont update it
            msg.text = text;
            await bot.editMessageText(text, { message_id : msg.message_id, chat_id : msg.chat.id, parse_mode : 'Markdown' });
        } catch (err) {
            console.error(err);
        }
    }
});

bot.onText(/\/track[ ]+(.+)/, normalize(async (msg, param) => {

  const chatId = msg.chat.id;
  const fifa_id = param[1];
  let match = matches.match(fifa_id);
  if (!match) {
      await bot.sendMessage(chatId, "Match not found, try /matches");
      return;
  }
  
  let cmsg = await bot.sendMessage(chatId, matches.convert(match), { parse_mode : 'Markdown' });
  msgs.push([fifa_id, cmsg]);
  
}));
bot.onText(/\/matches[ ]*/, normalize(async function (msg) {
    let s = "";
    for (let match of matches.list_matches()) {
        if (match.status == 'future') {
            s += `[${match.fifa_id}] ${flag(match.home_team.code)} ${match.home_team.country} - ${match.away_team.country} ${flag(match.away_team.code)}\n`;
        } else {
            s += `[${match.fifa_id}] ${flag(match.home_team.code)} ${match.home_team.country} ${match.home_team.goals} - ${match.away_team.goals} ${match.away_team.country} ${flag(match.away_team.code)}\n`;
        }
    }
    if (s === "") {
        s = "Loading match info, try again later...";
    }
    await bot.sendMessage(msg.chat.id, s);
}));

matches.update();
setInterval(normalize(async function() {
    await matches.update();
    state.change();    
}), 45000);

console.log("Bot started");
