import io from 'socket.io-client';
import { HOSTNAME } from './constants';

export class DomWorker {
  private nsSocket: SocketIOClient.Socket;
  private channelName: string;
  private username: string;

  constructor(
    private namespaceListEle: HTMLUListElement,
    private channelListEle: HTMLUListElement,
    private msgListEle: HTMLUListElement,
    private formEle: HTMLFormElement,
    private msgInput: HTMLInputElement,
    private channelNameEle: HTMLElement,
    private numOfMemELe: HTMLElement
  ) {
    this.formEle.addEventListener('submit', this.formSubmitHandler);
    // this.username = (window as any).username;
    // TODO: take username from prompt instead
    this.username = 'Thanh';
  }

  private formSubmitHandler = (e: Event): void => {
    e.preventDefault();
    const msg = this.msgInput.value;
    if (!msg) return;
    if (!this.nsSocket || !this.channelName || !this.username) return;
    // send msg to the channel over the namespace
    this.nsSocket.emit('msgToChannel', {
      author: this.username,
      text: msg
    });
    // populate msg to msgList
    this.populateMsgList([
      {
        author: this.username,
        text: msg,
        createdAt: Date.now()
      }
    ]);
    // clear msgInput
    this.msgInput.value = '';
  };

  public populateNsList(nsList: { id: number; name: string }[]): void {
    this.namespaceListEle.innerHTML = '';
    nsList.forEach(nsItem => {
      const { id, name } = nsItem;
      const ns = document.createElement('li');
      ns.classList.add('nsItem');
      ns.innerText = `${id}. ${name}`;
      ns.addEventListener('click', () => this.nsClickHandler(nsItem));
      this.namespaceListEle.appendChild(ns);
    });
  }

  private nsClickHandler(nsItem: { id: number; name: string }): void {
    const nsSocket = io(`${HOSTNAME}/${nsItem.name}`);
    nsSocket.on('connect', () => {
      console.log(`Connected to Namespace ${nsItem.name}`);
      this.nsSocket = nsSocket;
    });
    nsSocket.on(nsItem.name, channelList =>
      // TODO: refactor not to pass around nsSocket
      this.populateChannelList(channelList, nsSocket)
    );
  }

  private populateChannelList = (
    channelList: { id: number; name: string }[],
    nsSocket: SocketIOClient.Socket
  ) => {
    this.channelListEle.innerHTML = '';
    channelList.forEach(channel => {
      const item = document.createElement('li');
      item.classList.add('channelItem');
      item.innerText = channel.name;
      item.addEventListener('click', () =>
        this.channelClickHandler(channel, nsSocket)
      );
      this.channelListEle.append(item);
    });
  };

  private channelClickHandler = (
    channel: { id: number; name: string },
    nsSocket: SocketIOClient.Socket
  ) => {
    // subscribe to the channel to get all the messages
    nsSocket.emit('joinChannel', channel.name);
    // Run when first join the channel only
    nsSocket.on(
      'channelUpdate',
      (data: { numOfMembers: number; msgList: []; channelName: string }) => {
        const { numOfMembers, msgList, channelName } = data;
        this.channelName = channelName;
        this.populateMsgList(msgList);
        this.populateChannelName();
        this.updateNumOfMembers(numOfMembers);
      }
    );
    nsSocket.on('updateMembers', (total: number) =>
      this.updateNumOfMembers(total)
    );
    nsSocket.on(
      'newMsgFromChannel',
      (msg: { author: string; text: string; createdAt: number }) => {
        this.populateMsgList([msg]);
      }
    );
  };

  private populateMsgList = (
    msgList: { author: string; text: string; createdAt: number }[]
  ) => {
    msgList.forEach(msg => {
      const msgEle = document.createElement('li');
      msgEle.classList.add('msgItem');
      msgEle.innerHTML = `
        <span>${msg.author}<span>
        <span>${msg.text}<span>
        <span>${msg.createdAt}<span>
      `;
      this.msgListEle.appendChild(msgEle);
    });
  };

  private populateChannelName = () => {
    this.channelNameEle.innerText = this.channelName;
  };

  private updateNumOfMembers = (total: number) => {
    this.numOfMemELe.innerText = total.toString() + ' people';
  };
}
