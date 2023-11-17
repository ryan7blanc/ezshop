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

//fixes css!! 
app.use(express.static(__dirname + '/resources/css'));
//fixes images 
app.use(express.static(__dirname + '/resources/img'));
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
          //res.json({message: 'Success'});
         
          res.redirect("/");
         
        }
        else
        {  //alerts user that they entered the wrong password or username
           res.render("pages/login.ejs",{
            message: 'Incorrect username or password.',
            error: true, 
          });
        }
      }
    } catch (error) {
      //res.json({message: 'Invalid input'});
      //res = return
      res.redirect('/login');
      
    }
      
  });
////////////////////////

app.get('/', (req,res) => {
  res.render('pages/home.ejs');
});

app.get('/register', (req, res) => {
  if(req.query.error){
  res.render("pages/register.ejs",{
  message: 'Your username or password could not be found. Please register for a new account.',
  error: true, 
  });
  } else 
  {
    res.render("pages/register.ejs");
  }
});

app.post('/register', async (req, res) => {
  var salt = bcrypt.genSaltSync(10);
  var hash;
  const username = req.body.username;
  //console.log('1');
  if(req.body.password == null || username == null || req.body.password.length < 8)
  {
    //breaks the sql query, so it does not pass 
    hash = 'abababababababababababababababababababababababababababababababababababababababababababababababababababababa';
  }else {
  hash = await bcrypt.hashSync(req.body.password, salt);
  }
  
  //const password = req.body.password;
  
  const query = `INSERT INTO users (username, password) VALUES ('${username}', '${hash}') returning *;`; 

  db.any(query)
  
        .then(data => {
            //console.log('DATA:', data);
            //res.json({message: 'Success'});
            res.redirect('/login');
            

        })
        .catch(err => {
            // throw error
            //console.log(err);
            //console.log(res.status); 
            res.redirect('/register');
            
        });
});

  module.exports = app.listen(3000);
