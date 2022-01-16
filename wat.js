import * as THREE from 'https://threejs.org/build/three.module.js';
import { GUI } from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'https://cdn.skypack.dev/pin/three@v0.134.0-mlfrkS6HEbKKwwCDDo6H/mode=imports/unoptimized/examples/jsm/controls/OrbitControls.js'


////////////////////////
////HELPER FUNCTIONS////
////////////////////////

// Perlin noise generation
   function grad1(hash,  x) {
    let h = hash & 15;
    let grad = 1.0 + (h & 7);  // Gradient value 1.0, 2.0, ..., 8.0
    if (h & 8) grad = -grad;         // and a random sign for the gradient
    return (grad * x);           // Multiply the gradient with the distance
  }
  function FADE(t) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }
  function LERP(t, a, b) {
    return ((a) + (t) * ((b) - (a)))
  }

///////////////////
////INIT VALUES////
///////////////////

const initial = {
  plane: { // Inital plane that is modified to create water
    width: 5,
    height: 5,
    widthSegments: 100,
    heightSegments: 100,
  },

  frustum: { // Frustum setup
    fov: 75,
    aspect: 2,
    near: 0.1,
    far: 50,
  },

  attributes: { // These are the values that can be modified in the GUI
    speed: 2,
    speed2: 1,
    noisescale: 1,
    amplitude: 1 / 50,
    amplitude1: 1,
    amplitude2: 1,
    hashenabled: false,
    modsineenabled: false,
    perlinenabled: true,
  },
  noise: { // Noise functions
    hash: function hash(i) { // Hash function to generate random numbers as suggested by Stefan Gustavsson, should always be used in series with offset.
      let temp = (34 * i ^ 2 + 10 * i) % 389;
      return temp
    },
    modSine: function modSine(i) {
      return Math.abs(1000000 * Math.sin(i) - Math.trunc(1000000 * Math.sin(i))) * 10; // modified sine as in lectures
    },
    perm: [151, 160, 137, 91, 90, 15,
      131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
      190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
      88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
      77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
      102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
      135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
      5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
      223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
      129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
      251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
      49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
      138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
      151, 160, 137, 91, 90, 15,
      131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
      190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
      88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
      77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
      102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
      135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
      5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
      223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
      129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
      251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
      49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
      138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
    ],
    perlinNoise: function perlinNoise(x) { // TAKEN FROM STEFAN GUSTAVSSONS GITHUB AND TRANSLATED TO JAVASCRIPT... https://github.com/stegu/perlin-noise
      let ix0, ix1;
      let fx0, fx1;
      let s, n0, n1;
  
      ix0 = Math.trunc(x); // Integer part of x
      fx0 = x - ix0;       // Fractional part of x
      fx1 = fx0 - 1;
      ix1 = (ix0 + 1) & 0xff;
      ix0 = ix0 & 0xff;    // Wrap to 0..255
  
      s = FADE(fx0);
  
      n0 = grad1(initial.noise.perm[ix0], fx0);
      n1 = grad1(initial.noise.perm[ix1], fx1);
      return 0.188 * (LERP(s, n0, n1));
    },
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
  let { height, width, heightSegments, widthSegments } = initial.plane;
  const geometry = new THREE.PlaneGeometry(height, width, heightSegments, widthSegments);

  // Material based on phong-shading
  let planematerial = new THREE.MeshPhongMaterial({
    color: 0x4287f5,
    shininess: 30,
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

  /////////////////////
  /////////GUI/////////
  /////////////////////
  const gui = new GUI();
  gui.add(planemesh.scale, 'x', 0, 10, 0.1).name('width');
  gui.add(planemesh.scale, 'y', 0, 10, 0.1).name('height');
  gui.add(initial.attributes, 'speed', 0.1, 10, 0.01).name('speed'); // Effects the frequency of the first sine wave of the animaition
  gui.add(initial.attributes, 'speed2', 0.1, 10, 0.01).name('speed2'); // Effects the frequency of the second sine wave of the animaition
  gui.add(initial.attributes, 'noisescale', 0.001, 1, 0.01).name('noisescale'); // Scaling of the noise
  gui.add(initial.attributes, 'amplitude', 0.001, 3 / 50, 0.001).name('amplitude'); // Global amplitude of waves 
  gui.add(initial.attributes, 'amplitude1', 0.1, 2, 0.001).name('amplitude1'); // Amplitude of the first sine wave
  gui.add(initial.attributes, 'amplitude2', 0.1, 2, 0.001).name('amplitude2'); // Amplitude of the second sine wave
  gui.add(initial.attributes, 'hashenabled').name('hash');
  gui.add(initial.attributes, 'modsineenabled').name('modsine');
  gui.add(initial.attributes, 'perlinenabled').name('perlin');

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

  let frame = 0, mods = 0, hashed = 0, perlin = 0;
  let { array, count } = planemesh.geometry.attributes.position // Access to verticies 
  let { amplitude, amplitude1, amplitude2, noisescale, speed, speed2, hashenabled, modsineenabled, perlinenabled } = initial.attributes; // Acess to values that are being modified by GUI
  let { hash, modSine, perlinNoise } = initial.noise; // Accessing noise-functions

  function render() {
    frame += 0.01; // This is used to make things move
    let i = 0;
    for (let ix = 0; ix < Math.sqrt(count); ix++) {
      for (let iy = 0; iy < Math.sqrt(count); iy++) {
        mods = (modsineenabled === true ? modSine(iy * ix) : 1); // Ternary operators that enables the noise functions when radiobutton is pressed
        hashed = (hashenabled === true ? hash(hash(iy) + ix) * noisescale / 100 : 1);
        perlin = (perlinenabled === true ? perlinNoise(hash(hash(iy) + ix) * noisescale / 100) * 100: 1);

        array[i + 2] = amplitude * (
          (amplitude1 * Math.sin(frame * speed / 10 * (mods + hashed + perlin )) *
            amplitude2 * Math.sin((frame * speed2 / 10 * (mods + hashed + perlin))))); // Only modify the z-component
        i += 3;
        // x = i
        // y = i + 1
        // z = i + 2
      }
    }

    controls.update();
    planemesh.geometry.attributes.position.needsUpdate = true // Mandatory, otherwise nothing will move

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
