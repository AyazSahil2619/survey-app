const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User_controller = require('./User_controller')


passport.use('local', new LocalStrategy(
    async function (username, password, done) {
        var user;
        try {
            user = await User_controller.login(username)
            if (!user) {
                return done(null, false);
            } else {
                isMatch = await User_controller.comparePassword(password, user.password)
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            }
        } catch (err) {
            done(err);
        }

    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});


// successRedirect
function islogin(req, res) {

    console.log(req.session, 'iiiiiiiii');
    console.log(req.sessionID, "SUCCESSFULLY LOGGED IN");
    console.log(req.sessionStore, "SUCCESSFULLY LOGGED IN");

    let sessionID = req.sessionID;

    console.log("sessionID == req.sessionID =", sessionID == req.sessionID);

    if (sessionID == req.sessionID) {
        res.status(200).json({
            msg: req.user
        });
    } else {
        res.status(401).json({
            msg: "INVALID"
        });
    }
}


// FailureRedirect
function loginerr(req, res) {
    console.log("LOGIN FAILED");
    res.json({
        msg: "INVALID"
    });
}

// To check whether any user is login or not
function login(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({
            msg: "INVALID"
        })
    }
}

// TO log out 
// function logout(req, res, next) {

//     console.log("LOGOUT SUCCESSFULLY")
//     if (req.isAuthenticated()) {
//         req.logout();
//         req.session.destroy();
//         console.log(req.sessionID, "SUCCESSFULLY LOGGED IN");

//         // console.log(req.session.passport.user, 'iiiiiiiii');
//         res.status(200).json({
//             msg: "Logout",
//             value: true
//         })
//     } else {
//         res.status(400).json({
//             msg: "Login First",
//             value: false
//         })
//     }
// }

function logout(req, res, next) {
    if (req.session.user && req.cookies.user_id) {
        req.session.destroy();
        res.clearCookie('user_id');

        console.log(req.cookies.user_id, "CHECKING COOKIES AFTER LOG OUT ");

        res.status(200).json({
            msg: "logout",
            value: true
        });
    }
}



function isLoggedIn(req, res, next) {

    console.log(req.session.user, req.cookies.user_id);

    if (req.session.user && req.cookies.user_id) {
        next();
    } else {
        res.status(401).json({
            msg: 'INVALID'
        });
    }
}


function isNotLoggedIn(req, res, next) {
    if (req.session.user && req.cookies.user_id) {

        res.status(401).json({
            msg: 'Logout First'
        });
        res.end();
    } else {
        console.log("IN HERE");
        next();
    }
}


module.exports = {

    login,
    islogin,
    loginerr,
    logout,
    isLoggedIn,
    isNotLoggedIn

}