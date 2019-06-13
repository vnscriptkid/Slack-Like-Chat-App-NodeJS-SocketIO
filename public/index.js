const socket = io('http://localhost:8000');
const socketcompany1 = io('http://localhost:8000/company1');

socket.on('connect', () => {
    document.querySelector('#msgForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = document.querySelector('#msgInput').value;
        document.querySelector('#msgInput').value = "";
        socket.emit('msgFromClient', {
            msg
        });
    })

    socket.on('msgToClients', ({
        msg,
        userId
    }) => {
        const isYours = userId === yourId;
        document.querySelector('#msgList').innerHTML += `<li class="msgItem ${ isYours? 'text-left' : 'text-right'}">
                    ${isYours ? 'You: ' : 'Someone else: '}${msg}
                </li>`;
    })

    socket.on('welcomeMsg', ({
        msg,
        userId
    }) => {
        window.yourId = userId;
        document.querySelector('#msgList').innerHTML += `<li class="msgItem msgItem--welcome">${msg}</li>`;
    })
})

socketcompany1.on('connect', () => {
    
})