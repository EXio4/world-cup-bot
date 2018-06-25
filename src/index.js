import TelegramBot from 'node-telegram-bot-api';
import { flag, Matches } from './matches.js';
import config from '../config.json';
import { StateTracker } from './state-mgmt.js';


let matches = new Matches();
const bot = new TelegramBot(config.token, {polling: true});

let msgs = [];
let state = new StateTracker(matches);

state.addTracker(async function () {
    for (let [fifa_id,msg] of msgs) {
        try {
            let match = matches.match(fifa_id);
            await bot.editMessageText(matches.convert(match), { message_id : msg.message_id, chat_id : msg.chat.id, parse_mode : 'Markdown' });
        } catch (err) {
            // ¯\_(ツ)_/¯
        }
    }
});

bot.onText(/\/track[ ]+(.+)/, async (msg, param) => {

  const chatId = msg.chat.id;
  const fifa_id = param[1]; // the captured "whatever"
//matches.convert(matches.match(300331503)))
  let match = matches.match(fifa_id);
  if (!match) {
      bot.sendMessage(chatId, "Match not found, try /matches");
      return;
  }
  
  let cmsg = await bot.sendMessage(chatId, matches.convert(match), { parse_mode : 'Markdown' });
  msgs.push([fifa_id, cmsg]);
  
});
bot.onText(/\/matches[ ]*/, async function (msg) {
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
});

matches.update();
setInterval(async function() {
    await matches.update();
    state.change();    
}, 45000);

console.log("Bot started");
