import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import os from 'os';
import multer from 'multer';
import { apiRouters, swaggerDefs, routers } from '../api/api.js';
import morgan from 'morgan';
import helmet from 'helmet';
import fs from 'fs';
import ora from 'ora';
import chalk from 'chalk';

import {
    Telegraf,
    Markup
} from 'telegraf';
import help from '../lib/help.js';

import tele from '../lib/tele.js';
const {
    usernameOwner,
    numberOwner,
    IdO,
    apikey,
    bot_token,
    owner,
    ownerLink,
    version,
    prefix
} = JSON.parse(fs.readFileSync('./config.json'));
const mess = JSON.parse(fs.readFileSync(`./data/mess.json`))
const _user = JSON.parse(fs.readFileSync(`./data/user.json`))
const _ban = JSON.parse(fs.readFileSync('./data/banned.json'))

let user = null;
let response = null;
let cb_data = null;
let user_id = null;
let callback_data = null;
let comm = null;
let cmd = null;
let test = null;
let text = null;
let url_file = null;
let chatid = null;
let mediaLink = null;
let databuff = null;

if (bot_token === '') {
    console.log('=== BOT TOKEN CANNOT BE EMPTY ===');
    process.exit(1);
}

const bot = new Telegraf(bot_token);
bot.on('new_chat_members', async (lol) => {
    const message = lol.message;
    const groupname = message.chat.title;
    
    for (const member of message.new_chat_members) {
        const full_name = member.first_name + (member.last_name ? ` ${member.last_name}` : '');
        console.log('├', '[  JOINS  ]', full_name, 'join in', groupname);
        
        await lol.replyWithPhoto({
                    url: `https://picsum.photos/2560/1600`
                }, {
                    caption: full_name + '\n\n[  JOINS  ]',
                    parse_mode: "Markdown"
                });
    }
});

bot.on('left_chat_member', async (ctx) => {
    const message = ctx.message;
    
    if (parseInt(message.left_chat_member.id) !== parseInt(bot_token.split(':')[0])) {
        const groupname = message.chat.title;
        const full_name = message.left_chat_member.first_name + (message.left_chat_member.last_name ? ` ${message.left_chat_member.last_name}` : '');

        console.log('├', '[  LEAVE  ]', full_name, 'leave from', groupname);

        await ctx.replyWithPhoto({
            url: 'https://picsum.photos/2560/1600',
        }, {
            caption: `${full_name}\n\n[  LEAVE  ]`,
            parse_mode: 'Markdown',
        });
    }
});

bot.command('start', async (lol) => {
    user = tele.getUser(lol.message.from);
    await help.start(lol, user.full_name);
    const isGroup = lol.chat.type.includes("group");
    if (!isGroup) return await lol.deleteMessage();
});

bot.command('help', async (lol) => {
    user = tele.getUser(lol.message.from);
    await help.help(lol, user.full_name, lol.message.from.id.toString());
});

bot.on('callback_query', async (lol) => {
    var groupname = lol.chat.title;
    cb_data = lol.callbackQuery.data.split('-');
    user_id = Number(cb_data[1]);
    if (lol.callbackQuery.from.id != user_id) return lol.answerCbQuery('Sorry, You do not have the right to access this button.', {
        show_alert: true
    });
    callback_data = cb_data[0];
    user = tele.getUser(lol.callbackQuery.from);
    chatid = lol.chat.id;
    const isGroup = lol.chat.type.includes("group");
    if (!isGroup) console.log(chalk.whiteBright('├'), chalk.cyanBright('[ ACTIONS ]'), chalk.whiteBright(callback_data), chalk.greenBright('from'), chalk.whiteBright(user.full_name));
    if (isGroup) console.log(chalk.whiteBright('├'), chalk.cyanBright('[ ACTIONS ]'), chalk.whiteBright(callback_data), chalk.greenBright('from'), chalk.whiteBright(user.full_name), chalk.greenBright('in'), chalk.whiteBright(groupname));
    if (callback_data == 'help') return await help.help(lol, user.full_name, user_id);
    await help[callback_data](lol, user_id.toString());
});

bot.on('message', async (lol) => {
    try {
        const body = lol.message.text || lol.message.caption || '';
        comm = body.trim().split(' ').shift().toLowerCase();
        cmd = false;
        if (prefix !== '' && body.startsWith(prefix)) {
            cmd = true;
            comm = body.slice(1).trim().split(' ').shift().toLowerCase();
        }
        const command = comm;
        const args = await tele.getArgs(lol);
        const user = tele.getUser(lol.message.from);
        const itsme = tele.getBot(lol.message);

        const isUser = _user.includes(user.id);
        const isBann = _ban.includes(user.username);
        const ownerId = [usernameOwner]
        const isOwner = ownerId.includes(user.username);

        const reply = async (content, opt = {}) => {
            if (typeof content === 'string') {
                for (let x = 0; x < content.length; x += 4096) {
                    await lol.reply(content.slice(x, x + 4096), {
                        disable_web_page_preview: false,
                        reply_to_message_id: lol.message.message_id,
                        ...opt
                    });
                }
            } else {
                const jsonString = JSON.stringify(content, null, 2);
                for (let x = 0; x < jsonString.length; x += 4096) {
                    await lol.reply(jsonString.slice(x, x + 4096), {
                        disable_web_page_preview: false,
                        reply_to_message_id: lol.message.message_id,
                        ...opt
                    });
                }
            }
        };
        const query = args.join(' ');
        const isCmd = cmd;
        const isGroup = lol.chat.type.includes("group");
        const groupName = isGroup ? lol.chat.title : "";

        const isImage = lol.message.hasOwnProperty('photo');
        const isVideo = lol.message.hasOwnProperty('video');
        const isAudio = lol.message.hasOwnProperty('audio');
        const isSticker = lol.message.hasOwnProperty('sticker');
        const isContact = lol.message.hasOwnProperty('contact');
        const isLocation = lol.message.hasOwnProperty('location');
        const isDocument = lol.message.hasOwnProperty('document');
        const isAnimation = lol.message.hasOwnProperty('animation');
        const isMedia = isImage || isVideo || isAudio || isSticker || isContact || isLocation || isDocument || isAnimation;
        const action = isMedia
  ? isImage ? 'upload_photo' :
    isVideo ? 'record_video' :
    isAudio ? 'record_audio' :
    isDocument ? 'upload_document' :
    isLocation ? 'find_location' :
    isAnimation ? 'record_video_note' :
    'typing'
  : 'typing';
if (isCmd) {
await lol.sendChatAction(action);
}

        const quotedMessage = lol.message.reply_to_message || {};
        const isQuotedImage = quotedMessage.hasOwnProperty('photo');
        const isQuotedVideo = quotedMessage.hasOwnProperty('video');
        const isQuotedAudio = quotedMessage.hasOwnProperty('audio');
        const isQuotedSticker = quotedMessage.hasOwnProperty('sticker');
        const isQuotedContact = quotedMessage.hasOwnProperty('contact');
        const isQuotedLocation = quotedMessage.hasOwnProperty('location');
        const isQuotedDocument = quotedMessage.hasOwnProperty('document');
        const isQuotedAnimation = quotedMessage.hasOwnProperty('animation');
        const isQuoted = lol.message.hasOwnProperty('reply_to_message');

        var typeMessage = body.substr(0, 50).replace(/\n/g, '');
        if (isImage) typeMessage = 'Image';
        else if (isVideo) typeMessage = 'Video';
        else if (isAudio) typeMessage = 'Audio';
        else if (isSticker) typeMessage = 'Sticker';
        else if (isContact) typeMessage = 'Contact';
        else if (isLocation) typeMessage = 'Location';
        else if (isDocument) typeMessage = 'Document';
        else if (isAnimation) typeMessage = 'Animation';

        if (!isGroup && !isCmd) console.log(chalk.whiteBright('├'), chalk.cyanBright('[ PRIVATE ]'), chalk.whiteBright(typeMessage), chalk.greenBright('from'), chalk.whiteBright(user.full_name));
        if (isGroup && !isCmd) console.log(chalk.whiteBright('├'), chalk.cyanBright('[  GROUP  ]'), chalk.whiteBright(typeMessage), chalk.greenBright('from'), chalk.whiteBright(user.full_name), chalk.greenBright('in'), chalk.whiteBright(groupName));
        if (!isGroup && isCmd) console.log(chalk.whiteBright('├'), chalk.cyanBright('[ COMMAND ]'), chalk.whiteBright(typeMessage), chalk.greenBright('from'), chalk.whiteBright(user.full_name));
        if (isGroup && isCmd) console.log(chalk.whiteBright('├'), chalk.cyanBright('[ COMMAND ]'), chalk.whiteBright(typeMessage), chalk.greenBright('from'), chalk.whiteBright(user.full_name), chalk.greenBright('in'), chalk.whiteBright(groupName));

        var file_id = '';
        if (isQuoted) {
            file_id = isQuotedImage ?
                lol.message.reply_to_message.photo[lol.message.reply_to_message.photo.length - 1].file_id :
                isQuotedVideo ?
                lol.message.reply_to_message.video.file_id :
                isQuotedAudio ?
                lol.message.reply_to_message.audio.file_id :
                isQuotedDocument ?
                lol.message.reply_to_message.document.file_id :
                isQuotedAnimation ?
                lol.message.reply_to_message.animation.file_id :
                '';
            console.log(chalk.whiteBright('├'), chalk.cyanBright('[ FILE ID ]'), chalk.yellowBright(file_id));
        }
        if (file_id) {
            mediaLink = file_id ? (await tele.getLink(file_id) || (await tele.downloadFile(file_id)).file) : '';
            if (mediaLink) {
                console.log(chalk.whiteBright('├'), chalk.cyanBright('[ FILE URL ]'), chalk.yellowBright(mediaLink));
            }
        }
const messages = [{
            role: 'system',
            content: 'You are a helpful assistant.'
        },
        {
            role: 'user',
            content: (query)
        },
    ];

if (command === 'help') {
    await help.help(lol, user.full_name, lol.message.from.id.toString());
    return; 
}

const lowerCaseCommand = command.toLowerCase();
const foundRoute = routers.find(({ routePath }) => lowerCaseCommand === routePath.toLowerCase().split('/').pop());

if (foundRoute) {
    const { handler } = foundRoute;
    const queries = query.includes('|') ? query.split('|').map(q => q.trim()) : [query.trim()];
    const result = await handler(...queries);
    await reply(result);
    return; 
}

console.log(chalk.bgYellow.black('─── ' + chalk.blue('[ Not Found ]')));

    } catch (e) {
        console.log(chalk.whiteBright('├'), chalk.cyanBright('[  ERROR  ]'), chalk.redBright(e));
    }
});

bot.launch({
    dropPendingUpdates: true,
});

bot.telegram.getMe().then(({
    first_name
}) => {
    const itsPrefix = prefix || 'No Prefix';
    const uptime = process.uptime();
    const cpuSpeed = os.cpus()[0].speed;

    const border = chalk.bgRedBright.white(' ╭──────────────────────────────────── ').trimEnd();
    const log = console.log;
    const [leftText, rightText] = [chalk.yellowBright(' │ '), chalk.cyanBright(' ')];

    log(border);
    new Map([
        ['Owner', owner],
        ['Bot Name', first_name],
        ['Version', version],
        ['Host', os.hostname()],
        ['Platform', os.platform()],
        ['CPU Speed', `${cpuSpeed} MHz`],
        ['Prefix', itsPrefix],
        ['Uptime', formatUptime(uptime)],
    ]).forEach((value, label) => {
        const paddedLabel = label.padEnd(18);
        log(`${leftText}${chalk.yellowBright(`${paddedLabel}:`)} ${value || ''} ${rightText}`);
    });

    log(`${leftText}${chalk.yellowBright('Additional Info:')} Telegram Bot. ${rightText}`);
    log(`${leftText}${chalk.yellowBright('Your Here')} ⇩ ${rightText}`);
    log(chalk.bgYellow.black(` ╰──────────────────────────────────── `).trimStart());
});

const formatUptime = (uptime) => {
    const [hours, minutes, seconds] = [3600, 60, 1].map(unit => Math.floor(uptime / unit));
    return `${hours}h ${minutes}m ${seconds}s`;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const spinner = ora({ text: chalk.cyan('🚀 Starting server...'), spinner: 'moon' });
const swaggerDocs = swaggerDefs;

// Basic security and performance configurations
app.enable('trust proxy').set('json spaces', 2);
app.use(cors());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/favicon.ico', express.static(path.join(__dirname, '', 'favicon.ico')));
app.use(morgan('combined'));
app.use(helmet());

// File upload configuration
const upload = multer({ dest: 'uploads/' });

// Custom logging for requests
app.use((req, res, next) => {
  const start = Date.now();
  const { method, path: routerPath, headers } = req;
  console.log(chalk.blue(`[INFO] ${chalk.bold(method)} request received for ${chalk.underline(routerPath)} from ${headers['user-agent']} at ${new Date().toISOString()}`));
  
  res.on('finish', () => {
    console.log(chalk.green(`[INFO] Response sent with status ${chalk.bold(res.statusCode)} in ${chalk.magenta(Date.now() - start + 'ms')}`));
  });
  
  next();
});

// Route definitions
app.get('/', (req, res) => {
  spinner.start('🌐 Serving index.html...');
  res.sendFile(path.join(__dirname, '../src', 'html', 'index.html'), (error) => {
    if (error) {
      spinner.fail(chalk.red('Error serving index.html'));
      console.error(chalk.red('Error:'), error);
      res.status(500).send('Internal Server Error');
    } else {
      spinner.succeed(chalk.green('index.html served successfully'));
    }
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  spinner.start('📁 Uploading file...');
  spinner.succeed(chalk.green('File uploaded successfully'));
  res.json({ message: 'File uploaded successfully', file: req.file });
});

app.use('/api', apiRouters);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCss: fs.readFileSync(path.join(__dirname, '../src', 'css', 'custom.css'), 'utf-8'),
  customSiteTitle: "Wudysoft API",
  customFavIcon: '/favicon.ico',
}));

app.get('/endpoints', (req, res) => {
  spinner.start('📋 Retrieving endpoints...');
  const routes = apiRouters.stack.flatMap(middleware => {
    if (middleware.route) return [{ path: middleware.route.path, methods: Object.keys(middleware.route.methods).map(method => method.toUpperCase()) }];
    return middleware.handle && middleware.handle.stack ? middleware.handle.stack.filter(handler => handler.route).map(handler => ({ path: handler.route.path, methods: Object.keys(handler.route.methods).map(method => method.toUpperCase()) })) : [];
  });

  const groupedRoutes = routes.reduce((acc, route) => {
    route.methods.forEach(method => { acc[method] = acc[method] || []; acc[method].push(route.path); });
    return acc;
  }, {});

  spinner.succeed(chalk.green('Endpoints retrieved successfully'));
  res.json(groupedRoutes);
});

app.get('/status', (req, res) => {
  spinner.start('💻 Retrieving server status...');
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  const status = {
    status: 'OK',
    message: 'Server is running smoothly',
    timestamp: new Date().toISOString(),
    system: { platform: os.platform(), hostname: os.hostname(), osType: os.type(), arch: os.arch(), release: os.release() },
    resources: {
      cpuUsage: process.cpuUsage(),
      totalMemory: `${(totalMemory / 1024 / 1024).toFixed(2)} MB`,
      freeMemory: `${(freeMemory / 1024 / 1024).toFixed(2)} MB`,
      usedMemory: `${(usedMemory /  1024 / 1024).toFixed(2)} MB`,
      memoryUsage: `${((usedMemory / totalMemory) * 100).toFixed( 2)}%`,
    },
    node: {
      version: process.version,
      uptime: `${process.uptime().toFixed(2)} seconds`,
      memoryUsage: {
        rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(process.memoryUsage().external / 1024 / 1024).toFixed(2)} MB`,
      }
    }
  };

  spinner.succeed(chalk.green('Server status retrieved successfully'));
  res.json(status);
});

app.use((req, res) => {
  console.log(chalk.yellow('[WARN] 404 Not Found:'), req.originalUrl);
  res.status(404).sendFile(path.join(__dirname, '../src', 'html', 'error.html'));
});

app.use((err, req, res, next) => {
  console.error(chalk.red('[ERROR] An error occurred:'), err);
  res.status(500).send('Something broke!');
});

const gracefulShutdown = signal => {
  console.log(chalk.yellow(`Received ${signal}. Shutting down gracefully...`));
  server.close(err => {
    if (err) {
      console.error(chalk.red('Error during server close:'), err);
      process.exit(1);
    } else {
      console.log(chalk.green('Closed out remaining connections.'));
      process.exit(0);
    }
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (reason, promise) => console.warn(chalk.yellow('Unhandled Rejection at Promise:'), { reason, promise }));
process.on('rejectionHandled', promise => console.info(chalk.blue('Handled Rejection:'), { promise }));
process.on('uncaughtException', error => {
  console.error(chalk.red('Uncaught Exception thrown:'), error);
  process.exit(1);
});
process.on('uncaughtExceptionMonitor', error => console.error(chalk.red('Monitored Uncaught Exception:'), error));
process.on('warning', warning => console.warn(chalk.yellow('Node.js Warning:'), warning));

export default app;
