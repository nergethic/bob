module.exports = function () {

    var opers = {

        //INSERT
        InsertOne: function (data) {
            data.save(function (error, data, dodanych) {
                console.log("dodano " + data)
            })
        },

        //SELECT
        SelectAll: function (Model) {
            Model.find({}, function (err, data) {
                if (err) return console.error(err);
                console.log(data);
            })
        },

        //WHERE, LIMIT
        SelectByName: function (Model, login, count) {
            Model.find({ login: login }, function (err, data) {
                if (err) return console.error(err);
                console.log(data);
            }).limit(count)
        },

        //DELETE
        DeleteAll: function (Model) {
            Model.remove(function (err, data) {
                if (err) return console.error(err);
                console.log(data);
            })
        },

        //DELETE (by id)
        DeleteOne: function (Model, id) {
            Model.remove({ _id: id }, function (err, data) {
                if (err) return console.error(err);
                console.log(data);
            })
        },

        //UPDATE (builds)
        UpdateBuilds: function (Model, login, newBuilds) {
            Model.update({ login: login }, { builds: newBuilds }, function (err, data) {
                if (err) return console.error(err);
                console.log(data);
            })
        },

        //RESTORE (builds)
        /*
        RestoreBuildsCallback: function (Model, count, callback) {
            var obj = {};
            Model.find({}, function (err, data) {
                if (err) {
                    obj.data = err
                }
                else {
                    obj.data = data
                }
                //funkcja zwracająca dane na zewnątrz
                callback(obj);
            }).limit(count)
        },*/

        //SELECT (z ograniczeniem wynikow)
        SelectLimitCallback: function (Model, count, callback) {
            var obj = {};
            Model.find({}, function (err, data) {
                if (err) {
                    obj.data = err
                }
                else {
                    obj.data = data
                }
                //funkcja zwracająca dane na zewnątrz
                callback(obj);
            }).limit(count)
        },

        SelectByNameLimitCallback: function (Model, login, count, callback) {
            var obj = {};
            Model.find({ login: login }, function (err, data) {
                if (err) {
                    obj.data = err
                }
                else {
                    obj.data = data
                }
                //funkcja zwracająca dane na zewnątrz
                callback(obj);
            }).limit(count)
        },
    }

    return opers;

}