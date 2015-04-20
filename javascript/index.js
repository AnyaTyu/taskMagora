ko.punches.enableAll();
ko.filters.my_date = function(value) {
    var now = moment();
    if(now.diff(moment(value)) < 184561702){
        return moment(value).fromNow();
    }
    else{
        return moment(value).format("dddd, MMMM Do YYYY, h:mm:ss")
    }

};

var NotesModel = function(contacts) {
    var self = this;
    self.name = 'Test';
    self.notes = ko.observableArray([{text:'one year ago',date:1398028965000},{text:'3 days',date:1429392165000},{text:'month',date:1427836965000}]);
    self.note = ko.observable(self.defaultValue);
    self.save = function(){
        var val = self.note();

        if($.trim(val).length>0){
            self.notes.unshift({
                text:val,
                date:Date.parse(new Date())
            });
            self.note('');
        }
    };
    self.deleteItem = function(o,e){
        self.notes.remove(o);
    }
};

ko.applyBindings(new NotesModel());