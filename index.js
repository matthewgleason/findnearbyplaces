const express = require("express");
const cors = require("cors");
const api = require("./api");
// made change - dummy push
const application = express();
const port = process.env.PORT || 4002;
const { v4: uuid } = require("uuid");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const frontEnd = "http://localhost:3000";

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    console.log("Inside local strategy callback");
    api
      .login(email, password)
      .then((x) => {
        console.log(x);
        //if (x.isValid) {
        let user = { id: x.id, name: x.name, email: email };
        console.log(user);
        return done(null, user);
        //} else {
        //  console.log("The email or password is not valid.");
        //  return done(null, false, "The email or password was invalid");
        //}
      })
      .catch((e) => {
        //console.log(e);
        //return done(e);
        console.log("The email or password is not valid.");
        return done(null, false, "The email or password was invalid");
      });
  })
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: "/return/twitter",
    },
    (token, tokenSecret, profile, done) => {
      console.log("inside passort twitter...");
      let user = {
        id: profile.id,
        name: profile.displayName,
        username: profile.username,
      };
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  console.log(
    "Inside serializeUser callback. User id is save to the session file store here"
  );
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  console.log("Inside deserializeUser callback");
  console.log(`The user id passport saved in the session file store is: ${id}`);
  const user = { id: id };
  done(null, user);
});

application.listen(port, () =>
  console.log(`Application is listening in on port ${port}.`)
);

application.use(express.json());
application.use(cors());

application.use(
  session({
    genid: (request) => {
      //console.log(request);
      console.log("Inside session middleware genid function");
      console.log(`Request object sessionID from client: ${request.sessionID}`);

      return uuid(); // use UUIDs for session IDs
    },
    store: new FileStore(),
    secret: "some random string",
    resave: false,
    saveUninitialized: true,
  })
);
application.use(passport.initialize());
application.use(passport.session());

application.get("/login/twitter", passport.authenticate("twitter"));

application.get("/return/twitter", (request, response, next) => {
  console.log("Inside Get twitter /login callback");
  passport.authenticate("twitter", (err, user, info) => {
    console.log("Inside passport.authenticate() callback");

    //console.log(request);
    request.login(user, (err) => {
      console.log("Inside req.login() callback");
      console.log(`req.session.passport: ${JSON.stringify(request.session)}`);
      console.log(`req.user: ${JSON.stringify(request.user)}`);
      console.log(`Request object sessionID from client: ${request.sessionID}`);
      //console.log(request.query);
      //return response.json({ done: true, message: 'The customer logged in.' });
      response.redirect(
        frontEnd + `/#/twitter/${request.user.username}/${request.user.name}`
      );
    });
  })(request, response, next);
});

application.get("/quizzes", (request, response) => {
  api.getAllQuizzes();
  console.log(api.getAllQuizzes());
});

application.get("/logout", function (request, response, next) {
  request.logout();
  response.json({ done: true, message: "The customer logged out." });
});

application.get(
  "/twitter/verify/:username",
  function (request, response, next) {
    let username = request.params.username;
    console.log("in /twitter/verify/:username");
    console.log(request.user);
    if (request.isAuthenticated()) {
      if (request.user.username === username) {
        response.json({ done: true, message: "The customer logged in." });
      }
    } else {
      response.json({
        done: false,
        message: "The customer has not been logged in.",
      });
    }
  }
);

application.get("/flowers", (request, response) => {
  api
    .getFlowers()
    .then((x) => {
      response.send(x.rows);
      console.log("worked flowers");
      console.log(x.rows);
    })
    .catch((e) => response.json({ message: "Could not get flowers." }));
});

application.get("/quiz/:id", (request, response) => {
  let id = request.params.id;
  api
    .getQuiz(id)
    .then((x) => {
      console.log(x.rows);
      response.send(x.rows);
    })
    .catch((e) => {
      console.log(e);
      console.log("count not find rows");
    });
});

application.post("/score", (request, response) => {
  let score = request.body.score;
  let quizid = request.body.quizid;
  let quiztaker = request.body.quiztaker;
  api
    .setScore(score, quizid, quiztaker)
    .then((x) =>
      response.status(200).send({ done: true, message: "Score added" })
    )
    .catch((e) =>
      response.send({ done: false, message: "Could not add score." })
    );
});

application.get("/scores/:quiztaker/:quizid", (request, response) => {
  api
    .getScore(request.params.quiztaker, request.params.quizid)
    .then((x) => {
      response.send(x.rows);
      console.log(x.rows, " Rows");
    })
    .catch((e) => response.send({ message: "Score not added." }));
});

application.post("/register", (request, response) => {
  let name = request.body.name;
  let email = request.body.email;
  let password = request.body.password;

  api
    .addUser(name, email, password)
    .then((x) =>
      response.json({ done: true, message: "the customer was added." })
    )
    .catch((e) => {
      response.json({
        done: false,
        message: "A customer with the same email already exists",
      });
      console.log(e);
    });
});
/*
application.post("/login", (request, response) => {
  let name = request.body.name;
  let email = request.body.email;
  let password = request.body.password;
  api
    .login(name, email, password)
    .then((x) => {
      console.log(x.rows);
      response.json({
        isvalid: true,
        message: "The user exists. Logging in...",
      });
    })
    .catch((e) => {
      response.json({ isvalid: false, message: "Failed to find user" });
    })
    .catch((e) => console.log(e));
});
*/

application.post("/login", (request, response, next) => {
  console.log("Inside POST /login callback");
  passport.authenticate("local", (err, user, info) => {
    console.log("Inside passport.authenticate() callback");
    console.log(
      `req.session.passport: ${JSON.stringify(request.session.passport)}`
    );
    console.log(`req.user: ${JSON.stringify(request.user)}`);
    request.login(user, (err) => {
      console.log("Inside req.login() callback");
      console.log(
        `req.session.passport: ${JSON.stringify(request.session.passport)}`
      );
      console.log(`req.user: ${JSON.stringify(request.user)}`);
      return response.json({ done: true, message: "The customer logged in." });
    });
  })(request, response, next);
});
