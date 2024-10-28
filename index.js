const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const fs = require('fs');
const ytdl = require('ytdl-core');
const { exec } = require('child_process');

const { state, saveState } = useSingleFileAuthState('auth_info_baileys.json');

const sock = makeWASocket({
    auth: state
});

sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
        console.log('Connection closed. Reconnecting...', lastDisconnect.error);
        startSock();
    } else if (connection === 'open') {
        console.log('Connected');
        sock.sendMessage(sock.user.id, { text: 'Bot is alive!' });
    }
});

sock.ev.on('messages.upsert', async (msg) => {
    const message = msg.messages[0];
    if (!message.key.fromMe && message.message) {
        const command = message.message.conversation;

        if (command.startsWith(',')) {
            const args = command.slice(1).trim().split(/ +/);
            const cmd = args.shift().toLowerCase();

            if (cmd === 'yt') {
                const url = args[0];
                if (!url) {
                    sock.sendMessage(message.key.remoteJid, { text: 'Please provide a YouTube URL.' });
                    return;
                }

                const videoId = ytdl.getURLVideoID(url);
                const info = await ytdl.getInfo(videoId);
                const title = info.videoDetails.title;

                sock.sendMessage(message.key.remoteJid, { text: `Downloading ${title}...` });

                ytdl(url, { format: 'mp4' })
                    .pipe(fs.createWriteStream(`${title}.mp4`))
                    .on('finish', () => {
                        sock.sendMessage(message.key.remoteJid, {
                            text: `Download complete!`,
                            caption: `Here is your video:`,
                            video: fs.createReadStream(`${title}.mp4`)
                        });
                    });
            }
        }
    }
});

sock.connect();

