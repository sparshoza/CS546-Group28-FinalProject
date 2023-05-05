import express from "express";
import configRoutes from "./routes/index.js";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname } from "path";
import exphbs from "express-handlebars";
import cookieParser from "cookie-parser";
import http from 'http';


// your_app.js
// import SendbirdChat from '@sendbird/chat';

// import { GroupChannelModule } from "@sendbird/chat/groupChannel";



// const sendbird = SendbirdChat.init({
//     appId: "89764C71-30B5-4EF0-982B-C1271AF6352A",
//     modules: [
//         new GroupChannelModule(),
//     ],
// });

// // The USER_ID below should be unique to your Sendbird application.
// try {
//   // The user is connected to the Sendbird server.
// } catch (err) {
//   // Handle error.
// }

// try {
//   const user1 = await sendbird.connect("adi");
//   const user2 = await sendbird.connect("ady");

//   const params = {
//     name: groupchat,
//     channelUrl:  sendbird_group_channel_258729536_4e4bce062a746d695cf7a6415baaae5e99b23ac7 ,
//     coverUrlOrImage: FILE_OR_COVER_URL,
//     operatorUserIds: ["user1", "user2"],
//     data: DATA,
//     customType: CUSTOM_TYPE,
//     // ...
//   };
  
//    // OpenChannelCreateParams can be imported from @sendbird/chat/openChannel.
//   const channel = await sendbird.openChannel.createChannel(params);

//   await channel.enter()

//   const param = {
//     message: "yoooo",
//     };
    
//     channel.sendUserMessage(param)
//     .onPending((message) => {
//     // Handle pending message.
//     })
//     .onFailed((err, message) => {
//     // Handle error.
//     })
//     .onSucceeded((message) => {
//     // Handle succeeded message. You can use the onMessageReceived() method of an event handler here.
//     });
  



// } catch (err) {
//   // Handle error.
// }










import { Server } from "socket.io";










const app = express();


//for web sockets 

 const server = http.createServer(app);

const io = new Server(server);


//config for web sockets 
io.on('connection', socket => {

    console.log("web sockets connection")
})


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import {
  rootMiddleware,
  loginMiddleware,
  registerMiddleware,
  protectedMiddleware,
  adminMiddleware,
  logoutMiddleware,
  loggingMiddleware,
} from "./middleware.js";
import { Http2ServerRequest } from "http2";
import { user } from "../../Agile solar project/team21/solar_management_backend/data/index.js";


app.use(express.json());

const staticDir = express.static(__dirname + "/public");

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
};

app.use(
  session({
    name: "AuthCookie",
    secret: "This is a secret.. shhh don't tell anyone",
    saveUninitialized: false,
    resave: false,
  })
);

app.use("/public", staticDir);
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//app.get('/', rootMiddleware);
//app.get('/login', registerMiddleware);
//app.get('/protected', protectedMiddleware);
//app.get('/admin', adminMiddleware);
//app.get('/logout', logoutMiddleware);
//app.use(loggingMiddleware)

configRoutes(app);



app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
