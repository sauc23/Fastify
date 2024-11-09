import fs from 'fs';
import moment from 'moment-timezone';
import groupedRoutes from './menu.js';

const config = JSON.parse(fs.readFileSync('./config.json'));
const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss');
const d = new Date();
const locale = 'id';
const gmt = new Date(0).getTime() - new Date('1 January 2021').getTime();
const weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(((d * 1) + gmt) / 84600000) % 5];
const hari = d.toLocaleDateString(locale, { weekday: 'long' });
const datee = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
const ini_hari = `${hari} ${weton}, ${datee}`;

let prefix;

async function start(lol, name) {
    const text = `Date: ${ini_hari}\nTime: ${time}\n\nHello ${name}! I'm a multifunction bot built with ❤️ by [my master](${config.ownerLink})\n\nType /help to display Menu!`;
    await lol.replyWithMarkdown(text, { disable_web_page_preview: true });
}

async function help(lol, name, user_id) {
    prefix = config.prefix;
    const text = `Date: ${ini_hari}\nTime: ${time}\n\nHello ${name}! Here are the available commands you can use:\n\nIf you encounter a problem with the bot, please report it by typing ${prefix}report\n\nSemoga Hari Mu Menyenangkan`;
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'AI 🤖',
                        callback_data: 'listMenunya-' + user_id
                    }
                ]
            ]
        }
    };
    try {
        await lol.editMessageText(text, options);
    } catch {
        await lol.reply(text, options);
    }
}

async function listMenunya(lol, user_id) {
    prefix = config.prefix;

    for (const group in groupedRoutes) {
        let menuText = `*${group}:*\n\n`;
        groupedRoutes[group].forEach((subPath, index) => {
            menuText += `  ${index + 1}. ${prefix}${subPath}\n`;
        });

        await sendMenu(lol, menuText, user_id);
    }
}

async function sendMenu(lol, text, user_id) {
    const maxTextLength = 4096;
    const splitTexts = splitText(text, maxTextLength);
    
    // Menggunakan variabel untuk menyimpan status menu yang sedang ditampilkan
    let currentPage = 0;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Selanjutnya',
                        callback_data: `nextMenu-${user_id}-${currentPage + 1}`
                    },
                    {
                        text: 'Back',
                        callback_data: `help-${user_id}`
                    }
                ]
            ]
        }
    };

    await lol.reply(splitTexts[currentPage], {
        parse_mode: 'Markdown',
        reply_markup: options.reply_markup
    });
}

async function nextMenu(lol, user_id, currentPage, totalPages) {
    const nextPage = parseInt(currentPage, 10);
    if (nextPage < totalPages) {
        await lol.editMessageText(splitTexts[nextPage], {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Selanjutnya',
                            callback_data: `nextMenu-${user_id}-${nextPage + 1}`
                        },
                        {
                            text: 'Back',
                            callback_data: `help-${user_id}`
                        }
                    ]
                ]
            }
        });
    }
}

function splitText(text, maxLength) {
    const parts = [];
    while (text.length > 0) {
        if (text.length > maxLength) {
            parts.push(text.substring(0, maxLength));
            text = text.substring(maxLength);
        } else {
            parts.push(text);
            text = '';
        }
    }
    return parts;
}

async function messageError(lol) {
    await lol.reply(`Error! Please report to the [${config.owner}](${config.ownerLink}) about this`, {
        parse_mode: "Markdown",
        disable_web_page_preview: true
    });
}

export default {
    start,
    help,
    listMenunya,
    messageError,
    nextMenu
};
