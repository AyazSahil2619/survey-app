const express = require('express');
const bodyparser = require('body-parser');
const app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var cors = require('cors');


const User_controller = require('./login/User_controller')
const validate = require('./validation/validation')
const controller = require('./database/database_controller');
const operations = require('./operations/operation_controller');
const check = require('./login/passport')



app.use(cors({
    credentials: true,
    origin: ['http://localhost:4200', 'http://192.1.200.134:4200']
}));


app.use(cookieParser());

app.use(session({
    key: 'user_id',
    secret: 'shhhhh',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));


// app.use((req, res, next) => {

//     console.log(req.cookies.user_id, "COOKIES");

//     if (!req.session.user && req.cookies.user_id) {
//         res.clearCookie('user_id');
//     }
//     next();
// })


// Routes for registration
app.post('/register', validate.validateInsert, User_controller.insert);

// Routes for LOGIN and LOG OUT  using passport 

// app.post('/login', passport.authenticate('local', {
//     successRedirect: '/islogin',
//     failureRedirect: '/login'
// }));
// app.get('/islogin', check.islogin);
// app.get('/login', check.loginerr)



//  Route for login using session

app.post('/login', check.isNotLoggedIn, User_controller.check_login);


app.get('/checkToken/:tableid/:token', operations.checkToken);
app.get('/view/:id', operations.view);
app.get('/dropdown/:id', operations.fetchDropdownList);
app.get('/radio/:id', operations.fetchRadioList);
app.get('/checkbox/:id', operations.fetchCheckboxList);
app.put('/update/:id', operations.addDataToTable);

// app.use(check.login);

app.use(check.isLoggedIn);


// Routes for Table Manipulation

app.post('/checkTablename/:id', controller.checkTablename);
app.post('/create', controller.CreateTable);
app.put('/addColumn/:id', controller.addColumn);
app.get('/getdata', controller.viewTable);
app.delete('/delete/:id', controller.deleteTable);
app.put('/modified/:id', controller.modifyTable);
app.get('/tabledata/:id', controller.TableData);
// app.put('/editTable/:id', controller.editTable);
app.put('/editTableInfo/:id', controller.editTableInfo);
// app.post('/checkTablenameforUpdate/:id', controller.check);
app.get('/fields/:tableid/:fieldid', controller.fetchFieldData);
app.put('/fieldEdit/:tableid/:fieldid', controller.fieldEdit);
app.delete('/fieldDelete/:tableid/:fieldid', controller.fieldDelete);
app.post('/generateUrl', controller.generateUrl);
app.post('/sendMail', controller.sendMail);



// Routes for operations in table
app.get('/tablename/:id', operations.tablename);
// app.get('/view/:id', operations.view);
app.put('/update/:id', operations.addDataToTable);
app.get('/fetchdata/:id', operations.TableData);
app.delete('/deletedata/:tableid/:rowid', operations.deleteData)
app.get('/updatedata/:tableid/:uid', operations.getdetails)
app.put('/updaterow/:id', operations.updateRow);
// app.get('/dropdown/:id', operations.fetchDropdownList);
// app.get('/radio/:id', operations.fetchRadioList);
// app.get('/checkbox/:id', operations.fetchCheckboxList);

// app.get('/loggedout', check.logout)
app.get('/loggedout', check.isLoggedIn, check.logout);





module.exports = app;