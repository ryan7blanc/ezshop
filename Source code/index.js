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

  module.exports = app.listen(3000);