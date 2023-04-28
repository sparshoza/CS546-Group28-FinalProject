export async function rootMiddleware(req, res, next) {
    if (req.session.user) {
        const { role } = req.session.user;
        if (role === 'admin') {
          return res.redirect('/admin');
        } else if (role === 'user') {
          return res.redirect('/protected');
        }
      } else {
        return res.redirect('/login');
      }
      next();
    };
    
export async function loginMiddleware(req, res, next) {
    if (req.session.user) {
        if (req.session.user.role === 'admin') {
          return res.redirect('/admin');
        } else if (req.session.user.role === 'user') {
          return res.redirect('/protected');
        }
      } else {
        next();
      }
    };

export async function registerMiddleware(req, res, next) {
    if (req.session.user) {
        if (req.session.user.role === 'admin') {
          return res.redirect('/admin');
        } else if (req.session.user.role === 'user') {
          return res.redirect('/protected');
        }
      } else {
        next();
      }
    };

export async function protectedMiddleware(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
      }
      next();
    };

export async function adminMiddleware(req, res, next) {
    if (!req.session.user){
        return res.redirect('/login')
    } else if (req.session.user.role === "admin"){
        return next();
    } else if (req.session.user.role === "user"){
        return res.status(403).redirect('/error');
    } else {
        next();
    }
}

export async function logoutMiddleware(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
      }
    
      next();
    };

export async function loggingMiddleware(req, res, next) {
    const timestamp = new Date().toUTCString();
    const method = req.method;
    const route = req.originalUrl;
    const authenticated = req.session.user ? "Authenticated User" : "Non-Authenticated User";
  
    console.log(`[${timestamp}]: ${method} ${route} (${authenticated})`);
  
    next();
  };