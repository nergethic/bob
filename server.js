var http = require('http')
var url = require('url')
var fs = require("fs")
var qs = require("querystring")
var socketio = require("socket.io")
var mongoose = require("mongoose")
var Models = require("./database/Models.js")(mongoose)
var Operations = require("./database/Operations.js")
var db, opers = new Operations()
var userObject, admin = false, online = [], id = []
mongoose.connect('mongodb://localhost/userdb')

var server = http.createServer(function (request, response) {
    switch (request.method) {
        case "GET":
            console.log(request.url)
            var path = "", type = "";
            if (request.url == "/favicon.ico") {
                break;
            }
            if (request.url == "/")
                path = "staticDir/index.html"
            else
                path = "staticDir" + request.url

            if (request.url != "/css/style.css") {
                type = 'text/html; charset=utf-8';
            } else {
                type = 'text/css; charset=utf-8';
            }

            fs.readFile(path, function (error, data) {
                response.writeHead(200, {
                    'Content-Length': Buffer.byteLength(data, 'utf8'),
                    'Content-Type': type,
                })
                response.write(data, 'utf8')
                response.end()
            })

        case "POST":
            //servResp(request, response)
            break;
    }


})

console.log("Port:3000")
server.listen(3000);

function connectToMongo() {
    db = mongoose.connection;

    db.on("error", function () {
        console.log("problem z mongo")
    });

    db.once("open", function () {
        console.log("mongo jest podłączone - można wykonywać operacje na bazie");
        opers.SelectByNameLimitCallback(Models.User, "admin", 1, function (userData) {
            if (userData.data.length < 1) {
                console.log("Utworzono uzytkownika: admin")
                userObject = new Models.User(
                {
                    login: "admin",
                    password: "admin",
                });

                userObject.validate(function (err) {
                    console.log(err);
                });

                opers.InsertOne(userObject);
                admin = true;
            } else {
                console.log("Juz istnieje uzytkownik: admin")
            }
        })   
    });

    db.once("close", function () {
        console.log("mongodb zostało odłączone");
    });
}

connectToMongo();

var io = socketio.listen(server)
io.sockets.on("connection", function (client) { 
    console.log("klient sie podłączył:  " + client.id)

    client.emit("onconnect", {
        clientName: client.id,
        admin: admin,
    })

    client.on("emptydb", function () {
        opers.DeleteAll(Models.User);
    })

    client.on("userAction", function (data) {
        opers.SelectByNameLimitCallback(Models.User, data.username, 1, function (userData) {
            console.log(userData)
            if (data.action == 'register') {
                if (userData.data.length < 1) {
                    userObject = new Models.User(
                    {
                        login: data.username,
                        password: data.password,
                    });

                    userObject.validate(function (err) {
                        console.log(err);
                    });

                    opers.InsertOne(userObject);
                    console.log("Added user");

                    io.sockets.to(client.id).emit("registered", {
                        status: true,
                        username: data.username,
                    });

                } else {
                    console.log("User is already in db")
                    io.sockets.to(client.id).emit("registered", {
                        status: false,
                    });
                }
            }

            if (data.action == 'login') {
                if (data.username == userData.data[0].login && data.password == userData.data[0].password) {
                    if (online.indexOf(data.username) > -1) {
                        console.log("user already logged in");
                        io.sockets.to(client.id).emit("loggedin", {
                            status: false,
                            info: 'busy',
                        });
                    } else {
                        console.log("login successful");
                        online.push(data.username);
                        id.push(client.id);
                        io.sockets.to(client.id).emit("loggedin", {
                            status: true,
                            username: data.username, 
                        });
                        if (data.username == 'admin') {
                            opers.SelectLimitCallback(Models.User, 10, function (users) {
                                io.sockets.to(client.id).emit("administrator", users);
                            })
                        }                        
                    }                   
                } else {
                    console.log("Wrong password or login");
                    io.sockets.to(client.id).emit("loggedin", {
                        status: false,
                        info: 'bad',
                    });
                }
            }
        })         
    })

    client.on("saveBuilds", function (data) {
        opers.UpdateBuilds(Models.User, data.username, data.array)
        console.log("saved build state")
    })

    client.on("restoreBuilds", function (data) {
        opers.SelectByNameLimitCallback(Models.User, data.username, 1, function (userData) {
            io.sockets.to(client.id).emit("restoreBuilds", userData.data[0].builds)
        })
        console.log("fetching builds...")
    })

    client.on("clickPos", function (data) {
        client.broadcast.emit("clicked", {
            clicked: data.clicked,
            x: data.x,
            y: data.y,
            z: data.z,
        });
    })

    client.on("updateSettings", function (data) {
        client.broadcast.emit("updateSettings", {
            a: data.action,
            x: data.x,
            y: data.y,
            z: data.z,
            c: data.color,
            s: data.size,
            r: data.rotation,
        });
    })

    client.on("disconnect", function () {
        console.log("klient się rozłącza");
        let index = id.indexOf(client.id);
        online.splice(index, 1);
        id.splice(index, 1);
    })
    admin = false;
})
