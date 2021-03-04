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

///////////////////////////// Routes

app.get('/', defaultBooks);
app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new.ejs')
});
app.post('/new', searchBooks);
app.get('/books/:id', bookDetail);
app.post('/books', saveBook);

////////////////////////////// Callbacks

function defaultBooks(req, res){
  let SQL = 'SELECT * from books;';
  client.query(SQL)
    .then(results => {
      let books = results.rows
      res.render('pages/index.ejs', {bookResults : books})
      // console.log(books)
    })
}

function searchBooks(req, res){

  const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.type}:${req.body.inputText}`;
  superagent.get(url)
  .then(books => {
    // console.log(url)
    const output = books.body.items.map((bookData) => {
      let results = new Books(bookData);
      return results;
    });
    // console.log(output)
    res.render('pages/searches/show.ejs', {output:output});
  })
  .catch(error => {
    res.status(300).send(error)
  });
}

function bookDetail(req, res) {
  console.log(req.body, 'body')
  res.render('pages/books/detail.ejs');
}

function saveBook(req, res) {
  console.log(req.body);
  const SQL = 'INSERT INTO books (author, title, isbn, image_url, book_desc) VALUES ($1, $2, $3, $4, $5) RETURNING id';
  const values = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.book_desc];
    client.query(SQL, values)
      .then(result => {
        const object = {books : values}
        const savedBook = result.rows[0].id;
        res.redirect(`./pages/books/detail.ejs/${savedBook}`, object);
});

}

/////////////////////////// Constructor

function Books (bookData) {
  this.image = (bookData.volumeInfo.imageLinks && bookData.volumeInfo.imageLinks.thumbnail) ? bookData.volumeInfo.imageLinks.thumbnail.replace(/http/i, 'https') : 'https://www.freeiconspng.com/uploads/book-icon--icon-search-engine-6.png';
  this.title = (bookData.volumeInfo && bookData.volumeInfo.title) ? bookData.volumeInfo.title : 'Nothing by this title found';
  this.author = (bookData.volumeInfo && bookData.volumeInfo.authors) ? bookData.volumeInfo.authors : 'Nothing by this Author found'; 
  this.description = (bookData.volumeInfo && bookData.volumeInfo.description) ? bookData.volumeInfo.description : 'No description available';
  this.isbn = (bookData.volumeInfo && bookData.volumeInfo.industryIdentifiers) ? bookData.volumeInfo.industryIdentifiers[0].identifier : 'No description available';
}

client.connect()
  .then( () => {
    app.listen(PORT, () => console.log(`listening on port: ${PORT}`))
  });
