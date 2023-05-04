//import express, express router as shown in lecture code

import { Router } from "express";
import * as helpers from "../helpers.js";
import user from "../data/users.js";
const router = Router();

import multer from "multer";

//middlware and initialization for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, req.body.emailAddressInput+".jpeg");
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});
const upload = multer({ storage: storage });

//routes starts

router.route("/").get(async (req, res) => {
  try {
    return res.json({ error: "in / route" });
  } catch (e) {
    return res.json({ error: "error in error" });
  }
});

router
  .route("/register")
  .get(async (req, res) => {
    //code here for GET
    res.render("register");
  })
  .post(upload.single("uploadPicture"), async (req, res, next) => {
    //code here for POST
    try {
      const regData = req.body; // getting data from form

      //storing individual fields data from the form

      const firstName = regData.firstNameInput;
      const lastName = regData.lastNameInput;
      const email = regData.emailAddressInput;
      const gradYear = regData.graduationYear;
      const password = regData.passwordInput;

      const confirmPassword = regData.confirmPasswordInput;

//error handling for other fields
//error handling server side including handlebars
      if (!firstName || !lastName || !email || !password || !confirmPassword ) {
        return res.status(400).render('register', {error: "enter something"});
      }
      if (!helpers.validateEmail(email))
      {
        return res.status(400).render('register',{error:"wrong email format"})
      }

      if (typeof firstName !== "string" || typeof lastName !== "string") {
        return res.status(400).render('register',{ error: "bad data type" });
      }

      if (helpers.checkSymbols(firstName) || helpers.checkSymbols(lastName)) {
        return res.status(400).render('register',{ error: "No symbols in names" });
      }
      if (helpers.checkNumbers(firstName) || helpers.checkNumbers(lastName)) {
        return res.status(400).render('register',{ error: "no numbers in names" });
      }
      if (firstName.length < 2 || firstName.length > 25) {
        return res
          .status(400)
          .render('register',{ error: "First name length betwween 2 and 25" });
      }
      if (lastName.length < 2 || lastName.length > 25) {
        return res
          .status(400)
          .render('register',{ error: "Last Name length between 2 and 25" });
      }

      if (password.length < 8) {
        return res.status(400).render('register',{ errorPassword: "password length less than 8" });
      }

      if (!helpers.validatePassword(password)) {
        return res
          .status(400)
          .render('register',{ errorPassword: "enter atleast one special character" });
      }

      if (!gradYear)
      {
        return res
        .status(400)
        .render('register',{ graduationYearerror: "Enter Graduation Year" });
        
      }

      
      if ( gradYear < new Date().getFullYear() || gradYear > new Date().getFullYear() + 5)
      {
        return res
        .status(400)
        .render('register',{ graduationYearerror: "Range within 5 years from now" });
        
      }

      // if (!helpers.checkNumbers(password)) {
      //   return res.status(400).render('register',{ errorPassword: "Enter atleast one number" });
      // }
      // if (!helpers.checkLowerCase(password)) {
      //   return res.status(400).render('register',{ errorPassword: "Enter atleast one lower case" });
      // }
      // if (!helpers.checkUpperCase(password)) {
      //   return res.status(400).render('register',{ errorPassword: "Enter atleast one uppercase" });
      // }

      // if (helpers.checkBlankChars(password)) {
      //   return res.status(400).render('register',{ errorPassword: "blank in password" });
      // }

      if (password !== confirmPassword) {
        return res.status(400).render('register',{ errorConfirmPassword: "password did not match" });
      }

     

      

    



      //error handling for courses in array
      let courseField = req.body.courseFieldsInput; // taking in no of courses from 1-4
      let courses = []; //storing the courses in this array

      courseField = parseInt(courseField); //converting from string to number

      if (!courseField || courseField == 0) {
        //checking whether user has selected any courses
        return res.render("register", {
          courseError: "You have to select atleast one course",
        });
      }
      //further error handling  and adding courses to the array
      let field = "";
      for (let courseNo = 1; courseNo <= courseField; courseNo++) {
        field = "field" + `${courseNo}`;
        let reqfield = req.body[field];
        reqfield = reqfield.toLowerCase();
        reqfield = reqfield.trim();

        if (!reqfield || typeof reqfield === "undefined") {
          return res.render("register", {
            courseError: "enter a CS course (CSXXX) XXX-> course codes",
            coursefield: reqfield,
          });
        }
        if (reqfield.length !== 5) {
          return res.render("register", {
            courseError: "incorrect code",
            coursefield: reqfield,
          });
        }

        if (reqfield.slice(0, 2) !== "cs") {
          return res.render("register", {
            courseError: "ONLY CS COURSES",
            coursefield: reqfield,
          });
        }

        let reqfieldCode = parseInt(reqfield.slice(2, 5));
        console.log(typeof reqfieldCode);
        if (typeof reqfieldCode !== "number") {
          return res.render("register", {
            courseError: "Only numbers as codes",
            coursefield: reqfield,
          });
        }

        if (reqfieldCode < 101 || reqfieldCode > 900) {
          return res.render("register", {
            courseError: "Code range between 101 and 900",
            coursefield: reqfield,
          });
        }

        courses.push(reqfield); //final array addition
      }
      //final error handling
      if (new Set(courses).size !== courses.length) {
        return res.render("register", { courseError: "No same courses" });
      }


      //inserting the requested body in db
      const createUser = await user.create(
        firstName,
        lastName,
        email,
        password,
        courses,
        gradYear
      );

      if (createUser) {
        console.log(createUser);
        return res.render("login",);
      } else {
        res.render("error", { error: "User already exists." });
      }

      
      next();
    } catch (e) {
      console.log(e);
      res.status(400).render("error", { error: e });
    }
  });



router
  .route("/login")
  .get(async (req, res) => {
    //code here for GET
    res.render("login", {});
  })
  .post(async (req, res) => {
    //code here for POST
    // const { email, password } = req.body;
    let email = req.body.emailAddressInput
    let password = req.body.passwordInput

    if (!email || !password) {
      return res
        .status(400)
        .render("login", {
          errorMessage: "Please provide a valid email address and password.",
        });
    }

     email = email.trim().toLowerCase();
    if (! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .render("login", {
          errorMessage: "Please provide a valid email address.",
        });
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .render("login", {
          errorMessage:
            "Please provide a valid password (at least 8 characters long, with one uppercase letter, one number and one special character).",
        });
    }

    try {
      const checkedUser = await user.checkUser(email, password);
      if (checkedUser) {
          const authUser = checkedUser[0]
          console.log(authUser);

          req.session.user = authUser;

        // req.session.user = result;
        // if (result.role === "admin") {
        //   return res.status(200).redirect("/admin");
        // } else if (result.role === "user") {
        //   return res.status(200).redirect("/protected");
        // }
        return res.redirect('protected')
      }
    } catch (e) {
      return res
        .status(400)
        .render("login", { title: "Login", hasError: true });
    }
  });

/*try {
      const loginData = req.body;

      const email = loginData.emailAddressInput.toLowerCase();
      const password = loginData.passwordInput;

      if (!email || !password) {
        return res.status(400).render('error',{ error: "enter email or password" });
      }
      if (!helpers.validateEmail(email))
      {
        return res.status(400).render('login',{error:"wrong email format"})
      }

      const authUser = await user.checkUser(email, password);

      if (!authUser)
      {
        return res.status(400).render('login', {error: 'either password or email is wrong'})
      }
      const authUserobj = authUser[0];


      req.session.user = authUserobj
      
      if (authUserobj.role === "user") {
        res.redirect("/protected");
      }
      if (authUserobj.role === "admin") {
        res.redirect("/admin");
      }

    } catch (e) {
      
      return res.status(400).render('error',{ error: e });
    }
  });
  */

router.route("/protected").get(async (req, res) => {
  //code here for GET

  try {
    // if (req.session.user.role === "user" || req.session.user.role === "admin") {
      const date = new Date();
      console.log(req.session.user + "in protected route")
      res.render("protected", {
        userData: req.session.user,
        currentTime: date,
      });
    //}
  } catch (e) {
    console.log(e);
  }
});

router.route("/admin").get(async (req, res) => {
  //code here for GET
  try {
    if (req.session.user.role === "admin") {
      const date = new Date();
      res.render("admin", { userData: req.session.user, currentTime: date });
    }
  } catch (e) {
    return res
      .status(400)
      .render("error", { error: "Can't get access to admin" });
  }
});

router.route("/error").get(async (req, res) => {
  //code here for GET
  res.render("error");
});

router.route("/logout").get(async (req, res) => {
  //code here for GET
  req.session.destroy();
  // res.send('Logged out');

  res.render("logout");
});

export default router;
