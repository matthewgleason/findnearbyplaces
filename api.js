var { flowers } = require("./data/flowers");
var { scores } = require("./data/scores");
var { users } = require("./data/users.js");
const db = require("./data/db");

const getAllQuizzes = () => {
  return db.getQuizzes();
};

const getQuiz = (id) => {
  return db.getQuiz(id);
};

const setScore = (score, quizid, quiztaker) => {
  return db.setScore(score, quizid, quiztaker);
};

const getScore = (user, id) => {
  return db.getScore(id, user);
};

const getFlowers = () => {
  return db.getFlowers();
};

const addUser = (name, email, password) => {
  return db.addCustomer(name.toLowerCase(), email, password);
};

const login = (name, email, password) => {
  return db.login(name, email, password);
};

exports.setScore = setScore;
exports.getQuiz = getQuiz;
exports.getAllQuizzes = getAllQuizzes;
exports.addUser = addUser;
exports.getFlowers = getFlowers;
exports.getScore = getScore;
exports.login = login;
