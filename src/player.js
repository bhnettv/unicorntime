import Vue from 'vue';
import { spawn } from 'child_process';
import commandExists from 'command-exists';
import { platform } from 'process';
import net from 'net';
import store from './store';

const spawnMpv = (args, withIpc) => new Promise((resolve, reject) => {
  const mpvRef = spawn('mpv', args, {
    detached: true,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  mpvRef.unref();

  let resolved = false;

  mpvRef.stdout.on('data', (data) => {
    const output = data.toString();
    // Do something with the data to prevent spawned process termination
    console.log(`Stdout: ${output}`);

    if (!resolved) {
      if (!withIpc || output.match(/Listening/)) {
        resolved = true;
        resolve(mpvRef);
      } else if (output.match(/bind/)) {
        resolved = true;
        reject(new Error('MPV spawn failed to bind IPC socket'));
      }
    }
  });
});

const player = async (name, src, duration = 0, resume = null, contentInfoId = null) => {
  resume = resume || 0;

  try {
    await commandExists('mpv');
  } catch (err) {
    // eslint-disable-next-line no-alert
    alert('MPV not found');
    throw new Error('MPV not found');
  }


  const isMock = process.env.VUE_APP_API_CLIENT !== 'server';

  // Keep track of the current player time for the "Resume" feature
  const ipcPath = platform === 'win32' ? '\\\\.\\pipe\\mpvserver' : '/tmp/node-mpv.sock';
  let currentTimeInterval = null;
  // Don't track for null contentInfoId (ex: Trailer)
  const shouldSpawnIPC = contentInfoId !== null;

  let uniOptions = [
    '-user-agent',
    'SEI-RTSP',
    '-rtsp-transport',
    'udp',
    '--demuxer-lavf-o',
    'max_delay=0',
    '--force-media-title',
    name,
  ];

  if (shouldSpawnIPC) {
    uniOptions = [
      ...uniOptions,
      '--input-ipc-server',
      ipcPath,
      '--msg-level=ipc=v',
    ];
  }

  if (resume > 0) {
    uniOptions = [
      ...uniOptions,
      `--start=${resume}`,
    ];
  }

  if (isMock) {
    uniOptions = [];
  }

  const mpvRef = await spawnMpv([...uniOptions, src], shouldSpawnIPC);

  mpvRef.on('exit', () => {
    // Stop the interval when player is closed
    clearInterval(currentTimeInterval);
  });

  if (shouldSpawnIPC) {
    // Initialize IPC socket
    const socket = new net.Socket();
    socket.setMaxListeners(0);
    socket.connect({
      path: ipcPath,
    });

    socket.on('data', (data) => {
      // Multiple messages can come in single event
      const messages = data.toString().split('\n');

      messages.forEach((message) => {
        // empty messages may occur
        if (message.length > 0) {
          const JSONMessage = JSON.parse(message);
          if ('data' in JSONMessage && 'error' in JSONMessage) {
            if (JSONMessage.error === 'success') {
              const currentSeconds = Math.floor(JSONMessage.data);
              store.dispatch('SET_MOVIE_POSITION', {
                contentInfoId,
                position: currentSeconds,
              });

              // Consider it watched if more than 90% elapsed
              if (100 / duration * currentSeconds > 90) {
                store.dispatch('SET_MOVIE_WATCHED', contentInfoId);
              }
            }
          }
        }
      });
    });

    // Request current time periodically
    currentTimeInterval = setInterval(() => {
      try {
        // eslint-disable-next-line prefer-template
        socket.write(JSON.stringify({
          command: ['get_property', 'time-pos'],
        }) + '\n');
      } catch (err) {
        console.log('get_property IPC socket write failed', err);
      }
    }, 3000);
  }

  return mpvRef;
};

const PlayerPlugin = {
  install() {
    Vue.player = player;
    Vue.prototype.$player = player;
  },
};

export default PlayerPlugin;
