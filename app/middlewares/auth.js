exports.checkUser = (req, res, next) => {
    if(req.session.user) {
        next();
    } else {
        res.render('../public/forbidden');
    }
};
