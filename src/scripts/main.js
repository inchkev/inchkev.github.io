import 'normalize.css';
import * as THREE from 'three';
import image360 from '../assets/images/dlmfvr.png';

// var camera, scene, renderer;

// init();

// function init() {
//     var mesh;

//     camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
//     camera.target = new THREE.Vector3( 0, 0, 0 );

//     scene = new THREE.Scene();

//     var geometry = new THREE.SphereBufferGeometry( 500, 60, 40 );
//     // invert the geometry on the x-axis so that all of the faces point inward
//     geometry.scale( - 1, 1, 1 );

//     var material = new THREE.MeshBasicMaterial({
//         map: THREE.TextureLoader().load(image360)
//     });

//     mesh = new THREE.Mesh( geometry, material );
//     scene.add( mesh );

//     renderer = new THREE.WebGLRenderer();
//     renderer.setPixelRatio( window.devicePixelRatio );
//     renderer.setSize( window.innerWidth, window.innerHeight );

//     // document.addEventListener( 'mousemove', onPointerMove, false );
//     window.addEventListener( 'resize', onWindowResize, false );
// }


init()
animate();

var scene, camera, renderer, cube

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    var geometry = new THREE.BoxGeometry();
    var material = new THREE.MeshBasicMaterial( { color: 0x2d2922 } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;
    window.addEventListener( 'resize', onWindowResize, false );
}

function animate() {
    requestAnimationFrame( animate );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
	renderer.render( scene, camera );
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}