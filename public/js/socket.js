


// $(document).ready( () => {
//     //Connect to the socket.io server
//     const socket = io.connect();

//     $('#create-user-btn').click((e)=>{
//       e.preventDefault();
//       let username = $('#username-input').val();
//       if(username.length > 0){
//         //Emit to the server the new user
//         console.log("here in socket")
//         socket.emit('new user', username);
//         $('.username-form').remove();
//       }
//     });
//     //socket listeners
//   socket.on('new user', (username) => {
//     console.log(`✋ ${username} has joined the chat! ✋`);
//   })


//   })

$(document).ready(()=>{

  const socket = io.connect();

  let currentUser;

  $('#create-user-btn').click((e)=>{
    e.preventDefault();
    if($('#username-input').val().length > 0){
      socket.emit('new user', $('#username-input').val());
      // Save the current user when created
      currentUser = $('#username-input').val();
      $('.username-form').remove();
      // Have the main page visible
      $('.main-container').css('display', 'flex');
    }
  });
  //for sending the message
  $('#send-chat-btn').click((e) => {
    e.preventDefault();
    // Get the message text value
    let message = $('#chat-input').val();
    // Make sure it's not empty
    if(message.length > 0){
      // Emit the message with the current user to the server
      socket.emit('new message', {
        sender : currentUser,
        message : message,
      });
      $('#chat-input').val("");
    }
  });

  //socket listeners
  socket.on('new user', (username) => {
    console.log(`${username} has joined the chat`);
    // Add the new user to the online users div
    $('.users-online').append(`<div class="user-online">${username}</div>`);
  })

   //Listen for new messages
  //  socket.on('new message', (data) => {
  //   // Send that data back to ALL clients
  //   console.log(`🎤 ${data.sender}: ${data.message} 🎤`)
  //   io.emit('new message', data);

  // })

  socket.on('new message', (data) => {
    $('.message-container').append(`
      <div class="message">
        <p class="message-user">${data.sender}: </p>
        <p class="message-text">${data.message}</p>
      </div>
    `);
  })


})

  