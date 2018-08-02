function ElementSiatki(scene) {
    let conf = {
        size: 15,
        px: 0,
        py: 0,
        pz: 0,
        row: 0,
        shift: 0,
        
    }
    conf.px = (conf.size / 2)  * -50;
    conf.pz = (conf.size / 2)  * -50;
    let lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    let planeMaterial = new THREE.MeshBasicMaterial({ color: 0xedbf63, side: THREE.DoubleSide });
    let geometryLine = new THREE.Geometry();
    let geometryPlane = new THREE.PlaneGeometry(50, 50);

    geometryLine.vertices.push(new THREE.Vector3(0, 0, 0));
    geometryLine.vertices.push(new THREE.Vector3(50, 0, 0));
    geometryLine.vertices.push(new THREE.Vector3(50, 0, 50));
    geometryLine.vertices.push(new THREE.Vector3(0, 0, 50));
    geometryLine.vertices.push(new THREE.Vector3(0, 0, 0));

    let lineMesh = new THREE.Line(geometryLine, lineMaterial);
    let planeMesh = new THREE.Mesh(geometryPlane, planeMaterial);
    //lineMesh.position.set(-25, conf.py, -25);
    //planeMesh.position.set(0, conf.py, 0);
    planeMesh.rotateX(Math.PI / 2);
    //scene.add(lineMesh);
    //scene.add(planeMesh);
    
    for (let i = 0; i < conf.size * conf.size; ++i) {
        let lineClone = lineMesh.clone();
        let planeClone = planeMesh.clone();
        planeClone.name = "siatka";
        planeClone.position.set(conf.px, conf.py, conf.pz);
        lineClone.position.set(conf.px - 25, conf.py, conf.pz - 25); 
        scene.add(lineClone);
        scene.add(planeClone);
        conf.px += 50;
        conf.row++;
        if (conf.row % conf.size == 0) {
            conf.shift++;
            conf.pz += 50;
            conf.px = (conf.size / 2 * -50)   
        }
       
    }
}