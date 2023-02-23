

//New
const newPost = function(req, res) {
    if(req.isUnauthenticated()) {
        res.redirect("/")
    } else {
        res.render("posts/new", {
        isAuthenticated: req.isAuthenticated(),
        flash: {},
        title: null,
        content: null,
        id: null
        });
    };
}

  module.exports = {newPost} 