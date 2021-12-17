const db = require("./data/db");

const addUser = (email, password) => {
  return db.addCustomer(email, password);
};

const login = (email, password) => {
  return db.login(email, password);
};

const search = (term, long, lat, rad, max, cat, sort) => {
  return db.search(term, long, lat, rad, max, cat, sort);
};

const place = (name, category_id, latitude, longitude, description) => {
  return db.place(name, category_id, latitude, longitude, description);
};

const category = (name) => {
  return db.category(name);
};

const photo = (photo, place_id, review_id) => {
  return db.photo(photo, place_id, review_id);
};

const review = (place_id, comment, review) => {
  return db.review(place_id, comment, review);
};

const update_review = (review_id, comment, review) => {
  return db.update_review(review_id, comment, review);
};

const update_place = (
  place_id,
  name,
  category_id,
  latitude,
  longitude,
  description
) => {
  return db.update_place(
    place_id,
    name,
    category_id,
    latitude,
    longitude,
    description
  );
};

exports.addUser = addUser;
exports.login = login;
exports.search = search;
exports.place = place;
exports.category = category;
exports.photo = photo;
exports.review = review;
exports.update_place = update_place;
exports.update_review = update_review;
