import TelegramBot from 'node-telegram-bot-api';
import { flag, Matches } from './matches.js';
import config from '../config.json';
import { StateTracker } from './state-mgmt.js';
import { promisify } from 'util';
import fs from 'fs';

function normalize(promisy) {
    return function (a,b,c,d) {
        promisy(a,b,c,d).catch((err) => console.error(err));
    }
}

let matches = new Matches();
const bot = new TelegramBot(config.token, {polling: true});

let msgs = [];
let state = new StateTracker(matches);

async function saveMsgs() {
    await promisify(fs.writeFile)("msgs.json", JSON.stringify(msgs))
}

async function readMsgs() {
    try {
        let j = await promisify(fs.readFile)("msgs.json");
        let p = JSON.parse(j);
        msgs = p;
    } catch (err) {
        console.error(err);
    }
}

async function start() {

    try {
        await readMsgs();
    } catch (err) {
        // it might fail, we don't care
    }
    await matches.update();
    setInterval(normalize(async function() {
        await matches.update();
        state.change();    
    }), 45000);

    bot.onText(/\/track[ ]+(.+)/, normalize(async (msg, param) => {

        const chatId = msg.chat.id;
        const fifa_id = param[1];
        let match = matches.match(fifa_id);
        if (!match) {
            await bot.sendMessage(chatId, "Match not found, try /matches");
            return;
        }
        
        let cmsg = await bot.sendMessage(chatId, matches.convert(match), { parse_mode : 'Markdown' });
        msgs.push([fifa_id, { text : cmsg.text, message_id : cmsg.message_id, chat_id : cmsg.chat.id }]);
        try {
            await saveMsgs();
        } catch (err) {
            console.error("error saving msgs");
            console.error(err);
        }
        
    }));
    bot.onText(/\/matches[ ]*/, normalize(async function (msg) {
        let s = "";
        for (let match of matches.list_matches()) {
            if (match.status == 'future') {
                s += `\`${match.fifa_id}\` ${flag(match.home_team.code)} ${match.home_team.country} - ${match.away_team.country} ${flag(match.away_team.code)} __${match.datetime}__\n`;
            } else {
                s += `\`${match.fifa_id}\` ${flag(match.home_team.code)} ${match.home_team.country} ${match.home_team.goals} - ${match.away_team.goals} ${match.away_team.country} ${flag(match.away_team.code)}\n`;
            }
        }
        if (s === "") {
            s = "Loading match info, try again later...";
        }
        await bot.sendMessage(msg.chat.id, s, { parse_mode : 'Markdown' });

    }));

    state.addTracker(async function () {
        for (let [fifa_id,msg] of msgs) {
            try {
                let match = matches.match(fifa_id);
                let text = matches.convert(match);
                if (msg.text === text) return; // message already exists, dont update it
                msg.text = text;
                await bot.editMessageText(text, { message_id : msg.message_id, chat_id : msg.chat_id, parse_mode : 'Markdown' });
            } catch (err) {
                console.error(err);
            }
        }
    });
    
    console.log("Bot started");


};

start().catch((x) => console.error(x));
