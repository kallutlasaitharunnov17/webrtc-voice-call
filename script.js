let localStream;
let peerConnection;

const startBtn = document.getElementById("startBtn");
const endBtn = document.getElementById("endBtn");
const localSDP = document.getElementById("localSDP");
const remoteSDP = document.getElementById("remoteSDP");
const setRemoteBtn = document.getElementById("setRemoteBtn");
const remoteAudio = document.getElementById("remoteAudio");

const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

startBtn.onclick = async () => {
  startBtn.disabled = true;
  endBtn.disabled = false;

  // Get microphone
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // Create PeerConnection
  peerConnection = new RTCPeerConnection(servers);

  // Add local audio track
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  // Set remote audio
  peerConnection.ontrack = event => {
    remoteAudio.srcObject = event.streams[0];
  };

  // Gather ICE candidates
  peerConnection.onicecandidate = event => {
    if (event.candidate === null) {
      localSDP.value = JSON.stringify(peerConnection.localDescription);
    }
  };

  // Create offer
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
};

setRemoteBtn.onclick = async () => {
  const remoteDescription = JSON.parse(remoteSDP.value);
  await peerConnection.setRemoteDescription(remoteDescription);

  if (remoteDescription.type === "offer") {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    localSDP.value = JSON.stringify(peerConnection.localDescription);
  }
};

endBtn.onclick = () => {
  peerConnection.close();
  peerConnection = null;
  startBtn.disabled = false;
  endBtn.disabled = true;
  localSDP.value = "";
  remoteSDP.value = "";
  remoteAudio.srcObject = null;
};
