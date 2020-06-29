import 'normalize.css';
import * as THREE from 'three';
import image360 from '../assets/images/dlmfvr_1.jpg';


var camera, scene, renderer;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var target = new THREE.Vector3(0, 0, 800);

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
    camera.lookAt(target)
    scene = new THREE.Scene();

    var geometry = new THREE.SphereBufferGeometry(100, 60, 40);
    geometry.scale(- 1, 1, 1);

    var texture = new THREE.TextureLoader().load(image360)
    var material = new THREE.MeshBasicMaterial({map: texture});

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
}

function onDocumentMouseMove() {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function animate() {
    requestAnimationFrame(animate);
    console.log(target);
    target.x += (-mouseX - target.x) * 0.015;
    target.y += (-mouseY - target.y) * 0.015;
    camera.lookAt(target);

    render();
}

function render() {
    renderer.render(scene, camera);
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
}
