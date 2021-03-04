'use strict';

const express = require('express');
require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');

const app = express();
const PORT = process.env.PORT;

app.use(express.static('./views'));
app.use(express.static('./public'));

app.use(express.urlencoded({extended:true})); // puts form data into the request body
app.set('view engine', 'ejs');

// DB Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

///////////////////////////// Render Pages

app.get('/', defaultBooks);

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new.ejs')
});

app.post('/new', searchBooks);

function defaultBooks(req, res){
  let SQL = 'SELECT * from books;';
  client.query(SQL)
    .then(results => {
      let books = results.rows
      res.render('pages/index.ejs', {bookResults : books})
    })
}

////////////////////////////API 

function searchBooks(req, res){

  const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.type}:${req.body.inputText}`;
  superagent.get(url)
  .then(books => {
    console.log(url)
    const output = books.body.items.map((bookData) => {
      let results = new Books(bookData);
      return results;
    });
    res.render('pages/searches/show.ejs', {output:output});
  })
  .catch(error => {
    res.status(300).send(error)
  });
}

/////////////////////////// Constructor

function Books (bookData) {
  this.image = (bookData.volumeInfo.imageLinks && bookData.volumeInfo.imageLinks.thumbnail) ? bookData.volumeInfo.imageLinks.thumbnail.replace(/http/i, 'https') : 'https://www.freeiconspng.com/uploads/book-icon--icon-search-engine-6.png';
  this.title = (bookData.volumeInfo && bookData.volumeInfo.title) ? bookData.volumeInfo.title : 'Nothing by this title found';
  this.author = (bookData.volumeInfo && bookData.volumeInfo.authors) ? bookData.volumeInfo.authors : 'Nothing by this Author found'; 
  this.description = (bookData.volumeInfo && bookData.volumeInfo.description) ? bookData.volumeInfo.description : 'No description available';
}

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`listening on port: ${PORT}`))
  })
