'use strict';

const express = require('express');
require('dotenv').config();
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT;

app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');

app.get('/hello', (req, res) => {
  res.render('pages/index.ejs')
});

app.listen(PORT, () => console.log(`up on http://localhost:${PORT}`));
