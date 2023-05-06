//for backend js 

export default function chat(io, socket, onlineUsers, channels) {

     console.log("inchat js")

     socket.on('new user', (username) => {

        //for online users
        onlineUsers[username] = socket.id;
        //saving username to socket 
        socket['username'] = username;

        console.log(`${username} has joined the chat! ✋`);

        io.emit("new user", username);
      })
        //for the create channel 

    socket.on('new channel', (newChannel) => {
    //Save the new channel to our channels object. The array will hold the messages.
    channels[newChannel] = [];
    //Have the socket join the new channel room.
    socket.join(newChannel);
    //Inform all clients of the new channel.
    io.emit('new channel', newChannel);
    //Emit to the client that made the new channel, to change their channel to the one they made.
    socket.emit('user changed channel', {
      channel : newChannel,
      messages : channels[newChannel]
    });
  });


       //Listen for new messages

       socket.on('new message', (data) => {
        //Save the new message to the channel.
        channels[data.channel].push({sender : data.sender, message : data.message});
        //Emit only to sockets that are in that channel room.
        io.to(data.channel).emit('new message', data);
      });
  socket.on('get online users', () => {
    //Send over the onlineUsers
    socket.emit('get online users', onlineUsers);
  })

  socket.on('disconnect', () => {
    //This deletes the user by using the username we saved to the socket
    delete onlineUsers[socket.username]
    io.emit('user has left', onlineUsers);
  });

  socket.on('user changed channel', (newChannel) => {
    socket.join(newChannel);
    socket.emit('user changed channel', {
      channel : newChannel,
      messages : channels[newChannel]
    });
  });
  

 

    // Future socket listeners will be here
  }