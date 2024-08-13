const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
  }
  const userList = (username) => users.some(user => user.username === username);
  if (userList(username)) {
      return res.status(400).json({ message: 'User already exists!' });
  }
  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered. Thanks, now you can proceed to login.' });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  Promise.resolve(books)
      .then(data => {
          res.json(data);
      })
      .catch(error => {
          res.status(500).json({ message: "Error fetching data." || error.message});
      });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  Promise.resolve(books[isbn])
      .then(book => {
          if (book) {
              res.json(book);
          } else {
              res.status(404).json({ message: "Book not existing." });
          }
      })
      .catch(error => {
          res.status(500).json({ message: "Error fetching data." || error.message });
      });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

    Promise.resolve(Object.keys(books)
        .map(key => books[key])
        .filter(book => book.author === author))
        .then(results => {
            if (results.length > 0) {
              res.json(results);
            } else {
              res.status(404).json({ message: "No books found for this author." });
            }
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching data." || error.message });
        });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  Promise.resolve(Object.keys(books)
      .map(key => books[key])
      .filter(book => book.title === title))
      .then(results => {
          if (results.length > 0) {
              res.json(results);
          } else {
              res.status(404).json({ message: "No books found with this title." });
          }
      })
      .catch(error => {
          res.status(500).json({ message: "Error fetching data" || error.message });
      });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  res.json(book.reviews);
});

module.exports.general = public_users;