// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

////////////////////////////
app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });

  app.get('/login', (req,res) => {
    res.render('pages/login.ejs');
  });

  app.post('/login', async (req,res) => {
    try {
      const query = "select password from users where username = $1";
      const data = await db.any(query, [req.body.username])
      
      if (data[0].length == 0)
      {
        res.redirect('pages/register');
      }
      else 
      {
        const match = await bcrypt.compare(req.body.password, data[0].password);
        if (match)
        {
          //save user details in session like in lab 8
          req.session.user = data.user;
          req.session.save();
          res.redirect("/discover");
        }
        else
        {
          res.render("pages/login.ejs");
        }
      }
    } catch (error) {
      res.redirect('/login');
      return console.log("catch error");
    }
      
  });
////////////////////////

  module.exports = app.listen(3000);