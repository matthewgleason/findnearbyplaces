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
        let user = { id: x.id, email: email };
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

application.get(
  "/search/:search_term/:user_location/:radius_filter/:maximum_result_return/:category_filter/:sort",
  () => {
    let term = request.params.search_term;
    let [long, lat] = request.params.user_location.split(",");
    let rad = request.params.radius_filter;
    let max = request.params.maximum_result_return;
    let cat = request.params.category_filter;
    let sort = request.params.sort;
    api
      .search(term, long, lat, rad, max, cat, sort)
      .then((x) => {
        response.json({
          done: true,
          result: {
            name: x.name,
            address: x.longitude + "," + x.latitude,
            category: x.name,
          },
        });
      })
      .catch((e) => {
        response.json({
          done: false,
          result: "Result could not be found",
        });
      });
  }
);

application.post("/register", (request, response) => {
  let email = request.body.email;
  let password = request.body.password;

  api
    .addUser(email, password)
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
application.post("/place", (request, response) => {
  let name = request.body.name;
  let category_id = request.body.category_id;
  let longitude = request.body.longitude;
  let latitude = request.body.latitude;
  let description = request.body.description;

  api
    .place(name, category_id, latitude, longitude, description)
    .then((x) =>
      response.json({ done: true, id: x.id, message: "posted place" })
    )
    .catch((e) => {
      response.json({
        done: false,
        message: "Could not post place",
      });
      console.log(e);
    });
});

application.put("/place", (request, response) => {
  let place_id = request.body.place_id;
  let name = request.body.name;
  let category_id = request.body.category_id;
  let longitude = request.body.longitude;
  let latitude = request.body.latitude;
  let description = request.body.description;

  api
    .update_place(place_id, name, category_id, latitude, longitude, description)
    .then((x) =>
      response.json({ done: true, id: x.id, message: "updated place" })
    )
    .catch((e) => {
      response.json({
        done: false,
        message: "Could not update place",
      });
      console.log(e);
    });
});

application.delete("/place/:place_id", (request, response) => {
  let place_id = request.params.place_id;

  api
    .delete_place(place_id)
    .then((x) => response.json({ done: true, message: "deleted place" }))
    .catch((e) => {
      response.json({
        done: false,
        message: "Could not delete place",
      });
      console.log(e);
    });
});

application.post("/category", (request, response) => {
  let name = request.body.name;

  api
    .category(name)
    .then((x) =>
      response.json({ done: true, id: x.id, message: "posted category" })
    )
    .catch((e) => {
      response.json({
        done: false,
        message: "category not posted",
      });
      console.log(e);
    });
});

application.post("/photo", (request, response) => {
  let photo = request.body.photo;
  let place_id = request.body.place_id;
  let review_id = request.body.review_id;

  api
    .photo(photo, place_id, review_id)
    .then((x) =>
      response.json({ done: true, id: x.id, message: "posted photo" })
    )
    .catch((e) => {
      response.json({
        done: false,
        message: "photo not posted",
      });
      console.log(e);
    });
});

application.put("/photo", (request, response) => {
  let photo = request.body.photo;
  let photo_id = request.body.photo_id;

  api
    .update_photo(photo, photo_id)
    .then((x) =>
      response.json({ done: true, id: x.id, message: "posted photo" })
    )
    .catch((e) => {
      response.json({
        done: false,
        message: "photo not updated",
      });
      console.log(e);
    });
});

application.delete("/photo/:photo_id", (request, response) => {
  let photo_id = request.params.photo_id;

  api
    .delete_photo(photo_id)
    .then((x) => response.json({ done: true, message: "deleted photo" }))
    .catch((e) => {
      response.json({
        done: false,
        message: "Could not delete photo",
      });
      console.log(e);
    });
});

application.post("/review", (request, response) => {
  let place_id = request.body.place_id;
  let comment = request.body.comment;
  let rating = request.body.rating;

  api
    .review(place_id, comment, rating)
    .then((x) =>
      response.json({ done: true, id: x.id, message: "posted review" })
    )
    .catch((e) => {
      response.json({
        done: false,
        message: "review not posted",
      });
      console.log(e);
    });
});

application.put("/review", (request, response) => {
  let review_id = request.body.review_id;
  let comment = request.body.comment;
  let rating = request.body.rating;

  api
    .update_review(review_id, comment, rating)
    .then((x) =>
      response.json({ done: true, id: x.id, message: "updated review" })
    )
    .catch((e) => {
      response.json({
        done: false,
        message: "review not updated",
      });
      console.log(e);
    });
});

application.delete("/review/:review_id", (request, response) => {
  let review_id = request.params.review_id;

  api
    .delete_review(review_id)
    .then((x) => response.json({ done: true, message: "deleted review" }))
    .catch((e) => {
      response.json({
        done: false,
        message: "Could not delete review",
      });
      console.log(e);
    });
});

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
