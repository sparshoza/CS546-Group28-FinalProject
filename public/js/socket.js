
//for frontend js ajax stuff

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

  let currentUser = $('#username-input').val() ;
  socket.emit('get online users');
  socket.emit('user changed channel', "General");


  //for creating the user and adding it

  // $('#create-user-btn').click((e)=>{
  //   e.preventDefault();
    
    console.log("in create user button")
    if($('#username-input').val().length > 0){
      socket.emit('new user', $('#username-input').val());
      // Save the current user when created
      currentUser = $('#username-input').val();
      $('.username-form').remove();
      // Have the main page visible
      $('.main-container').css('display', 'flex');
    }

    // $.ajax({
    //   url: `/indexx/${coursename}`,
    //   type: 'GET',
    //   success: function( response) {
    //     console.log(response);
    //     window.location.href = '/protected';
    //   },
    //   error: function(error) {
    //     console.log('Error:', error);
    //   }
    // });
  //   $.ajax({
  //     url: '/transactions/' + transactionId,
  //     type: 'PUT',
  //     data: $('#edit-transaction-form').serialize(),
  //     success: function (result) {
  //         // Do something with the result
  //         console.log('success in request yo')
  //         window.location.href = '/transactions/seeAllTransaction';
  //     },
  //     error: function(error) {
  //         console.log(error);
  //     }
  // });

    $(document).on('click', '.channel', (e)=>{

      console.log("in .channel")

      let newChannel = e.target.textContent;
      socket.emit('user changed channel', newChannel);
    });
  // });

  //for creating the channel 
  $('#new-channel-btn').click( () => {
    console.log("in new channel button")


    let newChannel = $('#new-channel-input').val();
  
    if(newChannel.length > 0){
      // Emit the new channel to the server
      socket.emit('new channel', newChannel);
      $('#new-channel-input').val("");
    }
  });



  //for sending the message
  // $('#send-chat-btn').click((e) => {
  //   e.preventDefault();
  //   // Get the message text value
  //   let message = $('#chat-input').val();
  //   // Make sure it's not empty
  //   if(message.length > 0){
  //     // Emit the message with the current user to the server
  //     socket.emit('new message', {
  //       sender : currentUser,
  //       message : message,
  //     });
  //     $('#chat-input').val("");
  //   }
  // });

  $('#send-chat-btn').click((e) => {

    console.log("in send chat button")

    e.preventDefault();
    // Get the client's channel
    let channel = $('.channel-current').text();
    let message = $('#chat-input').val();
    if(message.length > 0) {
      socket.emit('new message', {
        sender : currentUser,
        message : message,
        //Send the channel over to the server
        channel : channel
      });
      $('#chat-input').val("");
    } });

  //socket listeners
  socket.on('new user', (username) => {

    console.log("in new user")


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

    console.log("in new message")

    //Only append the message if the user is currently in that channel
    let currentChannel = $('.channel-current').text();
    if(currentChannel == data.channel) {
      $('.message-container').append(`
        <div class="message">
          <p class="message-user">${data.sender}: </p>
          <p class="message-text">${data.message}</p>
        </div>
      `);
    }
  });

  socket.on('get online users', (onlineUsers) => {
    //You may have not have seen this for loop before. It's syntax is for(key in obj)
    //Our usernames are keys in the object of onlineUsers.
    console.log("in online users")

    for(username in onlineUsers){
      $('.users-online').append(`<div class="user-online">${username}</div>`);
    }
  })

  socket.on('user has left', (onlineUsers) => {
    console.log("in user has left")
    $('.users-online').empty();
    for(username in onlineUsers){
      $('.users-online').append(`<p>${username}</p>`);
    }
  });

  socket.on('new channel', (newChannel) => {
    console.log("in new channel")

    $('.channels').append(`<div class="channel">${newChannel}</div>`);
  });
  
  // Make the channel joined the current channel. Then load the messages.
  // This only fires for the client who made the channel.
  socket.on('user changed channel', (data) => {

    console.log("in user changed channel")

    $('.channel-current').addClass('channel');
    $('.channel-current').removeClass('channel-current');
    $(`.channel:contains('${data.channel}')`).addClass('channel-current');
    $('.channel-current').removeClass('channel');
    $('.message').remove();
    data.messages.forEach((message) => {
      $('.message-container').append(`
        <div class="message">
          <p class="message-user">${message.sender}: </p>
          <p class="message-text">${message.message}</p>
        </div>
      `);
    });
  });


})

  