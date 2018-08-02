function Intro(scene) {
    let textGeometry, fontMesh
    
    function init() {
        let loader = new THREE.FontLoader()

        loader.load("../json/game_font.json",
            function (obj) {
                generate(obj)

                let material = new THREE.MeshLambertMaterial({
                    color: 0xFE64A3,
                    side: THREE.DoubleSide,
                })

                let outline = new THREE.MeshBasicMaterial( { color: 0xE0FF4F, wireframe: false, wireframeLinewidth: 1 } )
                let mat = new THREE.MultiMaterial([outline, material])

                fontMesh = new THREE.Mesh(textGeometry, mat)
                fontMesh.rotation.y = 1
                fontMesh.position.set(-150, 0, 150)

                scene.add(fontMesh)
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded')
            },
            function (xhr) {
                console.log(xhr.error)
            })
        
    }
    init()

    function generate(obj) {
        textGeometry = new THREE.TextGeometry(
	    "Intro",
	    {
	        font: obj, 
	        height: 70,
	        size: 150,
            bend: true,
	    })
    }

    this.getIntro = () => {
        return fontMesh
    }
}