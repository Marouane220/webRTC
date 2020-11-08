const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '8889'
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
  }).then(stream => {

      addVideoStream(myVideo, stream)

      myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream' , userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
      })

      socket.on('user-connected', userId => {
        appendMessage(`${name} connected`)
        connectToNewUser(userId, stream)
      })
    })

socket.on('user-disconnected', userId => {
    peers[userId].close()
    appendMessage(`${name} disconnected`)
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream){

  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')

  call.on('stream', userVideoStream =>{
    addVideoStream(video, userVideoStream)
  })

  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call

}


function addVideoStream(video, stream){
  video.srcObject = stream
  video.addEventListener('loadedmetadata', ()=> {
  video.play()
  })
  videoGrid.append(video)
}

//chat
const messageContainer = document.getElementById("message-container")
const messageForm = document.getElementById("send-container")
const messageInput = document.getElementById("message-input")
const name = prompt("what is your name ?")


socket.on('chat-message', (data) =>{
  appendMessage(`${data.name}: ${data.message}`)
})

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  appendMessage('You: '+ message)
  socket.emit('send-chat-message', message)
  messageInput.value = ''
})

function appendMessage(message){
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}
