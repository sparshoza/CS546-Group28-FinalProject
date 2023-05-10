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

//middlewares
app.get("/", (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/homepage");

    
  } else if (req.session.user) {
    return res.redirect("/protected");
  } else {
    next();
  }

 
 
});

app.get("/login", (req, res, next) => {
  if (req.session.user) {
   
    
      return res.redirect('/protected')
    
  }


  next();
});


app.get("/homepage", (req, res, next) => {
  if (req.session.user) {
   
    
      return res.redirect('/protected')
    
  }


  next();
});


app.use("/register", (req, res, next) => {
  if (!req.session.user) {
    next();
    // return res.redirect('/login');
  }  else if (req.session.user) {
    return res.redirect("/protected");
  } else {
    next();
  }
});

app.use("/protected", (req, res, next) => {
  if (!req.session.user) {

    return res.redirect('/login');

    }

  next();
});

app.use("/index", (req, res, next)=> 
{
  if (!req.session.user)
  {
    return res.redirect('/login')
  }

  next()
})


app.use("/logout", (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  next();
});

app.use((req, res, next)=> {
  let method = req.method;
  let url = req.originalUrl
  let time = new Date().toUTCString();
  let auth = '';

  if (req.session.user)
  {
    auth = "Authenticated User";
  }
  else
  {
    auth = "Non-Authenticated User";
  }

  console.log( `[${time}]: ${method} ${url} (${auth})`);


  next();

})









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
