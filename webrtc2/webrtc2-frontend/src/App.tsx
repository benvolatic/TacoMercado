import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

// 📡 WebRTC Signaling Server
const SIGNALING_SERVER =
  "https://ascii-marker-limousines-occasional.trycloudflare.com";
const socket = io(SIGNALING_SERVER, { transports: ["websocket"] });

const App: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [roomId] = useState("test-room"); // Static Room ID for simplicity

  useEffect(() => {
    socket.emit("join", roomId);
    console.log(`✅ Joined Room: ${roomId}`);

    async function setupMedia() {
      try {
        // ✅ Get camera and microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // ✅ Create WebRTC Peer Connection
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        // ✅ Add media tracks to WebRTC connection
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        peerConnectionRef.current = pc; // Store latest peerConnection

        // ✅ Handle receiving a remote stream
        pc.ontrack = (event) => {
          console.log("🎥 Received Remote Stream");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // ✅ Send ICE Candidates to the signaling server
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("📡 ICE Candidate Found:", event.candidate);
            socket.emit("ice-candidate", {
              room: roomId,
              candidate: event.candidate,
            });
          }
        };

        // ✅ Handle incoming offers
        socket.on("offer", async (data) => {
          console.log("📞 Incoming Offer:", data);
          if (!peerConnectionRef.current) return;

          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );
          console.log("✅ Remote Offer Set");

          // Enable "Answer Call" button
          setIsCalling(true);
        });

        // ✅ Handle incoming answers
        socket.on("answer", async (data) => {
          const peerConnection = peerConnectionRef.current;
          if (!peerConnection) return;

          if (peerConnection.signalingState !== "have-local-offer") {
            console.warn(
              "⚠️ Ignoring answer: PeerConnection is not in the right state."
            );
            return;
          }

          try {
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
            console.log("✅ Answer received & set");
          } catch (error) {
            console.error("🚨 Error setting remote description:", error);
          }
        });

        // ✅ Handle incoming ICE candidates
        socket.on("ice-candidate", async (data) => {
          console.log("📡 ICE Candidate Received:", data.candidate);
          if (!peerConnectionRef.current) return;
          try {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(data.candidate)
            );
          } catch (err) {
            console.error("❌ Error adding ICE candidate", err);
          }
        });

        // ✅ Handle Hang Up (Received)
        socket.on("hangup", () => {
          console.log("🚫 Call Ended by Other Peer");
          endCall();
        });
      } catch (error) {
        console.error("❌ Error accessing media devices:", error);
      }
    }

    setupMedia();
  }, []);

  // ✅ Start a new call (send an offer)
  const startCall = async () => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) return;

    console.log("📞 Start Call button clicked!");

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log("✅ Offer created & set:", offer);

      socket.emit("offer", { room: roomId, offer });
      setIsInCall(true);
    } catch (error) {
      console.error("❌ Error starting call:", error);
    }
  };

  // ✅ Answer an incoming call
  const answerCall = async () => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) return;

    console.log("📞 Answer Call button clicked!");

    try {
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log("✅ Answer created & set:", answer);

      socket.emit("answer", { room: roomId, answer });
      setIsCalling(false); // Hide "Answer Call" button after answering
      setIsInCall(true);
    } catch (error) {
      console.error("❌ Error answering call:", error);
    }
  };

  // ✅ Hang Up (End Call)
  const endCall = () => {
    console.log("🚫 Hang Up button clicked!");

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current?.srcObject) {
      (remoteVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      remoteVideoRef.current.srcObject = null;
    }

    socket.emit("hangup", { room: roomId });

    setIsInCall(false);
    setIsCalling(false);
  };

  return (
    <div>
      <h1>WebRTC Video Call</h1>
      <video ref={localVideoRef} autoPlay playsInline></video>
      <video ref={remoteVideoRef} autoPlay playsInline></video>
      {!isInCall && <button onClick={startCall}>Start Call</button>}
      {isCalling && <button onClick={answerCall}>Answer Call</button>}
      {isInCall && <button onClick={endCall}>Hang Up</button>}
    </div>
  );
};

export default App;
