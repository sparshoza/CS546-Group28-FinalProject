import express from 'express';
const app = express();
import configRoutes from './routes/index.js'
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { rootMiddleware,
    loginMiddleware,
    registerMiddleware,
    protectedMiddleware,
    adminMiddleware,
    logoutMiddleware,
    loggingMiddleware } from './middleware.js'

app.use(cookieParser());

const staticDir = express.static(__dirname + '/public');

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }
    next();
};

app.use
    (session({
        name: 'AuthCookie',
        secret: "This is a secret.. shhh don't tell anyone",
        saveUninitialized: false,
        resave: false
    }));

app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

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
})
