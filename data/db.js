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

const getCustomers = () => {
  return pool.query("select * from imagequiz.customer");
};

const getFlowers = () => {
  return pool.query("select * from imagequiz.flower");
};

const addCustomer = (name, email, password) => {
  const salt = bcrypt.genSaltSync(9);
  const hashedPassword = bcrypt.hashSync(password, salt);
  return pool.query(
    "insert into imagequiz.customer(name, email, password) values ($1, $2, $3)",
    [name, email, hashedPassword]
  );
};

const getQuizzes = () => {
  return pool.query("select * from imagequiz.quiz");
};

const login = (name, email, password) => {
  const salt = bcrypt.genSaltSync(9);
  const hashedPassword = bcrypt.hashSync(password, salt);
  return pool.query(
    "select * from imagequiz.customer where name=$1 and email=$2 and password=$3",
    [name, email, hashedPassword]
  );
};

const getQuiz = (id) => {
  return pool.query(
    "select * from imagequiz.quiz_question inner join imagequiz.question on quiz_question.question_id = question.id where quiz_question.quiz_id=$1",
    [id]
  );
};

const setScore = (score, quizid, quiztaker) => {
  return pool.query(
    "insert into imagequiz.score(score, quiz_id, quiz_taker) values ($1, $2, $3)",
    [score, quizid, quiztaker]
  );
};

const getScore = (quizid, quiztaker) => {
  return pool.query(
    "select * from imagequiz.score where quiz_taker = $1 and quiz_id = $2",
    [quiztaker, quizid]
  );
};

exports.getCustomers = getCustomers;
exports.addCustomer = addCustomer;
exports.getFlowers = getFlowers;
exports.getQuizzes = getQuizzes;
exports.getQuiz = getQuiz;
exports.login = login;
exports.getScore = getScore;
exports.setScore = setScore;
