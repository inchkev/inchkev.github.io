import 'normalize.css';
import * as THREE from 'three';
import image360 from '../assets/images/dlmfvr.png';

var camera, scene, renderer, mesh;

window.addEventListener('DOMContentLoaded', main);

function main() {
    init();
    animate();
}

function init() {
    var container = document.getElementById('three')
    console.log("hello")
    console.log(container)

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    scene = new THREE.Scene();

    var geometry = new THREE.SphereBufferGeometry(100, 60, 40);
    geometry.scale(- 1, 1, 1);

    var texture = new THREE.TextureLoader().load(image360)
    var material = new THREE.MeshBasicMaterial({map: texture});

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // document.addEventListener('mousemove', onPointerMove, false);
    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    requestAnimationFrame(animate);
    update();
}

function update() {
    // lat = Math.max(- 85, Math.min(85, lat));
    // phi = THREE.MathUtils.degToRad(90 - lat);
    // theta = THREE.MathUtils.degToRad(lon);

    // camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
    // camera.target.y = 500 * Math.cos(phi);
    // camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
    // camera.lookAt(camera.target);

    renderer.render(scene, camera);
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
