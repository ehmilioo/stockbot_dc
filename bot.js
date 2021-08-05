log('Bot build starting...');
const Discord = require('discord.js');
const CONFIG = require('./config.json');
const {
    floor,
    random
} = Math;
const fetch = require('node-fetch')
const quotes = CONFIG.quotes;
const prefix = CONFIG.prefix;
const discordToken = CONFIG.token;
const ownerID = CONFIG.ownerID;
const presence = CONFIG.presence;
const bot = new Discord.Client();
const marketStackToken = CONFIG.marketStackToken;
const fs = require('fs')

//Map trough all images removing on restart to avoid errors
for (let i = 0; i < 50; i++) {
    const path = `./tradingview${i}.png`
    fs.unlink(path, (err) => {
        if (err) {
            return
        }
        log('File removed');
        //file removed
    })
}

const captureWebsite = require('capture-website');
const {
    file
} = require('capture-website');
const {
    Console
} = require('console');
const options = {
    width: 1920,
    height: 1080
};


var logos = [];
var obj = {};
var screenshotID = 0;

bot.on('message', (receivedMessage) => {
    var userID = receivedMessage.content.replace(/[<@!>]/g, '');
    var botID = bot.user.toString().replace(/[<@!>]/g, '');
    if (receivedMessage.author == bot.user) {
        return
    }
    if (userID.includes(botID)) {
        receivedMessage.reply(randomQuote());
    }
})



/*
    TODO
    - Fixa logo hämtarn så att den gör if-satser på allt
    - Pingfunktion ifall man ska köpa
    - Index
    - Reagera med en emote för att få senaste info om aktien 
*/


/*
    UPDATES
    - Help med flera sidor
    - Nya quotes
    - Procent, räkna ut ökning i procent
*/


bot.on('message', message => {
    //Variablar
    const msg = message.content.toUpperCase(); // Förhindra case sensitive
    const sender = message.author; //
    const cont = message.content.slice(prefix.length).trim().split(/ +/); // Sorterar ut prefix
    const args = cont.slice(1); // Detta tillåter endast ett argument
    const characters = 'abcdefghijklmnopqrstuvwxyz'.split('');

    // Rensa meddelanden
    if (msg.startsWith(prefix + 'RENSA')) {
        var roleBool = roleCheck(message)
        log(roleBool)
        if (roleBool) {
            async function purge() {
                message.delete();

                if (isNaN(args[0])) {
                    message.reply('\n >>> Du måste ange antal meddelanden som ska tas bort. \n Användning: ' + prefix + 'rensa <antal>');
                    return;
                }

                const fetched = await message.channel.messages.fetch({
                    limit: args[0]
                });

                message.channel.bulkDelete(fetched)
                    .catch(error => message.channel.send(`${error}`));
            }
            purge();
        } else {
            message.reply("Hoppsan något gick fel, du har inte tillgång till detta command");
        }


    } else if (msg.startsWith(prefix + "HELP")) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args[1];
        var userID = '';
        var avatarID = '';
        var avatarURL = `https://cdn.discordapp.com/avatars/${userID}/${avatarID}.png?size=256`;
        const botURL = bot.user.avatarURL()
        if (isEmpty(command)) {
            const embed = new Discord.MessageEmbed()
                .setColor('#34ebdc')
                .setTitle(`Välkommen till ${bot.user.username}!`)
                .setThumbnail(botURL)
                .setFooter('Skapad av: Emilio | Page 1 of 2', avatarURL)
                .addFields({
                    name: 'Hjälp',
                    value: `För att få hjälp med något använder du: **${prefix}help**, Ifall du inte hittar vad du söker testa skriv en siffra efter för att gå till nästa sida`
                }, {
                    name: 'Framtid',
                    value: `För att räkna ut hur mycket du kan tjäna på X antal dagar med X många procent gör du såhär: \n**${prefix}framtid <BELOPP> <%> <DAGAR>**`
                }, {
                    name: 'Flex',
                    value: `Gick det bra för dig idag? Flexa i ..  såhär: \n**${prefix}flex NAMN KÖP SÄLJ BULL/BEAR**\nViktigt att du har mellanslag efter varje argument annars funkar det inte.`
                }, {
                    name: 'Info',
                    value: `För att få senaste statusen om en aktie använder du dig av: \n**${prefix}info <AKTIE>** \nDet är viktigt att du använder dig av aktiens symbol`
                }, {
                    name: 'Feeling down?',
                    value: `Tagga boten för att få inspirerande quotes som hjälper dig när det inte går som tänkt`
                },

                );
            message.channel.send(embed);
        } else if (command === "2") {
            const embed = new Discord.MessageEmbed()
                .setColor('#34ebdc')
                .setTitle(`Välkommen till ${bot.user.username}!`)
                .setThumbnail(botURL)
                .setFooter('Skapad av: Emilio | Page 2 of 2', avatarURL)
                .addFields({
                    name: 'Procent',
                    value: `För att veta hur mycket procentuell skillnad det är mellan två summor använd dig utav: **${prefix}procent PRIS1 PRIS2**`
                }, {
                    name: 'Total',
                    value: `Ser du att en person är aktiv i .., använd dig utav: \n**${prefix}total @Namn** för att få fram personen totala statistik`
                }, {
                    name: 'Predict',
                    value: `Studerat marknaden? Skriv din analys såhär: \n**${prefix}predict <VÄRDEPAPPER> UTFÖRLIG BESKRIVNING**`
                },

                );
            message.channel.send(embed);
        } else {
            message.reply("Hoppsan något gick fel, kolla så att du skrev rätt siffra!");
        }

    } else if (msg.startsWith(prefix + 'INFO')) {
        const botURL = bot.user.avatarURL()
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toUpperCase();
        const stocks = args[0];
        const compareStock = stocks.toUpperCase();
        fetch(`http://api.marketstack.com/v1/eod?access_key=${marketStackToken}&symbols=${stocks}`)
            .then((data) => data.json())
            .then((data) => {
                //log(data);
                let correctObj = logos.find(o => o.symbol === compareStock);
                var logoRaw = correctObj.name.replace(/ .*/, '')
                var logo = logoRaw.toLowerCase();
                const embed = new Discord.MessageEmbed()
                    .setColor('#32a852')
                    .setTitle(`${correctObj.name}`)
                    .setThumbnail(`http://logo.clearbit.com/${logo}.com`)
                    .setFooter(`Datum hämtat: ${data.data[0].date}`, botURL)
                    .addFields({
                        name: 'Öppning',
                        value: `**${data.data[0].open}**`
                    }, {
                        name: 'Stängning',
                        value: `**${data.data[0].close}**`
                    });
                message.channel.send(embed);
            })
            .catch(function (error) {
                log(error);
                if (error = "Cannot read property 'name' of undefined") {
                    message.channel.send("Denna aktie finns inte hos oss än, vi arbetar med detta 🕵");
                    return;
                }
                message.channel.send("Hoppsan något gick fel, kontakta utvecklare. \n Error: " + error);
            });
    }

    else if (msg.startsWith(prefix + 'LIVE')) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const stockName = args[1];
        let symbol = null;
        screenshotID++;
        if (stockName.toUpperCase() === "TESLA") {
            symbol = 'NASDAQ%3ATSLA';
        } else if (stockName.toUpperCase() === "NASDAQ") {
            symbol = 'CURRENCYCOM%3AUS100'
        } else if (stockName.toUpperCase() === "APPLE") {
            symbol = 'NASDAQ%3AAAPL';
        } else if (stockName.toUpperCase() === "OMX") {
            symbol = 'OMXSTO%3AOMXS30';
        } else {
            message.channel.send('Hoppsan något gick fel, denna live-bild finns inte än!');
            return;
        }
        const items = [
            [`https://se.tradingview.com/chart/?symbol=${symbol}`, `tradingview`],
            // …
        ];
        (async () => {
            await Promise.all(items.map(([url, filename]) => {
                return captureWebsite.file(url, `${filename}${screenshotID}.png`, options);
            }));
            await message.channel.send(`Årlig visning av ${stockName.toUpperCase()}:`, {
                files: [`./tradingview${screenshotID}.png`]
            });
        })();

    }
    else if (msg.startsWith(prefix + 'PREDICT')) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const stockname = args[1];
        const [, , ...rest] = args;
        const arrayDesc = rest.toString();
        var description = arrayDesc.replace(/,/g, ' ')
        const embed = new Discord.MessageEmbed()
            .setColor('#da42f5')
            .setTitle(`Predictions av: ` + message.author.username)
            .setThumbnail(message.author.avatarURL())
            .setFooter('Skapad av: Emilio')
            .addFields({
                name: 'Värdepapper',
                value: `${stockname}`
            }, {
                name: 'Argument/Beskrivning',
                value: `${description}`
            });
        bot.channels.cache.get(``).send(embed)

    }
    else if (msg.startsWith(prefix + 'FRAMTID')) {
        message.delete();
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toUpperCase();
        const startprice = args[0];
        const rate = args[1];
        const days = args[2];
        const correctRate = (rate / 100) + 1;
        const thePowerOf = Math.pow(correctRate, days);
        var totalAmount = startprice * thePowerOf;
        var roundedAmount = Math.trunc(totalAmount);
        var roundedAmountConverted = numberWithSpaces(roundedAmount);
        var currency = 'KR';
        if (roundedAmount > 99999999999) {
            roundedAmountConverted = 'Alldeles för mycket';
            currency = '';
        }
        const embed = new Discord.MessageEmbed()
            .setColor('#4287f5')
            .setTitle(`Räknaren 🧮 | Önskad av: ${message.author.username}`)
            .setThumbnail(``)
            .setFooter('Skapad av: Emilio')
            .addFields({
                name: 'Resultat',
                value: `Efter ${days} dagar med ${rate}% ränta och ett startbelopp på ${startprice} har du: **${roundedAmountConverted}**${currency}`
            });
        message.channel.send(embed);

    }
    else if (msg.startsWith(prefix + 'TOTAL')) {
        var arr = [];
        var totalpercentage = 0;
        var totalBuy = 0;
        var totalSell = 0;
        const taggedUser = message.mentions.users.first();
        if (isEmpty(taggedUser)) {
            message.reply("Hoppsan något gick fel, du måste ange användaren");
            return;
        }
        let rawdata = fs.readFileSync('results.json');
        let res = JSON.parse(rawdata);
        for (let val of res.results) {
            if (val.user == taggedUser.username) {
                arr.push(val);
            }
        }
        if (arr.length <= 0) {
            message.reply("Hoppsan något gick fel, hittade inget om denna användare");
            return;
        }
        for (i = 0; i < arr.length; i++) {
            procentDecimal = arr[i].percentage;
            totalpercentage += procentDecimal;
            totalBuy += arr[i].buyprice;
            totalSell += arr[i].sellprice;
        }
        var answer = (totalpercentage / arr.length);
        var buyAnswer = totalBuy / arr.length;
        var sellAnswer = totalSell / arr.length;
        const embed = new Discord.MessageEmbed()
            .setColor("#5a03fc")
            .setTitle(arr[0].user + 's totala statistik')
            .setFooter('Skapad av: Emilio')
            .addFields({
                name: 'Procent',
                value: `Genomsnittlig procentsats: **${answer}**%`
            }, {
                name: 'Köppris',
                value: `${arr[0].user} har köpt ${arr.length} gånger med ett genomsnittligt pris på ${buyAnswer}KR`
            }, {
                name: 'Säljpris',
                value: `${arr[0].user} har sålt ${arr.length} gånger med ett genomsnittligt pris ${sellAnswer}KR`
            });
        message.channel.send(embed);

    }
    else if (msg.startsWith(prefix + 'FLEX')) {
        message.delete();
        var datetime = new Date();
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toUpperCase();
        const stockName = args[0];
        const buyPrice = args[1];
        const sellPrice = args[2];
        const buyType = args[3];

        //Errorhandler
        if (isEmpty(stockName) || empty(buyPrice) || empty(sellPrice) || isEmpty(buyType)) {
            message.reply(`Hoppsan något gick fel! Användning: ${prefix}flex <NAMN> <KÖPPRIS> <SÄLJPRIS> <BULL/BEAR>`);
            return;
        }

        buyValue = buyPrice.replace(/,/g, '.')
        sellValue = sellPrice.replace(/,/g, '.')

        const sellDifference = ((sellValue - buyValue) / buyValue) * 100;

        if (isNaN(sellDifference)) {
            message.reply(`Hoppsan något gick fel! Användning: ${prefix}flex <NAMN> <KÖPPRIS> <SÄLJPRIS> <BULL/BEAR>`);
            return;
        }
        const sellDiferenceSliced = sellDifference.toString().slice(0, 4);

        color = null;

        if (sellDifference > 0) {
            color = '#42cf68';
        } else {
            color = '#eb4034';
        }
        if (message.channel.id === '' || '') {
            const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setThumbnail(message.author.avatarURL())
                .setTitle(message.author.username + 's dag')
                .setFooter('Skapad av: Emilio  \n' + 'Datum: ' + datetime.toISOString().slice(0, 10))
                .addFields({
                    name: 'Aktienamn',
                    value: `Namn på värdepappret: **${stockName}**`
                }, {
                    name: 'Köppris',
                    value: `Köpte för: **${buyValue}KR**`
                }, {
                    name: 'Säljpris',
                    value: `Sålde för: **${sellValue}KR**`
                }, {
                    name: 'Resultat',
                    value: `Procentuellt resultat: **${sellDiferenceSliced}%**\nTyp av köp: **${buyType}**`
                });
            message.channel.send(embed);
            var pointNum = parseFloat(sellDiferenceSliced);
            var buyNum = parseFloat(buyValue);
            var sellNum = parseFloat(sellValue);
            fs.readFile('results.json', 'utf8', function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    obj = JSON.parse(data);
                    obj.results.push({
                        user: message.author.username,
                        date: datetime.toISOString().slice(0, 10),
                        buyprice: buyNum,
                        sellprice: sellNum,
                        percentage: pointNum
                    });
                    json = JSON.stringify(obj);
                    fs.writeFile('results.json', json, 'utf8', function (err) {
                        if (err) throw err;
                        console.log('Saved result to file');
                    });
                }
            });
        } else { }
    }
    else if (msg.startsWith(prefix + 'PROCENT')) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const buy = args[1];
        const sell = args[2];
        var percentage = 0;
        if (isEmpty(buy)) {
            message.reply("Hoppsan något gick fel, felaktigt köppris");
            return;
        }
        else if (isEmpty(sell)) {
            message.reply("Hoppsan något gick fel, felaktigt säljpris");
            return;
        } else {
            var increase = sell - buy;
            var decrease = buy - sell;
            if (buy > sell) {
                percentage = (decrease / buy) * 100;
            } else {
                percentage = (increase / buy) * 100;
            }
        }
        const percentageSliced = percentage.toString().slice(0, 4);
        message.reply(`Ifall du köper för ${buy} och säljer för ${sell} har du tjänat/förlorat: **${percentageSliced}%**`);
    }
});

function roleCheck(Message) {
    this.message = Message;
    var roleBool = message.member.roles.cache.some(r => r.name === "Traders" || "Bot");
    if (!roleBool) {
        log(roleBool + ", har inte rollen");
    } else {
        log(roleBool + ", har rollen");
    }
    return roleBool;
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

//Kollar efter botens ägares ID -- Config för ID
function ownerCheck(Message) {
    this.message = Message;
    if (message.author.id == ownerID) {
        return true;
    } else {
        return false;
    }
}

function empty(e) {
    switch (e) {
        case "":
        case 0:
        case "0":
        case null:
        case false:
        case typeof (e) == "undefined":
            return true;
        default:
            return false;
    }
}

function randomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
};

function log(String) {
    console.log(String);
}

function numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Turn bot off (destroy), then turn it back on
function resetBot(channel) {
    var lines = process.stdout.getWindowSize()[1];
    for (var i = 0; i < lines; i++) {
        console.log('\r\n');
    }
    log('Restarting...')
    message.channel.send(`${bot.user.username} startar om, vänligen dröj...`)
    bot.destroy()
    bot.login(discordToken)
}

bot.on('ready', () => {
    bot.user.setActivity(presence, {
        type: "PLAYING"
    }); // PLAYING, STREAMING, LISTENING, WATCHING
    log(`${bot.user.username} started sucessfully`);
    fetch(`http://api.marketstack.com/v1/tickers?access_key=`)
        .then((data) => data.json())
        .then((data) => {
            for (i = 0; i < data.data.length; i++) {
                obj = {
                    "symbol": data.data[i].symbol,
                    "name": data.data[i].name
                }
                logos.push(obj);
            }
        })
});
bot.login(discordToken);

//All emojis
// https://www.unicode.org/Public/emoji/13.1/emoji-test.txt
// https://www.prosettings.com/emoji-list/