import fetch from "node-fetch"
import { flag as emoji_flag } from "country-code-emoji"
import CountryCode from "country-code-info"

export function flag(country_info) {
    let hack = {
        "West Germany": "FRG",
        "England" : "ENG",
        "South Korea": "KOR",
        "Soviet Union": "URS"
    }
    if (hack[country_info]) {
        country_info = hack[country_info]
    }
    let cnt = CountryCode.findCountry({"fifa": country_info})
    if (!cnt) cnt = CountryCode.findCountry({"name": country_info})
    
    if (!cnt) return "🏴" 
    else return emoji_flag(cnt.a2)
}

function timeToArray(x) {
    let r = x.match(/^([0-9]+)'(?:\+([0-9]+)'|)/) 
    return [r[1], r[2]]
}

function events(match) {
    let evs = []
    if (!match) return evs
    if (!match.home_team_events) return evs
    function process(team, events) {
        for (let ev of events) {
            evs.push({team : team, type : ev.type_of_event, player : ev.player, time : ev.time })
        }
    }
    
    process(match.home_team, match.home_team_events)
    process(match.away_team, match.away_team_events)
    
    evs.sort(function(a_,b_) {
        let a = timeToArray(a_.time)
        let b = timeToArray(b_.time)
        if (a[0] - b[0] === 0) {
            return (a[1] == null ? 0 : a[1]) - (b[1] == null ? 0 : b[1])
        }
        return a[0] - b[0]
    })
    
    return evs
}

function goals(match) {
    let scores = [0,0]
    for (let ev of events(match)) {
        if (ev.type == "goal" || ev.type == "goal-penalty") {
            if (ev.team.code == match.home_team.code) {
                scores[0]++
            } else {
                scores[1]++
            }
        } else if (ev.type == "goal-own") {
            // the api is a mess, check uruguay's watch
            if (ev.team.code == match.home_team.code) {
                //scores[1]++;
            } else {
                //scores[0]++;
            }
        }
    }
    match.home_team.goals = scores[0]
    match.away_team.goals = scores[1]
}

function details(match) {
    let header = "\n➖➖➖➖➖➖\n"
    let scores = [0,0]
    let flags = [flag(match.home_team.code), flag(match.away_team.code)]
    for (let ev of events(match)) {
        let concept = `\`${ev.time}\``
        const country = `**${ev.team.country}** ${flag(ev.team.code)}`
        if (ev.type == "goal" | ev.type == "goal-penalty") {
            let penalty = ev.type == "goal-penalty"
            if (ev.team.code == match.home_team.code) {
                scores[0]++
            } else {
                scores[1]++
            }
            concept += ` ⚽️ ${penalty ? "PENALTY AND " : ""}GOAL! ${flag(ev.team.code)}! ${country} - ${ev.player} (${flags[0]} ${scores[0]} - ${scores[1]} ${flags[1]})`
        } else if (ev.type == "goal-own") {
            let opposite = undefined
            if (ev.team.code == match.home_team.code) {
                opposite = match.away_team
                //scores[0]++;
            } else {
                opposite = match.home_team
                //scores[1]++;
            }
            
            concept += ` ⚽️ GOAL ${flag(opposite.code)}! ${country} - ${ev.player} (own goal!) (${flags[0]} ${scores[0]} - ${scores[1]} ${flags[1]})`
        } else if (ev.type == "yellow-card") {
            concept += `⚠️ Yellow Card! ${ev.player} - ${country}`
        } else if (ev.type == "yellow-card-second") {
            concept += `⚠️‼️ Second Yellow Card, and that's RED! ${ev.player} - ${country}`
        } else if (ev.type == "red-card") {
            concept += `‼️ RED CARD! ${ev.player} - ${country}`
        } else if (ev.type == "substitution-in") {
            concept += `🔹 ${ev.player} - ${country}`
        } else if (ev.type == "substitution-out") {
            concept += `🔻 ${ev.player} - ${country}`
        } else {
            concept += `${ev.type} ${ev.player} ${country}`
        }
         
        header += concept + "\n"
    }
    return header
}

export class Matches {
    
    constructor() {
        this.curr_data = []
        //        console.log(this.curr_data[40]);
    }
    
    async update() {
        console.log("updating...")
        try {
            let matches = await fetch("https://worldcup.sfg.io/matches")
            this.curr_data = await matches.json()
        } catch (err) {
            console.error(err)
        }
    }
    
    list_matches() {
        return this.curr_data
    }
    
    match(fifa_id) {
        for (let match of this.curr_data) {
            if (match.fifa_id == fifa_id) {
                return match
            }
        }
        return null
    }
    
    convert(match) {
        if (!match || !match.status) { return "Invalid match" }
        if (match.status == "pending_correction") {
            goals(match)
        }
        if (match.status === "completed" || match.status == "in progress" || match.status == "pending_correction") {
            let home_pen = "", away_pen = ""
            if (match.home_team.penalties != null) home_pen = `(${match.home_team.penalties})`
            if (match.away_team.penalties != null) away_pen = `(${match.away_team.penalties})`
            if (match.home_team.penalties === 0 && match.away_team.penalties === 0) {
                // no penalties scored by either team 
                home_pen = ""; away_pen = ""
            }
            return `${flag(match.home_team.code)} **${match.home_team.country}** ${match.home_team.goals} ${home_pen} - ${away_pen} ${match.away_team.goals} **${match.away_team.country}** ${flag(match.away_team.code)} ${match.time ? match.time : "0'"}\n${details(match)}`
        } else if (match.status === "future") {
            return `To be played on ${match.datetime}\n${flag(match.home_team.code)} **${match.home_team.country}** - **${match.away_team.country}** ${flag(match.away_team.code)}`
        }
        console.error(match)
        return "???"
    }
    
    summary(match) {
        if (match.status == "future") {
            return `\`${match.fifa_id}\` ${flag(match.home_team.code)} ${match.home_team.country} - ${match.away_team.country} ${flag(match.away_team.code)} __${match.datetime}__\n`
        } else {
            let home_pen = "", away_pen = ""
            if (match.home_team.penalties != null) home_pen = `(${match.home_team.penalties})`
            if (match.away_team.penalties != null) away_pen = `(${match.away_team.penalties})`
            if (match.home_team.penalties === 0 && match.away_team.penalties === 0) {
                // no penalties scored by either team 
                home_pen = ""; away_pen = ""
            }
            return `\`${match.fifa_id}\` ${flag(match.home_team.code)} ${match.home_team.country} ${match.home_team.goals} ${home_pen} - ${away_pen} ${match.away_team.goals} ${match.away_team.country} ${flag(match.away_team.code)}\n`
        }
    }
    
}
