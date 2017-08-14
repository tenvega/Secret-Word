const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const session = require('express-session')
const expressValidator = require('express-validator')
const app = express();
const fs = require('fs')
let words = fs.readFileSync('/usr/share/dict/words', 'utf-8').toLowerCase().split('\n')

let guess = []
let word = words[Math.floor(Math.random(words) * words.length)]
console.log(word)
let wordLength = word.split('')
let placeholder = wordLength.map(x => {
  return '_'
})
let count = 8

app.engine('handlebars', handlebars());
app.set('views', './views');
app.set('view engine', 'handlebars');


app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(expressValidator());

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}))

app.use(morgan('dev'));

//session
app.use((req, res, next) => {
  if(!req.session.word) {
    req.session.word = [];
  }
  next();
});
//re-start
app.post('/reset', (req,res) => {
  console.log(req.session.word);
  req.session.word = [];
  count = 8;
  word = words[Math.floor(Math.random(words) * words.length)]
  wordLength = word.split('')
  placeholder = wordLength.map(x => {
    return '_'
  })
  guess = [];
  res.redirect('/');
});


app.get('/', (req, res) => {
  res.render('home', { placeholder: placeholder, guess: guess, count: count })
})
app.get('/triunfo', (req, res) => {
  res.render('triunfo', { guess: guess, count: count, word: word })
})
app.get('/failed', (req, res) => {
res.render('failed', { guess: guess, count: count, word: word })
})

app.post('/guess', (req, res) => {
  guess.push(req.body.guess)
  if (wordLength.includes(req.body.guess)) {
    wordLength.forEach((letter, index) => {
      if (letter === req.body.guess) {
        placeholder[index] = letter
      }
    })
  } else {
    count -= 1
    if (placeholder.join(',') != wordLength.join(',') && count <= 0) {
      message = 'FAILED!'
      console.log(message)
      req.session.destroy();
      res.redirect('/failed')
    }
  }

   if (placeholder.join(',') === wordLength.join(',') && count >= 0) {
   message = 'You win!'
   console.log(message)
   res.redirect('/triunfo')
 }
 res.redirect('/')
})



app. listen(3000, () => {
  console.log("it's on")
})
