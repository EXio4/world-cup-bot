import TelegramBot from "node-telegram-bot-api"
import { flag, Matches } from "./matches.js"
import config from "../config.json"
import { StateTracker } from "./state-mgmt.js"
import { promisify } from "util"
import fs from "fs"
import wch from "world-cup-history"

function normalize(promisy) {
    return function (a,b,c,d) {
        promisy(a,b,c,d).catch((err) => console.error(err))
    }
}

let matches = new Matches()
const bot = new TelegramBot(config.token, {polling: true})

let msgs = []
let state = new StateTracker(matches)

async function saveMsgs() {
    await promisify(fs.writeFile)("msgs.json", JSON.stringify(msgs))
}

async function readMsgs() {
    try {
        let j = await promisify(fs.readFile)("msgs.json")
        let p = JSON.parse(j)
        msgs = p
    } catch (err) {
        console.error(err)
    }
}

async function start() {

    try {
        await readMsgs()
    } catch (err) {
        // it might fail, we don't care
    }
    let upd = async function() {
        await matches.update()
        state.change()    
    }
    
    state.addTracker(async function () {
        for (let [fifa_id,msg] of msgs) {
            try {
                let match = matches.match(fifa_id)
                let text = matches.convert(match)
                if (msg.text === text) continue // message already exists, dont update it
                msg.text = text
                await bot.editMessageText(text, { message_id : msg.message_id, chat_id : msg.chat_id, parse_mode : "Markdown" })
            } catch (err) {
                console.error(err)
            }
        }
        await saveMsgs()
    })
    
    await upd()
    setInterval(normalize(upd), 45000)

    bot.onText(/^\/track[ ]+(.+)/, normalize(async (msg, param) => {

        const chatId = msg.chat.id
        const fifa_id = param[1]
        let match = matches.match(fifa_id)
        if (!match) {
            await bot.sendMessage(chatId, "Match not found, try /matches")
            return
        }
        
        let text = matches.convert(match)
        let cmsg = await bot.sendMessage(chatId, text, { parse_mode : "Markdown" })
        msgs.push([fifa_id, { text : text, message_id : cmsg.message_id, chat_id : cmsg.chat.id }])
        try {
            await saveMsgs()
        } catch (err) {
            console.error("error saving msgs")
            console.error(err)
        }
        
    }))
    bot.onText(/^\/matches[ ]*/, normalize(async function (msg) {
        let s = ""
        for (let match of matches.list_matches()) {
            s += matches.summary(match) + "\n"
        }
        if (s === "") {
            s = "__Loading match info, try again later...__"
        }
        await bot.sendMessage(msg.chat.id, s, { parse_mode : "Markdown" })

    }))

    bot.onText(/^\/historic[ ]+(.+)/, normalize(async function (msg, param) {
        let y = wch.year(param[1])
        if (y == null) {
            await bot.sendMessage(msg.chat.id, "We don't have any info on that year :(", { parse_mode : "Markdown" })
        } else {
            let pretty = ""
            pretty += `Hosted by ${y.hostCountry}, the winner was ${y.winner}, and ${y.runnerUp} was runner-up\n`
            let topScorer = `${y.topGoalScorer.length > 1 ? "The top scorers were: " : "The top scorer was "}\n`
            if (y.topGoalScorer.length > 1) topScorer += "\n"
            for (let sc of y.topGoalScorer) {
                topScorer += `     ${sc.name} from ${sc.country} that scored ${sc.numberOfGoals}\n`
            }
            pretty += topScorer
            await bot.sendMessage(msg.chat.id, pretty, { parse_mode : "Markdown" })
        }
    }))
    console.log("Bot started")


}

start().catch((x) => console.error(x))
