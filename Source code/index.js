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

  async function getCount(usrId)
  {
    if(usrId == undefined || usrId == '' || usrId == null)
  {
    console.log('undefined'); 
    return 0; 
  }
    
    let getcart_id = `select cart_id from cart where user_id = ${usrId};`;
    let cart_id = await db.any(getcart_id); 
    //console.log('count: ' + cart_id[0].cart_id);
    cart_id = cart_id[0].cart_id;  
    let findcount = ` select sum(amount) from items where cart_id = ${cart_id};`;
    let count = await db.any(findcount);
    console.log(count[0].sum); 
    if(count[0].cart_id == '')
    {
      return 0;
    } else {
    return count[0].sum; 
    }
    //console.log('function'); 
  }

 

  app.get('/login', async (req,res) => {
    let count = await getCount(req.session.user_id);
    console.log('getCount happens');
    res.render('pages/login.ejs',
    {
      count: count, 
    });
  });

  app.post('/login', async (req,res) => {
    try {

      let count = await getCount(req.session.user_id);
      console.log('getCount happens');

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
          

          //save user details in session like in lab 8
          req.session.user = data[0].user;
          req.session.user_id= data[0].user_id;
          req.session.save();
          //res.json({message: 'Success'});

          const find = `select user_id from cart where user_id = ${data[0].user_id};`
          let output = await db.any(find); 
          console.log('find output:')
          console.log(output);

          if(output == '')
          {
            //add to cart!! otherwise doesn't 
            const insert_cart = `insert into cart (user_id) values (${data[0].user_id}) returning *;`
            output = await db.any(insert_cart); 
            console.log(output); 
          }

          //const insert_cart = `sert into cart (user_id) values (${data[0].user_id}) returning *;`
          //let output = await db.inany(insert_cart); 
          //console.log(output); 
         console.log(req.session.user_id);
          res.redirect("/");
         
        }
        else
        {  //alerts user that they entered the wrong password or username
           res.render("pages/login.ejs",{
            message: 'Incorrect username or password.',
            error: true, 
            count: count, 
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

app.post('/addcart', async (req,res) => {

  let usrId = req.session.user_id;
  let name= req.body.title;
  let amount = req.body.amount; 

  if(usrId == '' || usrId == undefined || usrId == null)
  {
    res.redirect("/register"); 
  }

  console.log('heres the id!!');
  console.log(usrId);
  console.log('heres the product title');
  console.log(name);
  //remove any leading or trailing spaces from name
  name = name.trim();

  //find product ID
  console.log('start');
  console.log(amount);
  let findname = `select product_id from products where name = '${name}';`;
  let productId= await db.any(findname); 
  productId = productId[0].product_id;
  //console.log(productId[0].product_id);
  let findcart = `select cart_id from cart where user_id = ${usrId}`;
  let cart_id = await db.any(findcart); 
  cart_id = cart_id[0].cart_id;
  console.log(cart_id + "card_id ?? ??");   
  //console.log(cart_id[0].cart_id);
  
  //checking if a product is already in items table
  let check = `select product_id from items where (product_id = ${productId}) AND (cart_id = ${cart_id})`;
  check = await db.any(check); 
  
  console.log(check[0]); 

  let img = `select image_url from products where (product_id = ${productId});`;
    let img_url = await db.any(img); 
    console.log('check image:');
    console.log(img_url[0].image_url); 
    img_url = img_url[0].image_url;

  if(check[0] == undefined)
  {



    //not in cart, add to items
    console.log("not in cart");
    let add = `insert into items(cart_id, product_id, amount, image_url) values (${cart_id}, ${productId}, ${amount}, '${img_url}') returning *;`; 
    let results = await db.any(add);
    console.log(results); 
  } else
  {
    console.log("in cart");
    //in cart, add the amounts together
    let findAmt = `select amount from items where (product_id = ${productId}) AND (cart_id = ${cart_id}) `;
    let amount1 = await db.any(findAmt); 
    amount1 = amount1[0].amount; 
    //console.log(amount1[0].amount); 
    //console.log(Number(amount));
    //console.log(Number(amount1));
    amount = Number(amount) + Number(amount1);
    //console.log(sum);
    //amount = amount1 + amount; 
    console.log(amount);

    let deleteDupe = `delete from items where (product_id = ${productId}) AND (cart_id = ${cart_id});`;
    await db.any(deleteDupe); 

    check = `select product_id from items where (product_id = ${productId}) AND (cart_id = ${cart_id});`;
    check = await db.any(check); 
    console.log('check cart:');
    console.log(check[0]); 

    

    let add = `insert into items(cart_id, product_id, amount, image_url) values (${cart_id}, ${productId}, ${amount}, '${img_url}') returning *;`; 
    let results = await db.any(add); 
    console.log('where..');
    console.log(results); 

    //checking results
    check = `select product_id from items where (product_id = ${productId}) AND (cart_id = ${cart_id})`;
    check = await db.any(check); 
    console.log('check cart 2:');
    console.log(check[0]);  
  }


});

app.delete('/delete', async (req,res) => {

  let usrId = req.session.user_id;
  let name= req.body.title;
  name = name.trim();
  //let amount = req.body.amount; 
  
  let find = `select product_id from products where name = ${name};`;
  let productId = await db.any(find); 
  productId = productId[0].product_id; 
  console.log(productId); 


  let findId = `select cart_id from cart where user_id = ${usrId};`;
  let cartId = await db.any(findId); 
  cartId = cartId[0].cart_id;
  console.log(cartId); 


  let findAmt = `select amount from items where (product_id = ${productId}) AND (cart_id = ${cartId});`;
  let amount1 = await db.any(findAmt); 
  amount1 = amount1[0].amount; 
  console.log(amount1); 

  let del = `delete from items where productid = "${productId};" AND userid = "${usrId}";`;
  let results = await db.any(del);   
  console.log(results);  

  //delete entire row
  if(Number(amount1) > Number(amount))
  {
    //delete and reinsert with new amount values
    amount = Number(amount1) - Number(amount); 
    let insert = `insert into items(cart_id, product_id, amount) values (${usrId}, ${productId}, ${amount}) returning *;`;
  }


});

app.get('/cart', async(req,res) => {

  let count = await getCount(req.session.user_id);
  console.log('getCount happens');

  let usrId = req.session.user_id;

  let findcart = `select cart_id from cart where user_id = ${usrId};`;
  let cart_id = await db.any(findcart); 
  cart_id = cart_id[0].cart_id; 


  let grab = `select product_id from items where (cart_id = ${cart_id});`;
  let product_id = await db.any(grab);
  console.log(product_id);   

 let img = '';
  let img_url = '';
  console.log(product_id);  
  //img_url = img_url[0].image_url; 
  let imgs = []; 

  let getamt = '';
  let amount = '';

  let amounts = [];  

  let findname = '';
  let names = [];
  let name = '';

  let findprice = '';
  let prices = [];
  let price = '';

 


  
  //amounts[i] = amount[i].amount; 
  
  
  for(let i = 0; i < product_id.length; i++)
  {
    console.log(i);
    getamt = `select amount from items where (product_id = ${product_id[i].product_id}) AND (cart_id = ${cart_id});`;
    amount = await db.any(getamt); 
    console.log(amount);
    amounts[i] = amount[0].amount; 

    findname = `select name from products where (product_id = ${product_id[i].product_id});`;
    name = await db.any(findname); 
    names[i] = name[0].name; 

    findprice = `select price from products where (product_id = ${product_id[i].product_id});`;
    price = await db.any(findprice); 
    prices[i] = price[0].price; 

    img = `select image_url from items where (cart_id = ${cart_id}) and (product_id = ${product_id[i].product_id});`;
    img_url = await db.any(img);
    console.log('image: ' + img_url); 
    //imgs[i] = img_url[0].image_url; 

    //amounts[i] = amount; 
    //console.log(amounts[i]);
    //amounts[i] = amount[i].amount; 
    
  }
  console.log("amounts ");
  console.log(amounts[0]);
  console.log(amounts[1]);
  console.log(names[0]);
  console.log(names[1]);
  console.log(prices[0]);
  console.log(prices[1]);

  //check if logged in
  let value = true;      
  if(req.session.user_id == undefined)
  {
    console.log('enter');
    value = false;
  }
  
  res.render("pages/checkout.ejs",{
    amounts: amounts,
    prices: prices,
    names: names,
    logged: value,
    count: count, 
    
    });

  //let findamt = `select amount from items where (user_id = ${usrId}) AND (cart_id = ${cart_id}) AND (product_id = ${});`; 
  
//https://stackoverflow.com/questions/5957091/how-to-store-information-in-a-field-in-database
  /*db.any(prodId)
  .then (data =>
    {
      //all products of user id
      console.log(data);
      console.log(data[0].product_id);

       for(let i = 0; i < data.length; i++)
      {
        let query = `select name from products inner join cart on cart.product_id = products.product_id where cart.product_id = ${data[i].product_id};`;

        console.log(data[i].product_id);

        db.any(query)
        .then (data2 =>
          {
          console.log(data2);
          })
          .catch (err => {
            console.log(err);
          });
          console.log('end');
      }
      
      
    })
    .catch (err => {
      console.log(err); 
    });*/

});




app.get('/register', async (req, res) => {
  let count = await getCount(req.session.user_id);
  console.log('getCount happens');
  if(req.query.error){
  res.render("pages/register.ejs",{
  message: 'Your username or password could not be found. Please register for a new account.',
  error: true, 
  count: count, 
  });
  } else 
  {
    res.render("pages/register.ejs",
    {
      count: count, 
    });
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
  
  const insert_user = `INSERT INTO users (username, password) VALUES ('${username}', '${hash}') returning *;`; 

  db.any(insert_user)
  
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
app.get('/', async (req,res) => {
 
  let count = await getCount(req.session.user_id);
  console.log('getCount happens'); 

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

      let value = true;

      
      if(req.session.user_id == undefined)
      {
        console.log('enter');
        value = false;
      } 

      res.render("pages/home.ejs",
      {
        first: elec,
        second: jewel,
        third: mens,
        fourth: womens,
        logged: value,
        count: count, 
      });

    })
      .catch(error =>
        {
          console.log(error);
        });


});

async function storeDataInDatabase(data, category) {
  try {
    for (const product of data) {
      const insertQuery = `
        INSERT INTO products (name, description, price, review, product_id)
        VALUES ($1, $2, $3, $4, $5);`;

      await db.none(insertQuery, [
        product.title,
        product.description,
        product.price,
        product.rating.rate,
        product.id,
      ]);
    }

    console.log(`Data for category '${category}' successfully stored in the database`);
  } catch (error) {
    console.error(`Error storing data for category '${category}':`, error.message || error);
  }
}

app.get('/electronics', async (req,res) => {

  let count = await getCount(req.session.user_id);
  console.log('getCount happens');
      //check if logged in
      let value = true;      
      if(req.session.user_id == undefined)
      {
        console.log('enter');
        value = false;
      }
  
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
      
      storeDataInDatabase(results.data, "electronics");
      
      res.render("pages/category.ejs",
       {
        output: results.data,
         error: false,
         logged: value,
         count: count, 
       });

    })
      .catch(error =>
        {
          console.log(error);

          res.render("pages/category.ejs",
          {
           error:true,
           logged: value,
           count: count, 
          });

        });



});

app.get('/jewelery', async (req,res) => {
  
  let count = await getCount(req.session.user_id);
  console.log('getCount happens');

  //check if logged in
  let value = true;      
  if(req.session.user_id == undefined)
  {
    console.log('enter');
    value = false;
  }

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
      
      storeDataInDatabase(results.data, "jewelery");
      
      res.render("pages/category.ejs",
       {
        output: results.data,
         error: false,
         logged: value,
         count: count, 
       });

    })
      .catch(error =>
        {
          console.log(error);

          res.render("pages/category.ejs",
          {
           error:true,
           logged: value,
           count: count, 
          });

        });



});

app.get('/mens', async (req,res) => {
  
  let count = await getCount(req.session.user_id);
  console.log('getCount happens');

  //check if logged in
  let value = true;      
  if(req.session.user_id == undefined)
  {
    console.log('enter');
    value = false;
  }

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
      
      storeDataInDatabase(results.data, "mens");
      
      res.render("pages/category.ejs",
       {
        output: results.data,
         error: false,
         logged: value,
         count: count,
       });

    })
      .catch(error =>
        {
          console.log(error);

          res.render("pages/category.ejs",
          {
           error:true,
           logged: value,
           count: count, 
          });

        });



});

app.get('/womens', async (req,res) => {

  let count = await getCount(req.session.user_id);
  console.log('getCount happens');

  //check if logged in
  let value = true;      
  if(req.session.user_id == undefined)
  {
    console.log('enter');
    value = false;
  }
  
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
      
      storeDataInDatabase(results.data, "womens");
      
      res.render("pages/category.ejs",
       {
        output: results.data,
         error: false,
         logged: value,
         count: count, 
       });

    })
      .catch(error =>
        {
          console.log(error);

          res.render("pages/category.ejs",
          {
           error:true,
           logged: value,
           count: count, 
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
