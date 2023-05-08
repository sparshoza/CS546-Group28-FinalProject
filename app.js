import express from "express";
import configRoutes from "./routes/index.js";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname } from "path";
import exphbs from "express-handlebars";
import cookieParser from "cookie-parser";
import {
  rootMiddleware,
  loginMiddleware,
  registerMiddleware,
  protectedMiddleware,
  adminMiddleware,
  logoutMiddleware,
  loggingMiddleware,
} from "./middleware.js";

import  chat from "./public/js/chat.js"

import { createServer } from "http";
import { Server } from "socket.io";
import courses from "./data/courses.js";

const app = express();











const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



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

app.use(express.static('public', {
  extensions: ['html', 'handlebars'],
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.handlebars')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));

// app.get('/', rootMiddleware);
// app.get('/login', registerMiddleware);
// app.get('/protected', protectedMiddleware);
// app.get('/admin', adminMiddleware);
// app.get('/logout', logoutMiddleware);
// app.use(loggingMiddleware)


//websocket final config


const httpServer = createServer(app);
const io = new Server(httpServer, {
  // ...
});

const channelList = await courses.getAll();
let channels = {"General" : []};
// console.log(channelList)

for (let chname of channelList)
{
    channels[chname.courseCode] = []
}

let onlineUsers = {}


io.on("connection", (socket) => {
  

    chat(io,socket, onlineUsers, channels)

    console.log("new user connected")
});

configRoutes(app);


httpServer.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
