import io from 'socket.io-client';
import { DomWorker } from './DomWorker';
import { HOSTNAME } from './constants';

const username: string = prompt('Please fill in your username: ');
(window as any).username = username;

const domWorker = new DomWorker(
  document.getElementById('namespaceList') as HTMLUListElement,
  document.getElementById('channelList') as HTMLUListElement,
  document.getElementById('msgList') as HTMLUListElement,
  document.getElementById('msgForm') as HTMLFormElement,
  document.getElementById('msgInput') as HTMLInputElement,
  document.getElementById('channelName') as HTMLElement,
  document.getElementById('numOfMembers') as HTMLElement
);

// connect to global ns /
const socket = io(`${HOSTNAME}?username=${username}`);

// connected to global ns /
socket.on('connect', () => {
  console.log(socket.id);
});

// get and populate namespaces from server after establishing connection
socket.on('namespaces', (namespaces: { id: number; name: string }[]) => {
  domWorker.populateNsList(namespaces);
});
