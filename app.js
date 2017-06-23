var express = require('express')
var mustache = require('mustache-express')
var session = require('express-session')
var parseurl = require('parseurl')
var bodyParser = require('body-parser')
var app = express()

app.engine('mustache', mustache())
app.set('views', './views')
app.set('view engine', 'mustache')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({
  secret: 'alexisthegreatest',
  resave: false,
  saveUninitialized: true
}))

var userTrue = 0
var sess
var database = [{username: 'alex', password: 'password123'}]
var invalidPassword = ''

app.use(function (req, res, next) {
  var views = req.session.views
  if (!views) {
    views = req.session.views = {}
  }
  // get the url pathname
  var pathname = parseurl(req).pathname
  // count the views
  views[pathname] = (views[pathname] || 0) + 1
  next()
})

app.get('/', function (req, res, next) {
  sess = req.session
  for (var i = 0; i < database.length; i++) {
    if (database[i].username === sess.username && database[i].password === sess.password) {
      userTrue = 1
      // userTrue determines if username and password are present in the database
    }
  }

  if (userTrue === 1) {
    res.render('index', {
      user: sess.username,
      pass: sess.password,
      views: (sess.views['/count'])
    })
  } else {
    console.log('false')
        // redirect to /login page and ask to login
    res.redirect('/login')
  }
})

app.get('/login', function (req, res, next) {
  res.render('login', {invalid: invalidPassword})
})

app.post('/counter', function (req, res) {
  res.redirect('/count')
})

app.get('/count', function (req, res, next) {
  res.redirect('/')
})

app.post('/login', function (req, res) {
  sess = req.session
  sess.username = req.body.username
  sess.password = req.body.password
  for (var i = 0; i < database.length; i++) {
    if (database[i].username === sess.username && database[i].password === sess.password) {
      res.redirect('/')
    } else if (database[i].username === sess.username && database[i].password !== sess.password) {
      invalidPassword = 'Your password was incorrect'
      res.redirect('/login')
    }
  }
  res.redirect('/signup')
})

app.get('/signup', function (req, res) {
  res.render('signup')
})

app.post('/signup', function (req, res) {
  sess = req.session
  sess.username = req.body.username
  sess.password = req.body.password
  let newUser = {username: sess.username, password: sess.password}
  database.push(newUser)

  res.redirect('/')
})

app.post('/logout', function (req, res) {
  userTrue = 0
  // resets userTrue value so that root page does not allow loading
  invalidPassword = ''
  sess = req.session
  sess.username = ''
  sess.password = ''
  sess.views['/count'] = 0
  res.redirect('/')
})

app.post('/createAccount', function (req, res) {
  res.redirect('/signup')
})

app.listen(3000, function () {
  console.log('Server ON! Listening on Port: 3000')
})
