require('dotenv').config();
process.env.TYPHOON_API_KEY = process.env.TYPHOON_API_KEY || 'sk-YnFyCS1l61Gbk8zFuDYh2m0Ibgsxzit2UtlYV4mJAORtXop4';
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use('/', require('./routes/index'));

app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`SlipFlow running at http://localhost:${PORT}`);
});
