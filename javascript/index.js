/*
 init Parse
 */
Parse.initialize("OJRjJ4PcoY4JFTHl1FhU9HAAMUs23eNUoz5bNlbo", "nUwBpwFYP1uJEsimoRcrn6xMbMROkEqPrmikhNzB");
var user = new Parse.User();
var Post = Parse.Object.extend("Post");
/*
 enable ko punches for custom method
 */
ko.punches.enableAll();
/*
 custom filters for @return date in current format
 if note create < than 184561702 - two days - view it from Now
 else - in format d M Do Y h:mm:ss
 */
ko.filters.my_date = function (value) {
    var now = moment();
    if (now.diff(moment(value)) < 184561702) {
        return moment(value).fromNow();
    }
    else {
        return moment(value).format("dddd, MMMM Do YYYY, h:mm:ss")
    }

};
/*
 main KO view Model for our method
 */
var NotesModel = function (contacts) {
    var self = this;
    /*
     @name - user name for greeting
     */
    self.name = ko.observable('');
    /*
     @notes - array of notes
     */
    self.notes = ko.observableArray([]);
    /*
     @note - body of new note
     */
    self.note = ko.observable('');
    /*
     @login - user name
     */
    self.login = ko.observable('');
    /*
     @pass - user password
     */
    self.pass = ko.observable('');
    /*
     @mode - switch for view popup sign in
     */
    self.mode = ko.observable(false);
    /*
     @error - error message
     */
    self.error = ko.observable('');
    /*
     function for user sign up
     */
    self.sign_up = function () {
        var login = self.login(),
            pass = self.pass();
        if ($.trim(login).length > 0 && $.trim(pass).length > 0) {
            user.set("username", login);
            user.set("password", pass);
            user.signUp(null, {
                success: function (user) {
                    self.successLogin(user);
                },
                error: function (user, error) {
                    self.error(error.message)
                }
            });
        }
        else{
            self.error('Incorrect username or password')
        }
    };
    /*
     function for user sign up
     */
    self.sign_in = function () {
        var login = self.login(),
            pass = self.pass();
        if ($.trim(login).length > 0 && $.trim(pass).length > 0) {
            Parse.User.logIn(login, pass, {
                success: function (user) {
                    self.successLogin(user);
                },
                error: function (user, error) {
                    self.error(error.message);
                }
            });
        }
        else{
            self.error('Incorrect username or password')
        }
    };
    /*
     function for reset login form and call function info
     */
    self.successLogin = function (user) {
        self.info(user);
        self.mode(false);
        self.login('');
        self.pass('');
        self.error('');
    };
    /*
     function for find all user notes and push them in array self.notes()
     */
    self.info = function (user) {
        self.name(user._serverData.username);
        var query = new Parse.Query(Post);
        query.equalTo("user", user);
        query.find({
            success: function (usersPosts) {
                usersPosts.forEach(function (element, index, array) {
                    self.notes.unshift(array[index]._serverData);
                })
            }
        });
    };
    /*
     function for user log out
     */
    self.logout = function () {
        Parse.User.logOut();
        var currentUser = Parse.User.current(); // this will now be null
        self.mode(true);
        self.notes([]);
        self.name('');
    };
    /*
     init function for check currentUser
     if currentUser - call function self.info()
     else - show popup sign in
     */
    self.init = function () {
        var currentUser = Parse.User.current();
        if (currentUser) {
            self.info(currentUser)
        } else {
            self.mode(true);
        }
    };

    /*
     function for save new note
     */
    self.save = function () {
        var val = self.note();
        if ($.trim(val).length > 0) {
            self.notes.unshift({
                text: val,
                date: Date.parse(new Date())
            });
            self.note('');
            var user = Parse.User.current();
            var post = new Post();
            // Make a new note
            post.set("text", val);
            post.set("date", Date.parse(new Date()));
            post.set("user", user);
            post.save(null, {
                success: function (post) {
                    console.log(post);
                }
            });
        }
    };
    /*
     function for delete note
     */
    self.deleteItem = function (o, e) {
        var query = new Parse.Query(Post);
        query.equalTo("date", o.date);
        query.find({
            success: function (usersPosts) {
                usersPosts.forEach(function (element, index, array) {
                    element.destroy({
                        success: function (element) {
                            self.notes.remove(o);
                        }, error: function (element, error) {
                            console.log('object was not deleted )= ');
                        }
                    });
                })
            }
        });
    }
};

var _NewNotesModel = new NotesModel();
ko.applyBindings(_NewNotesModel);
_NewNotesModel.init();