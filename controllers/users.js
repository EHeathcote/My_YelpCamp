const User = require('../models/user');


module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        // console.log(registeredUser);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to yelp camp');
            res.redirect('/campgrounds'); 
        })
    } catch(e){
        req.flash('error', e.message);
        res.redirect('/register');

    }

}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}


module.exports.login = (req, res) => {
    const redirectUrl = res.locals.redirectUrl || '/campgrounds';
    // delete from an object using delete keyword
    delete res.locals.redirectUrl;
    req.flash('success', 'Welcome back!');
    // when someone logs in, teh redirect URL is either the returnTo or /campgrounds
    // const redirectUrl = req.session.returnTo || '/campgrounds';
    
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout(err => {
        if(err) return next(err);
        req.flash('success', 'Logged out!');
        res.redirect('/campgrounds');
    })
}