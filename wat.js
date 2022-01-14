import * as THREE from 'https://threejs.org/build/three.module.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/controls/OrbitControls.js'

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
    amplitude: 0.1,
  }
}

function main() {
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
  scene.background = new THREE.Color( 0x59595959 );

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
  function updateTexture() {
    texture.needsUpdate = true;
  }

  /////////////////////
  /////////GUI/////////
  /////////////////////
  const gui = new GUI();
  gui.add(planemesh.scale, 'x', 0, 10, 0.1).name('width');
  gui.add(planemesh.scale, 'y', 0, 10, 0.1).name('height');
  gui.add(initial.attributes, 'speed', 0.1, 10, 0.01).name('speed');
  gui.add(initial.attributes, 'amplitude', 0.001, 1, 0.01).name('amplitude');

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
      planemesh.geometry.attributes.position.setZ(index, (initial.attributes.amplitude * randomValues[index] * Math.sin(frame * initial.attributes.speed) / 5))
    }

    // let i = 0, j = 0;

		// 		for ( let ix = 0; ix < 100; ix ++ ) {

		// 			for ( let iy = 0; iy < 100; iy ++ ) {

		// 				array[ i + 1 ] = ( Math.sin( ( ix + frame /100) * 0.03 )  ) +
		// 								( Math.sin( ( iy + frame /100) * 0.05 )  );
		// 				i += 3;
						

		// 			}

		// 		}
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
