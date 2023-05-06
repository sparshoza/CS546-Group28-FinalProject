

export default function chat(io, socket) {

     console.log("inchat js")

     socket.on('new user', (username) => {
        console.log(`${username} has joined the chat! ✋`);

        io.emit("new user", username);
      })

       //Listen for new messages
  socket.on('new message', (data) => {
    // Send that data back to ALL clients
    console.log(`🎤 ${data.sender}: ${data.message} 🎤`)
    io.emit('new message', data);
  })
    // Future socket listeners will be here
  }