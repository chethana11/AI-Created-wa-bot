const { default: makeWASocket, useSessionIdAuthState } = require('@adiwajshing/baileys');

const sessionId = process.env.SESSION_ID; // Read SESSION_ID from environment variables

const { state, saveState } = useSessionIdAuthState(sessionId);

const sock = makeWASocket({
    auth: state
});

// Automatically save authentication state whenever it's updated
sock.ev.on('creds.update', saveState);

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
