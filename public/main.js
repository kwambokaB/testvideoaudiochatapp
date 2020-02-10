let Peer = require('simple-peer');
let socket = io();
const video = document.querySelector("video");
let client = {};

// get permission to stream
navigator.mediaDevices.getUserMedia({video:true, audio:true})
.then(stream =>{
    socket.emit('NewClient')
    video.srcObject = stream
    video.play()
    function initPeer(){
        let Peer = new Peer({initiator:(type=='init') ? true : false,
          stream: stream , trickle: false
    })
    Peer.on('stream', function(stream){
        // call createVideo
        createVideo(stream)
    })
    Peer.on('close', function(){
        document.getElementById('peerVideo').remove();
        Peer.destroy();
    })
    return Peer
    }
    // get peer of type init
    function makePeer(){
        client.gotAnswer = false
        let Peer = initPeer('init')
        Peer.on('signal',function(data){
            if(!client.gotAnswer){
               socket.emit('Offer', data)
            }
        })
        client.Peer = Peer;
    }

    // get peer of type not init
    function frontAnswer(){
        let Peer = initPeer('notinit')
        Peer.on('signal', (data)=>{
            socket.emit('Answer', data)
        })
        Peer.signal(offer)
    }
    function signalAnswer(answer){
        client.gotAnswer = true;
        let Peer = client.Peer;
        Peer.signal(answer);
    }
    function createVideo(stream){
        let video = document.createElement('video');
        video.id = 'peerDiv';
        video.class= 'embed-responsive-item';
        video.srcObject = stream;
        document.querySelector('#peerDiv').appendChild(video);
    }
    function sessionActive(){
        document.write('Session is Active')
    }
    socket.on('BackOffer', frontAnswer);
    socket.on('BackAnswer', signalAnswer);
    socket.on('SessionActive', sessionActive);
    socket.on('createPeer', makePeer);
})
.catch(err => document.write(err));
