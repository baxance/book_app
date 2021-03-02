'use strict';

const express = require('express');
require('dotenv').config();
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT;

app.use(express.static('./views'));
app.use(express.static('./public'));

app.use(express.urlencoded({extended:true})); // puts form data into the request body
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('pages/index.ejs')
});
app.post('/bookSearch', searchBooks);

function searchBooks(req, res){
  console.log(req.body);
  const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.type}:${req.body.inputText}`;
  superagent.get(url)
  .then(books => {
    const output = books.body.items.map(bookData => {
      return new Books(bookData);
    });
    console.log(books)
    console.log(output)
    res.render('pages/searches/show.ejs', output);
  })
  .catch(error => {
    res.status(300).send(error)
  });
}

function Books (bookData) {
  this.title = bookData.volumeInfo.title;
  this.author = bookData.volumeInfo.authors[0];
  this.description = bookData.volumeInfo.description;
}



app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new.ejs')
});

app.listen(PORT, () => console.log(`up on http://localhost:${PORT}`));
