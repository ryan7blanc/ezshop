// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const multer  = require('multer'); //middleware that handles formdata objs
const upload = multer(); //need for multer
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

//fixes css!! 
app.use(express.static(__dirname + '/resources/css'));
//fixes images 
app.use(express.static(__dirname + '/resources/img'));
//fixes js
app.use(express.static(__dirname + '/resources/js'));
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

let count = 0; 

let user = {

  user_id: undefined,
  username: undefined,
  password: undefined, 

};




////////////////////////////
app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });

  app.get('/count', (req, res) => {
    let usrId = req.session.user_id;
    let query = `select count(product_id) from cart where user_id = ${usrId} ;`; 

    db.one(query)
    .then (data2 => {
      console.log(data2); 

    })
    .catch (err =>{
      return console.log(err);
    });


  }); 

  /*function getCount()
  {
    let usrId = req.session.user_id;
    let query = `select count(product_id) from cart where user_id = ${usrId} ;`; 

    db.one(query)
    .then (data2 => {
      console.log(data2); 

    })
    .catch (err =>{
      return console.log(err);
    });
  }*/

  app.get('/login', (req,res) => {
    res.render('pages/login.ejs');
  });

  app.post('/login', async (req,res) => {
    try {
      const query = "select username, password, user_id from users where username = $1";
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
          console.log('heres data');
          console.log(data);
          console.log(data[0].id);

          //save user details in session like in lab 8
          req.session.user = data[0].user;
          req.session.user_id= data[0].user_id;
          req.session.save();
          //res.json({message: 'Success'});
         console.log(req.session.user_id);
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

app.post('/addcart', (req,res) => {

  let usrId = req.session.user_id;
  let name= req.body.title;

  console.log('heres the id!!');
  console.log(usrId);
  console.log('heres the product title');
  console.log(name);
  //remove any leading or trailing spaces from name
  name = name.trim();

  //find product ID
  let findname = `select product_id from products where name = '${name}';`;

  db.task('get-everything', task => {
    return task.batch([
        task.any(findname), //finds product ID
    ]);
})
.then(function (data) {
  
  console.log(data); 
  console.log('got product id');
  let prod_id = data[0][0].product_id;
  console.log(prod_id);
  //insert into cart
  let add = `insert into cart(user_id, product_id) values (${usrId}, ${prod_id}) returning *;`;

  db.any(add)
    .then (data2 => {
      console.log(data2); 
      //getCount(); 
    })
    .catch (err =>{
      return console.log(err);
    });

})
.catch(function (err) {
  return console.log(err);
});

  //var addproduct = `insert into cart(userid, productid) values (${usrId}, ${$productId});`;

});

app.delete('/delete', (req,res) => {

  let usrId = req.session.user_id;
  let name= req.body.title;
  name = name.trim();
  
  let del = `delete from cart where productid = "${productId}" AND userid = "${usrId}";`

  let findname = `select product_id from products where name = '${name}';`;

  db.any(findname)
  .then(data => {
    //console.log('deleted successfully!');
    //res.render("pages/checkout.ejs");
    let prod_id = data[0][0].product_id;
    console.log('heres id'+ prod_id);

    let del = `delete from cart where productid = "${prod_id}" AND userid = "${usrId}" returning *;`

    db.any(del)
    .then (data2 => {
      console.log(data2); 

    })
    .catch (err =>{
      return console.log(err);
    });

  })
  .catch(err => {
    // throw error
  });

});

app.get('/cart', (req,res) => {



  let usrId = req.session.user_id;

  //let prodId = `select product_id from carts where user_id = ${usrId};`;//this can be multiple products...
  let prodId = `select name from products where product_id = (select product_id from carts where user_id = ${usrId});`;

  res.render("pages/checkout.ejs");
  
  /*db.any(find)
  .then (data =>
    {
      console.log(data);
      //how do i do a request for every product... pain
      //maybe redirect it to diferent endpt
    })
    .catch (err => {
      console.log(err); 
    });*/

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
            console.log('DATA:', data);
            console.log(req.session);
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

//load product page
app.get('/', (req,res) => {
 
  axios({
    url: `https://fakestoreapi.com/products/categories`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    
  })
    .then(results => {
      //console.log(results);
      //console.log(results.data[0].title);

      //capitalizes first letter, solution implemented from https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
      let elec = results.data[0].charAt(0).toUpperCase() + results.data[0].slice(1);
      let jewel = results.data[1].charAt(0).toUpperCase() + results.data[1].slice(1);
      let mens = results.data[2].charAt(0).toUpperCase() + results.data[2].slice(1);
      let womens = results.data[3].charAt(0).toUpperCase() + results.data[3].slice(1);

      res.render("pages/home.ejs",
      {
        first: elec,
        second: jewel,
        third: mens,
        fourth: womens,
      });

    })
      .catch(error =>
        {
          console.log(error);
        });



});

app.get('/electronics', (req,res) => {
  
  axios({
    url: `https://fakestoreapi.com/products/category/electronics`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    
  })
    .then(results => {
      console.log(results.data.length);
      
      

      
      res.render("pages/category.ejs",
       {
        output: results.data,
         error: false,
       });

    })
      .catch(error =>
        {
          console.log(error);

          res.render("pages/category.ejs",
          {
           error:true,
          });

        });



});

app.get('/jewelery', (req,res) => {
  
  axios({
    url: `https://fakestoreapi.com/products/category/jewelery`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    
  })
    .then(results => {
      console.log(results.data.length);
      

      
      res.render("pages/category.ejs",
       {
        output: results.data,
         error: false,
       });

    })
      .catch(error =>
        {
          console.log(error);

          res.render("pages/category.ejs",
          {
           error:true,
          });

        });



});

app.get('/mens', (req,res) => {
  
  axios({
    url: `https://fakestoreapi.com/products/category/men's clothing`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    
  })
    .then(results => {
      console.log(results.data.length);
      

      
      res.render("pages/category.ejs",
       {
        output: results.data,
         error: false,
       });

    })
      .catch(error =>
        {
          console.log(error);

          res.render("pages/category.ejs",
          {
           error:true,
          });

        });



});

app.get('/womens', (req,res) => {
  
  axios({
    url: `https://fakestoreapi.com/products/category/women's clothing`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    
  })
    .then(results => {
      console.log(results.data.length);
      

      
      res.render("pages/category.ejs",
       {
        output: results.data,
         error: false,
       });

    })
      .catch(error =>
        {
          console.log(error);

          res.render("pages/category.ejs",
          {
           error:true,
          });

        });



});


app.post('/display', upload.none(), async (req, res) => {

 

  let title = req.body.title;
  let image = req.body.image; 
  let price = req.body.price; 

  console.log(title);
  console.log('whats up');

  let all = [title, image, price];

  //res.send(all); 

})


  module.exports = app.listen(3000);
