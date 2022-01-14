import * as THREE from 'https://threejs.org/build/three.module.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/controls/OrbitControls.js'

///////////////////
////INIT VALUES////
///////////////////

const initial = {
  plane: {
    width: 2,
    height: 2,
    widthSegments: 100,
    heightSegments: 100,
  },

  frustum: {
    fov: 75,
    aspect: 2,
    near: 0.1,
    far: 50,
  },

  attributes: {
    speed: 1,
    speed2: 1,
    amplitude: 0.1,
  }
}

function main() {
  ///////////////////////
  ////CANVAS & CAMERA////
  ///////////////////////

  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });
  document.body.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    initial.frustum.fov,
    initial.frustum.aspect,
    initial.frustum.near,
    initial.frustum.far
  );
  camera.position.z = 2;

  const controls = new OrbitControls(camera, renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x59595959);

  ///////////////////////////
  ////GEOMETRY & MATERIAL////
  ///////////////////////////

  const geometry = new THREE.PlaneGeometry(initial.plane.height, initial.plane.width, initial.plane.heightSegments, initial.plane.widthSegments);

  // Material based on phong-shading
  let planematerial = new THREE.MeshPhongMaterial({
    color: 0x4287f5,
    shininess: 50,
    flatShading: true,
    transparent: true,
    opacity: 0.8,
  });

  const planemesh = new THREE.Mesh(geometry, planematerial);

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

  ////////////////////////
  /////////LIGHTS/////////
  ////////////////////////

  const light = new THREE.SpotLight(0xffffff, 1.5);
  light.position.set(0, 500, 2000);
  scene.add(light);

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

  /////////////////////
  /////////GUI/////////
  /////////////////////
  const gui = new GUI();
  gui.add(planemesh.scale, 'x', 0, 10, 0.1).name('width');
  gui.add(planemesh.scale, 'y', 0, 10, 0.1).name('height');
  gui.add(initial.attributes, 'speed', 0.1, 10, 0.01).name('speed');
  gui.add(initial.attributes, 'speed2', 0.1, 10, 0.01).name('speed2');
  gui.add(initial.attributes, 'amplitude', 0.001, 1, 0.01).name('amplitude');

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
    let { array, originalpos, randomValues, count } = planemesh.geometry.attributes.position
    let { amplitude, speed, speed2 } = initial.attributes;
    frame += 0.01;
    // Moving vertices in Z-direction
    //Math.sin(frame*Math.PI/180)/10+
    for (let index = 0; index < count; index++) {
      planemesh.geometry.attributes.position.setZ(index, (amplitude * randomValues[index] * Math.sin(frame * speed) / 5));
    }

    let i = 0, j = 0;
    for ( let ix = 0; ix < Math.sqrt(count); ix ++ ) {
      for ( let iy = 0; iy < Math.sqrt(count); iy ++ ) {
        array[i + 2] += ( Math.sin( ( ix + frame * speed2 ) * 0.6 )/100 ) + 
        ( Math.sin( ( iy + frame * speed2 ) * 0.4 )/100 );
        i += 3;
      }
    }

    controls.update();
    planemesh.geometry.attributes.position.needsUpdate = true // Mandatory, otherwise operations on vertices wont show.

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
