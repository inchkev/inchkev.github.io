import * as THREE from 'three';
import image360 from './assets/dlmfvr_inverted.jpg';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);

var mouseX = 0;
var mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;
var target = new THREE.Vector3(0, 0, 1000);

window.addEventListener('DOMContentLoaded', main);

function main() {
  init();
  animate();
}

function init() {
  camera.lookAt(target)

  const geometry = new THREE.SphereGeometry(100, 8, 8);
  geometry.scale(-1.0, 1.0, 1.0);

  const texture = new THREE.TextureLoader().load(image360)
  const material = new THREE.MeshBasicMaterial({map: texture});

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  const container = document.getElementById('three')
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
  target.x += (-mouseX - target.x) * 0.02;
  target.y += (-mouseY - target.y) * 0.02;
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

  windowHalfX = window.innerWidth / 2.0;
  windowHalfY = window.innerHeight / 2.0;
}
