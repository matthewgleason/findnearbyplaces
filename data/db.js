const { Pool } = require("pg");
const { flowers } = require("./flowers");
const api = require("../api");
const bcrypt = require("bcrypt");

require("dotenv").config({ path: "./.env" });
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const connectionString = `postgres://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.HOST}:${process.env.DATABASEPORT}/${process.env.MYDATABASE}`;

const connection = {
  connectionString: process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : connectionString,
  ssl: { rejectUnathorized: false },
};

const pool = new Pool(connection);

const addCustomer = (email, password) => {
  const salt = bcrypt.genSaltSync(9);
  const hashedPassword = bcrypt.hashSync(password, salt);
  return pool.query(
    "insert into findplaces.customer(email, password) values ($1, $2)",
    [name, email, hashedPassword]
  );
};

const login = (email, password) => {
  const salt = bcrypt.genSaltSync(9);
  const hashedPassword = bcrypt.hashSync(password, salt);
  return pool.query(
    "select * from findplaces.customer where email=$2 and password=$3",
    [email, hashedPassword]
  );
};

const search = (term, long, lat, rad, max, cat, sort) => {
  return pool.query(
    "(select * from findplaces.places where name=$1 and latitude=$2 and longitude=$3) union (select * from findplaces.place inner join findplace.category on findplace.category(id)=findplace.place(category_id) where id=$5",
    [(term, lat, long, term, cat)]
  );
};
const place = (name, category_id, latitude, longitude, description) => {
  return pool.query(
    "insert into findplaces.place(name, latitude, longitude, description, category_id) values ($1, $2, $3, $4, $5, $6)",
    [name, latitude, longitude, description, category_id]
  );
};

const category = (name) => {
  return pool.query("insert into findplaces.category(name) values ($1)", [
    name,
  ]);
};

const photo = (photo, place_id, review_id) => {
  if (review_id) {
    return pool.query(
      "with first_insert as (insert into findplaces.photo(file) values ($1) RETURNING id), second_insert as (insert into findplaces.review_photo(photo_id) values (select id from first_insert));",
      [photo]
    );
  } else {
    return pool.query(
      "with first_insert as (insert into findplaces.photo(file) values ($1) RETURNING id), second_insert as (insert into findplaces.place_photo(photo_id) values (select id from first_insert));",
      [photo]
    );
  }
};

const review = (place_id, comment, rating) => {
  return pool.query(
    "insert into findplaces.reviews(location_id, text, rating) values ($1, $2, $3)",
    [place_id, comment, rating]
  );
};

const update_place = (
  place_id,
  name,
  category_id,
  latitude,
  longitude,
  description
) => {
  return pool.query(
    "update findplaces.place set name=$1, latitude=$2, longitude=$3, description=$4, category_id=$5 where id=$",
    [name, latitude, longitude, description, category_id, place_id]
  );
};

const update_review = (review_id, comment, rating) => {
  return pool.query(
    "update findplaces.review set text=$1, rating=$2 where id=$3",
    [comment, rating, review_id]
  );
};

const update_photo = (photo, photo_id) => {
  return pool.query("update findplaces.photo set file=$1 where id=$2", [
    [photo, photo_id],
  ]);
};

const delete_place = (place_id) => {
  return pool.query("delete from findplaces.place where id=$1", [place_id]);
};

const delete_review = (review_id) => {
  return pool.query("delete from findplaces.reviews where id=$1", [review_id]);
};

const delete_photo = (photo_id) => {
  return pool.query("delete from findplaces.photo where id=$1", [photo_id]);
};

exports.addCustomer = addCustomer;
exports.login = login;
exports.search = search;
exports.place = place;
exports.category = category;
exports.photo = photo;
exports.review = review;
exports.update_place = update_place;
exports.update_review = update_review;
exports.update_photo = update_photo;
exports.delete_place = delete_place;
exports.delete_review = delete_review;
exports.delete_photo = delete_photo;
