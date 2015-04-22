/*
 init Parse
 */
Parse.initialize("OJRjJ4PcoY4JFTHl1FhU9HAAMUs23eNUoz5bNlbo", "nUwBpwFYP1uJEsimoRcrn6xMbMROkEqPrmikhNzB");
var user = new Parse.User(),
    Post = Parse.Object.extend("Post"),
    interval;
/*
 enable ko punches
 */
ko.punches.enableAll();
/*
 function filters for @return date in current format
 if note create < than 184561702 - two days - view it from Now
 else - in format d M Do Y h:mm:ss
 */
function my_date(value) {
    var now = moment();
    if (now.diff(moment(value)) < 184561702) {
        _NewNotesModel.timer(true);
        return moment(value).fromNow();
    }
    else {
        return moment(value).format("dddd, MMMM Do YYYY, h:mm:ss")
    }
}
/*
 main KO view Model for our method
 @name - user name for greeting
 @notes - array of notes
 @note - body of new note
 @login - user name
 @pass - user password
 @error - error message
 */
var NotesModel = function (contacts) {
    var self = this;
    self.name = ko.observable('');
    self.notes = ko.observableArray([]);
    self.note = ko.observable('');
    self.login = ko.observable('');
    self.pass = ko.observable('');
    self.error = ko.observable('');
    self.timer = ko.observable();
    self.noteData = ko.observable({});
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
        else {
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
        else {
            self.error('Incorrect username or password')
        }
    };
    /*
     function for reset login form and call function info
     */
    self.successLogin = function (user) {
        self.info(user);
        $('.pop_up').hide();
        self.login('');
        self.pass('');
        self.error('');
        //for focus in textarea
        $('.textarea').focus();
    };
    /*
     function for find all user notes and push them in array self.notes()
     */
    self.info = function (user) {
        self.name(user._serverData.username);
        var query = new Parse.Query(Post),
            el;
        query.equalTo("user", user);
        query.find({
            success: function (usersPosts) {
                usersPosts.forEach(function (element, index, array) {
                    el = array[index]._serverData;
                    self.notes.unshift({
                        text: el.text,
                        date: el.date,
                        time: ko.observable(my_date(el.date))
                    });
                })
            }
        });
    };
    /*
     function for user log out
     */
    self.logout = function () {
        Parse.User.logOut();
        var currentUser = Parse.User.current();
        $('.pop_up').css('display', 'flex');
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
            self.info(currentUser);
            //for focus in textarea
            $('.textarea').focus();
        } else {
            $('.pop_up').css('display', 'flex');
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
                date: Date.parse(new Date()),
                time: ko.observable(my_date(Date.parse(new Date())))
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
    };
    /*
     computed for call update page one in a minute
     */
    ko.computed(function () {
        self.timer();
        if (self.timer() && !interval) {
            interval = setInterval(function () {
                self.updateTime();
            }, 60000);
            console.log('on');
        }
        else {
            clearInterval(interval);
            console.log('off');
        }
        console.log(interval);
    });
    /*
     function for update grid
     */
    self.updateTime = function () {
        self.notes().forEach(function (element, index, array) {
            self.notes()[index].time(my_date(element.date))
        })
    };
    /*
     open popup for view note
     */
    self.openFull = function (o, e) {
        self.noteData(o);
        $('.pop_up_full').css('display', 'flex');
    };
    /*
     close popup
     */
    self.closePopup = function (o, e) {
        if (e.target && e.target.className && e.target.className === 'pop_up_full') {
            $('.pop_up_full').hide();
        }
    };
};

var _NewNotesModel = new NotesModel();
ko.applyBindings(_NewNotesModel);
_NewNotesModel.init();