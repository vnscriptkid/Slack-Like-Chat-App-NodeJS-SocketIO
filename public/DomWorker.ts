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
    this.username = (window as any).username;
    // TODO: take username from prompt instead
  }

  // 6. When user send a msg to a channel
  private formSubmitHandler = (e: Event): void => {
    e.preventDefault();
    const msg = this.msgInput.value;
    if (!msg) return;
    if (!this.nsSocket || !this.channelName || !this.username) return;
    // send msg to the channel over the namespace
    this.nsSocket.emit('msgToChannel', {
      // author: this.username,
      text: msg
    });
    // populate msg to msgList (client side job, works even network failed)
    this.populateMsgList(
      [
        {
          author: this.username,
          text: msg,
          createdAt: Date.now()
        }
      ],
      true
    );
    // clear msgInput
    this.msgInput.value = '';
  };

  // 1. When user first goes to page
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

  // 2. When user clicks to one namespace
  private nsClickHandler(nsItem: { id: number; name: string }): void {
    // close current nsSocket if it exists
    if (this.nsSocket) {
      this.nsSocket.close();
    }
    const nsSocket = io(`${HOSTNAME}/${nsItem.name}`);
    nsSocket.on('connect', () => {
      console.log(`Connected to Namespace ${nsItem.name}`);
      this.nsSocket = nsSocket;
    });
    nsSocket.on(nsItem.name, channelList =>
      // TODO: refactor not to pass around nsSocket
      this.populateChannelList(channelList)
    );
  }

  // 3. Channels is populated when user clicks to one namespace
  private populateChannelList = (
    channelList: { id: number; name: string }[]
  ) => {
    this.channelListEle.innerHTML = '';
    channelList.forEach(channel => {
      const item = document.createElement('li');
      item.classList.add('channelItem');
      item.innerText = channel.name;
      item.addEventListener('click', () => this.channelClickHandler(channel));
      this.channelListEle.append(item);
    });
  };

  // 4. When user clicks to one channel
  private channelClickHandler = (channel: { id: number; name: string }) => {
    // subscribe to the channel to get all the messages
    this.nsSocket.emit('joinChannel', channel.name);
    // Run when first join the channel only
    this.nsSocket.on(
      'channelUpdate',
      (data: { msgList: []; channelName: string }) => {
        const { msgList, channelName } = data;
        this.channelName = channelName;
        this.populateMsgList(msgList);
        this.populateChannelName();
        // this.updateNumOfMembers(numOfMembers);
      }
    );
    this.nsSocket.on('updateMembers', (total: number) =>
      this.updateNumOfMembers(total)
    );
    this.nsSocket.on(
      'newMsgFromChannel',
      (msg: { author: string; text: string; createdAt: number }) => {
        this.populateMsgList([msg], true);
      }
    );
  };

  // 5. Msg List in one channel is populated when (4) user clicks to one channel
  private populateMsgList = (
    msgList: { author: string; text: string; createdAt: number }[],
    update?: boolean
  ) => {
    if (!update) this.msgListEle.innerHTML = '';
    msgList.forEach(msg => {
      const msgEle = document.createElement('li');
      msgEle.classList.add('msgItem');
      msgEle.innerHTML = `
        <span>${msg.author}<span>
        <span>${msg.text}<span>
        <span>${msg.createdAt}<span>
      `;
      this.msgListEle.appendChild(msgEle);
      // Scroll to bottom
      this.msgListEle.scrollTo(0, this.msgListEle.scrollHeight);
    });
  };

  // 5. Channel Name is populated when (4) user clicks to one channel
  private populateChannelName = () => {
    this.channelNameEle.innerText = this.channelName;
  };

  // 5. Number of members is populated when (4) a user joins a channel
  private updateNumOfMembers = (total: number) => {
    this.numOfMemELe.innerText = total.toString() + ' people';
  };
}
