
// Imports the index.js file to be tested.
const server = require('../index.js'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        console.log('welcome..')
        done();
      });
  });

  // ===========================================================================
  // TO-DO: Part A Login unit test case
 /* it('Postive: /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'User', password:'password6'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Success');
        done();
      });
  });*/

  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({id: 1, username: 'User', password: 'password6'})
      .redirects(0)
      .end((err, res) => {
        expect(res).to.have.status(302);
        expect(res).to.redirectTo("/login");
        //console.log(res.body.message); 
        //expect(res.body.message).to.equals('Success');
        done();
      });
  });

  it('negative : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'cowboy', password: 'lala'})
       .redirects(0)
      .end((err, res) => {
        console.log(res.status);
        expect(res).to.have.status(302);
        expect(res).to.redirectTo("/register");
        //302 
        //console.log(res.body.message); 
        //expect(res.body.message).to.equals('Success');
        done();
      });
  });


  //We are checking POST /add_user API by passing the user info in the correct order. This test case should pass and return a status 200 along with a "Success" message.
//Positive cases  
  it('positive : /login', done => {
    chai
      .request(server)
      .post('/login')
      .send({id: 2, username: 'User', password: 'password6'})
      .redirects(0)
      .end((err, res) => {
        //console.log(res);
        //expect to redirect to home page
        expect(res).to.have.status(302);
        expect(res).to.redirectTo("/");
        //console.log(res); 
        
        done();
      });
  });

  it('Negative : /login Checking invalid name', done => {
    chai
      .request(server)
      .post('/login')
      .send({name: null, password:'m'})
      .redirects(0)
      .end((err, res) => {
        
        expect(res).to.have.status(302);
        expect(res).to.redirectTo("/login");
        done();
      });
  });

});

