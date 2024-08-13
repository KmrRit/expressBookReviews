const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const secretKey = 'verysecret';
let users = [{ "username": "test", "password": "password123" }];

const isValid = (username)=>{ //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const user = users.find(user => user.username === username);
  return user && user.password === password;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  if (!isValid(username) || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }
  const token = jwt.sign({ username }, secretKey, { expiresIn: 60 * 60 });
  req.session.authorization = { username, token };
  res.status(200).json({ message: 'Login successful.', token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!username) {
    return res.status(401).send("Unauthorized");
  }
  
  if (books[isbn]) {
      let book = books[isbn];
      book.reviews[username] = review;
      return res.status(200).send(`Review successfully posted for ISBN ${isbn}`);
  } else {
      return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!username) {
      return res.status(401).json({ message: "Unauthorized: Please log in." });
  }

  if (books[isbn] && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review posted by user deleted successfully." });
  }
  return res.status(404).json({ message: "Review not found or you do not have permission." });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;