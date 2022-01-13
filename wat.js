import * as THREE from 'https://threejs.org/build/three.module.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js';
import {OrbitControls} from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/controls/OrbitControls.js'

const initial = {
  plane: {
    width: 2,
    height: 2,
    widthSegments: 100,
    heightSegments: 100,
  },

  frustum: {
    fov: 75,
    aspect: 2,  // the canvas default
    near: 0.1,
    far: 50,
  },

  attributes: {
    speed: 1,
    amplitude: 1,
    
  }

}

//Material with variables controlled by GUI
let planematerial = new THREE.MeshPhongMaterial({
  color:0xffff00, // Main color of the plane
  side: THREE.DoubleSide, //Render both sides
});

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });
  document.body.appendChild( renderer.domElement );

  const camera = new THREE.PerspectiveCamera(
    initial.frustum.fov,
    initial.frustum.aspect,
    initial.frustum.near,
    initial.frustum.far
  );
  camera.position.z = 2;

  const controls = new OrbitControls( camera, renderer.domElement );

  const scene = new THREE.Scene();

  // const cubes = [];  // just an array we can use to rotate the cubes
  // const loader = new THREE.TextureLoader();
  // const texture = loader.load('https://threejs.org/manual/examples/resources/images/wall.jpg');
  // const material = new THREE.MeshBasicMaterial({
  //   map: texture,
  // });

  const geometry = new THREE.PlaneGeometry(initial.plane.height, initial.plane.width, initial.plane.heightSegments, initial.plane.widthSegments);
  const wireframe = new THREE.WireframeGeometry(geometry);
  const line = new THREE.LineSegments(wireframe);

  const material = new THREE.MeshBasicMaterial({ color: 0xffff00});
  let planemesh = new THREE.Mesh(geometry, material);

  line.material.depthTest = false;
  line.material.opacity = 0.25;
  line.material.transparent = true;

  planemesh.rotateX(-1); 
  planemesh.rotateZ(0.7);

  scene.add(planemesh);

  const { array } = planemesh.geometry.attributes.position
  const randomValues = []
  for (let i = 0; i < array.length; i++) {
    randomValues.push(Math.random())
  }
  planemesh.geometry.attributes.position.randomValues = randomValues
  planemesh.geometry.attributes.position.originalpos = planemesh.geometry.attributes.position.array


  //cubes.push(planeGeometry);

  //////////////////////////////////
  /////////Helper functions/////////
  //////////////////////////////////
  {

    class DegRadHelper {
      constructor(obj, prop) {
        this.obj = obj;
        this.prop = prop;
      }
      get value() {
        return THREE.MathUtils.radToDeg(this.obj[this.prop]);
      }
      set value(v) {
        this.obj[this.prop] = THREE.MathUtils.degToRad(v);
      }
    }

    class StringToNumberHelper {
      constructor(obj, prop) {
        this.obj = obj;
        this.prop = prop;
      }
      get value() {
        return this.obj[this.prop];
      }
      set value(v) {
        this.obj[this.prop] = parseFloat(v);
      }
    }
  }
  function updateTexture() {
    texture.needsUpdate = true;
  }

  /////////////////////
  /////////GUI/////////
  /////////////////////
  const gui = new GUI();
  gui.add(planemesh.scale, 'x', 0, 10, 0.1).name('width');
  gui.add(planemesh.scale, 'y', 0, 10, 0.1).name('height');
  gui.add(initial.plane, 'widthSegments', 0, 10, 0.1).name('widthS');
  gui.add(initial.plane, 'heightSegments', 0, 10, 0.1).name('heigthS');
  gui.add(initial.attributes, 'speed', 0.1, 10, 0.01).name('speed');
  gui.add(initial.attributes, 'amplitude', 0.1, 2, 0.01).name('amplitude');
  
  //gui.add(line.wSegments ,'widthSegment', 1, 20, 1).name('hs');

  console.log(planemesh);

  ///////////////////////////
  /////////Rendering/////////
  ///////////////////////////

  

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  let frame = 0;

  function render() {

    frame += 0.01;
    let { array, originalpos, randomValues } = planemesh.geometry.attributes.position

    // Moving vertices in Z-direction
    for (let index = 0; index < planemesh.geometry.attributes.position.count; index++) {
      planemesh.geometry.attributes.position.setZ(index, (initial.attributes.amplitude * randomValues[index] * Math.sin(frame*initial.attributes.speed)/5))

    }
    controls.update();

    planemesh.geometry.attributes.position.needsUpdate = true

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();