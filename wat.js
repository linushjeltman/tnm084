import * as THREE from 'https://threejs.org/build/three.module.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/controls/OrbitControls.js'

///////////////////
////INIT VALUES////
///////////////////

const initial = {
  plane: {
    width: 5,
    height: 5,
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
    speed: 2,
    speed2: 1,
    noisescale: 1,
    amplitude: 1,
    sineFreq: 100,
    hashenabled: true,
    modsineenabled: false,
  },
  noise: {
    hash: function hash(i) {
      let temp = (34*i^2 +10*i)%389;
      return temp
    },
    modSine: function modSine(i,j,freq) {
      return Math.abs(Math.sin( (i + j) * freq/57,29578779  ))-Math.trunc(Math.abs(Math.sin((i + j)*freq/57,29578779))); // modified sine as in lectures, pi/180 = 1/57,29578779
    } 
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

  ////////////////////////
  /////////LIGHTS/////////
  ////////////////////////

  const light = new THREE.SpotLight(0xffffff, 1.5);
  light.position.set(500, 500, 2000);
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
  gui.add(initial.attributes, 'noisescale', 0.001, 1, 0.01).name('noisescale');
  gui.add(initial.attributes, 'amplitude', 0, 3, 0.01).name('amplitude');
  gui.add(initial.attributes, 'sineFreq', 1, 360, 1).name('sineFreq');
  gui.add(initial.attributes, 'hashenabled').name('hash');
  gui.add(initial.attributes, 'modsineenabled').name('modsine');

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



  let frame = 0, mods = 0, rand;
 
  function render() {
    let { array, count } = planemesh.geometry.attributes.position // Access to verticies 
    let { amplitude,noisescale, speed, speed2, sineFreq, hashenabled, modsineenabled } = initial.attributes; // Acess to values that are being modified by GUI
    let { hash, modSine } = initial.noise; // Accessing noise-functions
    
    frame += 0.01; // This is used to make things move

    let i = 0;
    for ( let ix = 0; ix < Math.sqrt(count); ix ++ ) {
      for ( let iy = 0; iy < Math.sqrt(count); iy ++ ) {
        mods = (modsineenabled === true ? modSine(frame, iy, sineFreq)*noisescale/100 : 1);
        rand =  (hashenabled === true ?  hash(hash(iy)+ix)*noisescale/100 : 1);
        
        array[i + 2] = amplitude / 50 *(Math.sin( frame * speed * mods * rand) + Math.sin( ( frame * speed2 + mods + rand) ) ) ;
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
