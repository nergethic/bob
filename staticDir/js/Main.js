function Main(client) {
    
    var geometry, material, mesh, pkt, cubeArray = [], colorTable = [0x197DFF, 0x19FF9A, 0xFF006F, 0x93FF3F, 0xFFAA3F, 0xAA3FFF, 0xD3FFFF]

    var kamera = {
        x: 0,
        y: 0,
    }

    let gs = {
        index: -1,
        intro: true,
        ci: 0,
        rot: 0,
        size: 0,
        pos: [],
        x: null,
        y: null,
        z: null,
        firstX: null,
        amount: 0,
        loggedIn: false,
        form: 'register',
        playerBuilds: [],
        username:'',
    }

    meshes = {
        intro: null,
    }

    let angle = 0.0
    let r = 700.0

    var scene = new THREE.Scene()

    var camera = new THREE.OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        0,
        10000
    )

    camera.position.x = 700
    camera.position.y = 500
    camera.position.z = 700
    camera.lookAt(scene.position)

    var renderer = new THREE.WebGLRenderer()

    renderer.setClearColor(0xfefefe)

    renderer.setSize(document.body.clientWidth, document.body.clientHeight)
    let main = document.getElementById("container")
    main.appendChild(renderer.domElement)

    var loader = new THREE.TextureLoader()
    var intro = new Intro(scene)
    var game = new Game(scene)
    var klocek = new Klocek(scene)

    function point() {

        geometry = new THREE.CubeGeometry(1, 1, 1, 100, 100, 100)
        material = new THREE.MeshBasicMaterial({
            color: 0xffffff, side: THREE.DoubleSide, wireframe: true
        })

        pkt = new THREE.Mesh(geometry, material)
        scene.add(pkt)

        game.plansza()
    }
    
    document.getElementById("add").addEventListener("click", function () {
        let login = document.getElementById("login").value;
        gs.username = login;
        document.getElementById("login").value = "";
        let pass = document.getElementById("passwd").value;
        document.getElementById("passwd").value = "";
        gs.form = 'register';
        client.emit("userAction", {
            action: gs.form,
            username: login,
            password: pass,
        })
    }, false)

    document.getElementById("pAlready").addEventListener("click", function () {
        let login = document.getElementById("login").value;
        gs.username = login;
        document.getElementById("login").value = "";
        let pass = document.getElementById("passwd").value;
        document.getElementById("passwd").value = "";
        gs.form = 'login';
        client.emit("userAction", {
            action: gs.form,
            username: login,
            password: pass,
        })
    }, false)

    document.getElementById("clearDB").addEventListener("click", function () {
        client.emit("emptydb");
    }, false)

    function updateSettings(a) {
        client.emit("updateSettings", {
            action: a,
            x: gs.x,
            y: gs.y,
            z: gs.z,
            color: gs.ci,
            size: gs.size,
            rotation: gs.rot
        })
    }

    function emitKlocek() {
        client.emit("clickPos", {
            clicked: true,
            x: gs.x,
            y: gs.y,
            z: gs.z
        })
    }

    document.addEventListener("keydown", onKeyDown, false)
    document.addEventListener("keyup", onKeyUp, false)
    document.addEventListener("mousedown", function (e) {
        if (gs.loggedIn) {
            onMouseDown(e)
            emitKlocek()
        }
  
    }, false);

    client.on("onconnect", function (data) {
        if (data.admin) {
           // alert("admin created")
        } else {
           // alert("admin already in database")
        }
    })

    client.on("registered", function (data) {
        if (data.status) {
            //alert("Registration successful! Username: " + data.username)
        } else {
            alert("Username taken")
        }
    })

    client.on("restoreBuilds", function (data) {
        
        for (let j in cubeArray) {
            scene.remove(cubeArray[j])
        }

        cubeArray.length = 0

        for (let i in data) {
            klocek.createCube(data[i].x, data[i].y, data[i].z, 1)
            klocek.changeColor(colorTable[data[i].color])
            klocek.changeRotation(data[i].rotation)
            cubeArray.push(klocek.getMesh())
        }
    })

    client.on("updateSettings", function (data) {  
        if (data.a == 'color'){
            klocek.changeColor(colorTable[data.c]);
        }

        if (data.a == 'rotation') {
            klocek.changeRotation(data.r);
        }

        if (data.a == 'size') {
            //klocek.changeSize(data.s);
        }  
    })

    client.on("loggedin", function (data) {

        if (data.status) {
           // alert("successful login")
            document.getElementById('overlay').outerHTML = '';
            gs.loggedIn = true;
            let sidebar = document.createElement("div");
            sidebar.id = "sidebar";
            document.body.appendChild(sidebar);
            let save = document.createElement("div");
            save.classList.add("box");
            save.innerHTML = "save";
            sidebar.appendChild(save);
            save.addEventListener('click', function () {
                client.emit("saveBuilds", {
                    username: gs.username,
                    array: gs.playerBuilds,
                });
            }, false);

            let restore = document.createElement("div");
            restore.classList.add("box");
            restore.innerHTML = "restore";
            sidebar.appendChild(restore);
            restore.addEventListener('click', function () {
                client.emit("restoreBuilds", {
                    username: gs.username,
                });
            }, false);

            let remove = document.createElement("div");
            remove.classList.add("box");
            remove.innerHTML = "clear";
            sidebar.appendChild(remove);
            remove.addEventListener('click', function () {
                for (let i in cubeArray) {
                    scene.remove(cubeArray[i]);
                }
            }, false);

        } else {
            if (data.info == 'bad') {
                alert("invalid login or password")
            } else {
                alert("already connected")
            }
            
        }
    })

    client.on("administrator", function (data) {

        for (let i in data.data) {
            let div = document.createElement("div");
            div.classList.add("box");
            div.innerHTML = data.data[i].login;
            sidebar.appendChild(div);
            div.addEventListener('click', function () {
                client.emit("restoreBuilds", {
                    username: data.data[i].login,
                });
            }, false);
        }
    })

    var raycaster = new THREE.Raycaster(); // obiekt symuluj�cy "rzucanie" promieni
    var mouseVector = new THREE.Vector2() // wektor (x,y) wykorzystany b�dzie do okre�lenie pozycji myszy na ekranie
    
    client.on("clicked", function (data) {
        onMouseDown(data.clicked, data.x, data.y, data.z);
    })

    function onMouseDown(e,x,y,z) {
        if (gs.intro) {
            var axis = new THREE.AxisHelper(1000)
            scene.add(axis);
            point()
            scene.remove(intro.getIntro())
            gs.intro = false;
        } else {
            if (x) {
                gs.x = x
                gs.y = y
                gs.z = z
                gs.size = 1
                gs.ci = 0
                gs.rot = 0
                klocek.createCube(gs.x, gs.y, gs.z, gs.size);  
            } else {
                mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1
                mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1
                raycaster.setFromCamera(mouseVector, camera)
                var intersects = raycaster.intersectObjects(scene.children, true)

                if (intersects.length > 0) {
                    let selected = intersects[0].object

                    if (selected.name == "siatka" | selected.name == "lego") {
                        gs.x = selected.position.x
                        gs.y = selected.position.y
                        gs.z = selected.position.z
                        gs.ci = 0
                        gs.size = 1
                        gs.rot = 0

                        if (selected.name == "siatka") { //plansza

                        }
                        if (selected.name == "lego") {
                            gs.y += 35
                        }

                        let cube = klocek.createCube(gs.x, gs.y, gs.z, gs.size);
                        cubeArray.push(klocek.getMesh());
                        console.log("mesh: " + klocek.getMesh())

                        gs.playerBuilds.push({
                            x: gs.x,
                            y: gs.y,
                            z: gs.z,
                            color: gs.ci,
                            rotation: gs.rot,
                            size: gs.size,
                        })

                        if (klocek.getMesh()) {
                            let info = klocek.getMesh();
                            gs.rot = info.rotation.y;
                            gs.firstX = info.position.x;
                        }

                        gs.index++
                    }
                }
            }   
        }
    }

    function onKeyDown(e) {
        switch (e.key) {

            case "Escape": break;

            case "a": {
                kamera.x = 1.0
            } break;

            case "s": {
                kamera.y = -1.0
            } break;

            case "d": {
                kamera.x = -1.0
            } break;

            case "w": {
                kamera.y = 1.0
            } break;

            case "Control": { // color change
                gs.ci += 1
                klocek.changeColor(colorTable[gs.ci])
                gs.playerBuilds[gs.index].color = gs.ci
                updateSettings('color')

                if (gs.ci > colorTable.length - 1) {
                    gs.ci = 0
                } 
            } break;

            case "ArrowLeft": { // rotate left
                gs.rot -= Math.PI / 2.0
                klocek.changeRotation(gs.rot)
                gs.playerBuilds[gs.index].rotation = gs.rot
                updateSettings('rotation')
            } break;

            case "ArrowRight": { // rotate right
                gs.rot += Math.PI / 2.0
                klocek.changeRotation(gs.rot)
                gs.playerBuilds[gs.index].rotation = gs.rot
                updateSettings('rotation')
            } break;

            case "ArrowUp": { // change size
                gs.size += 1
                gs.playerBuilds[gs.index].size = gs.size
                updateSettings('size')
            } break;

            case "ArrowDown": { // change size
                if (gs.size > 1) {
                    gs.size -= 1
                    gs.amount += 1
                    gs.playerBuilds[gs.index].size = gs.size
                    updateSettings('size')
                }
            } break;

            default: break;
        }
    }

    function onKeyUp(e) {
        switch (e.key) {
            case "a": {
                kamera.x = 0.0
            } break;
                
            case "s": {
                kamera.y = 0.0
            } break;

            case "d": {
                kamera.x = 0.0
            } break;

            case "w": {
                kamera.y = 0.0
            } break;
            
            default: break;
        }
    }

    let ambientLight = new THREE.AmbientLight(0x777777)

    let spotLight = new THREE.SpotLight(0xdedede)
    spotLight.position.set(-300, 700, -300)
    spotLight.castShadow = true
    
    let spotLight2 = new THREE.SpotLight(0xffffff)
    spotLight2.position.set(300, 650, 300)
    spotLight2.castShadow = true

    scene.add(ambientLight)
    scene.add(spotLight)
    scene.add(spotLight2)

    let clock = new THREE.Clock()
    let dt = 0.0
    let introTimer = 0.0

    function step() {
        requestAnimationFrame(step)

        dt = clock.getDelta()
        introTimer += dt

        if (gs.loggedIn) {
            if (kamera.x != 0) {

                angle += 0.1 * kamera.x
                camera.position.z = Math.sin(angle) * r
                camera.position.x = Math.cos(angle) * r
            }

            if (kamera.y != 0) {
                camera.position.y += 5 * kamera.y
            }
        }
        
        if (gs.intro && intro.getIntro()) {
            let mesh = intro.getIntro()
            mesh.position.x = 200.0*Math.sin(2.0*introTimer)
            mesh.rotateY(dt) // 0.0999 WTF!?
        }
        
        camera.lookAt(scene.position)
        camera.updateProjectionMatrix()

        renderer.render(scene, camera)
    }

    step()
}
