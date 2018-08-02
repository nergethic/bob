function Klocek(scene) {
    var singleMesh, local = this
    this.createCube = function (x, y, z, s) {
        //najpierw tworzymy meshe bez materia³u
        let cylinderArray = [], geometryCylinder;
        currentMeshes = []
        for (let j = 1; j < s+1 ; ++j) {
            let geometryBox = new THREE.BoxGeometry(50, 35, 50);
            let meshBox = new THREE.Mesh(geometryBox);
            for (let i = 0; i < 4; ++i) {
                geometryCylinder = new THREE.CylinderGeometry(5, 7, 5, 32);
                cylinderArray[i] = new THREE.Mesh(geometryCylinder);
            }

            //ustawiamy ich pozycje

            meshBox.position.set(0, 17.5, 0);
            cylinderArray[0].position.set(15, 35, 15);
            cylinderArray[1].position.set(15, 35, -15);
            cylinderArray[2].position.set(-15, 35, -15);
            cylinderArray[3].position.set(-15, 35, 15);

            let singleGeometry = new THREE.Geometry();

            meshBox.updateMatrix(); // bez tego pozycja geometrii jest zawsze 0,0,0
            singleGeometry.merge(meshBox.geometry, meshBox.matrix);

            for (let i in cylinderArray) {
                cylinderArray[i].updateMatrix();
                singleGeometry.merge(cylinderArray[i].geometry, cylinderArray[i].matrix);
            }
            let klocekMaterial = new THREE.MeshLambertMaterial({ color: 0xa15eff });
            singleMesh = new THREE.Mesh(singleGeometry, klocekMaterial);
            singleMesh.position.set(x + ((s-1) * 50), y, z)
            singleMesh.name = "lego";
            scene.add(singleMesh);
        }
        /*
        let obj = new THREE.Object3D();
        for (let i in currentMeshes) {
            obj.add(currentMeshes[i]);
        }
        scene.add(obj)
        */
    }

    this.getMesh = function () {
        return singleMesh;
    }

    this.changeColor = function (c) {
         singleMesh.material.color.setHex(c);
    }

    this.changeRotation = function (r) {
        singleMesh.rotation.y = r;
        //console.log(singleMesh);
    }

    this.changeSize = function (x, y, z, s) {
        scene.remove(singleMesh);
        if (s == 1) {
            local.createCube(x, y, z, s);
        } else {
            
        }
    }

}