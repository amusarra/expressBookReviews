const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user)=>{
        return user.username === username
      });
      if(userswithsamename.length > 0){
        return true;
      } else {
        return false;
      }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const {username, password} = req.body;
  
  // check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Please provide both username and password."});
  }

  // check if user is registered
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({message: "Invalid credentials."});
  }

  // check if password is correct
  if (user.password !== password) {
    return res.status(401).json({message: "Invalid credentials."});
  }

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
}

if (authenticatedUser(username,password)) {
  let accessToken = jwt.sign({
    data: password
  }, 'access', { expiresIn: 60 * 60 });

  req.session.authorization = {
    accessToken,username
}
  // return success message with access token
  return res.json({message: "Login successful.", accessToken});
} else {
  return res.status(208).json({message: "Invalid Login. Check username and password"});
}
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const username = req.session.authorization.username
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!review) {
    return res.status(400).json({message: "Please provide a review"});
  }
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  if (books[isbn].reviews[username]) {
    books[isbn].reviews[username] = review;
    return res.json({message: "Review modified successfully"});
  }
  books[isbn].reviews[username] = review;
  return res.json({message: "Review added successfully"});
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username 

    if (!username) {
      return res.status(401).json({message: "Unauthorized"});
    }
  
    if (!isValid(username)) {
      return res.status(401).json({message: "Invalid username"});
    }
  
    if (!books[isbn]) {
      return res.status(400).json({message: "Invalid ISBN"});
    }
  
    if (!books[isbn].reviews[username]) {
      return res.status(400).json({message: "Review not found for the given ISBN and username"});
    }
  
    delete books[isbn].reviews[username];
    return res.status(200).json({message: "Review deleted successfully"});
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
