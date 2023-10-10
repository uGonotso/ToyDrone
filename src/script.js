/////////////////////////////////////////////////////////////////////////
///// IMPORT
import './main.css'
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER
const dracoLoader = new DRACOLoader()
const loader = new GLTFLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
dracoLoader.setDecoderConfig({ type: 'js' })
loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.createElement('div')
document.body.appendChild(container)

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new THREE.Scene()
scene.background = new THREE.Color('#c8f0f9')

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: true}) // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen
renderer.outputEncoding = THREE.sRGBEncoding // set color encoding
container.appendChild(renderer.domElement) // add the renderer to html div

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
scene.add(camera)

const place = document.getElementById("place");
const move = document.getElementById("move");
const left = document.getElementById("left");
const right = document.getElementById("right");
const report = document.getElementById("report");
const attack = document.getElementById("attack");

const xValueElement = document.querySelector('#xvalue');
const yValueElement = document.querySelector('#yvalue');
const facingElement = document.querySelector('#facing')

let oneUnit = 5;
let twoUnit = 10;
let missileLaunched = false;
let states = ['start'];
let currentState = 'start';
let futureFacing
let turnAngle;
let drone;
let missile;

/////////////////////////////////////////////////////////////////////////
///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener('resize', () => {
    const width = window.innerWidth
    const height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    renderer.setPixelRatio(2)
})

/////////////////////////////////////////////////////////////////////////
///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)

/////////////////////////////////////////////////////////////////////////
///// SCENE LIGHTS
const ambient = new THREE.AmbientLight(0xa0a0fc, 0.82)
scene.add(ambient)

const sunLight = new THREE.DirectionalLight(0xe8c37b, 1.96)
sunLight.position.set(-69,44,14)
scene.add(sunLight)

/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL FROM BLENDER
loader.load( 'models/gltf/scene.glb', function ( gltf ) {

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load( 'models/gltf/drone.glb', function ( gltf ) {
  drone = gltf.scene;
	scene.add( drone );
  
  drone.coordinateX = 4;
  drone.coordinateY = 4; 
  drone.facing = "south";

}, undefined, function ( error ) {

	console.error( error );

} );

//add missile to scene
loader.load( 'models/gltf/missile.glb', function ( gltf ) {
  missile = gltf.scene;
}, undefined, function ( error ) {

	console.error( error );

} );


/////////////////////////////////////////////////////////////////////////
//// INTRO CAMERA ANIMATION USING TWEEN
function introAnimation() {
    controls.enabled = false //disable orbit controls to animate the camera
    
    new TWEEN.Tween(camera.position.set(26,4,-35 )).to({ // from camera position
        x: 0, //desired x position to go
        y: 45, //desired y position to go
        z: 17 //desired z position to go
    }, 6500) // time take to animate
    .delay(1000).easing(TWEEN.Easing.Quartic.InOut).start() // define delay, easing
    .onComplete(function () { //on finish animation
        controls.enabled = true //enable orbit controls
        setOrbitControlsLimits() //enable controls limits
        TWEEN.remove(this) // remove the animation from memory
    })
}

introAnimation() // call intro animation on start

/////////////////////////////////////////////////////////////////////////
//// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits(){
    controls.enableDamping = true
    controls.dampingFactor = 0.04
    controls.minDistance = 35
    controls.maxDistance = 60
    controls.enableRotate = true
    controls.enableZoom = true
    controls.maxPolarAngle = Math.PI /2.5
}

/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION
function rendeLoop() {

    TWEEN.update() // update animations

    controls.update() // update orbit controls

    renderer.render(scene, camera) // render the scene using the camera

    requestAnimationFrame(rendeLoop) //loop the render function
    
}

rendeLoop() //start rendering

function animate() {
	requestAnimationFrame( animate );

	controls.update();

  if (drone){
    if (currentState == 'idle'){
      console.log("Idle State");
      console.log(states);
      if (states[0]){
        let nextState = states[0];
        if (nextState == 'placed'){
          currentState = 'placed';
          console.log("next state is placed " + states);
        }
        if (nextState == 'move'){
          currentState = 'move'
          oneUnit = 4.74;
        }
        if(nextState == 'west'){
          currentState = 'facing'
          futureFacing = 'west';
        }
        if(nextState == 'north'){
          currentState = 'facing'
          futureFacing = 'north';
        }
        if(nextState == 'south'){
          currentState = 'facing'
          futureFacing = 'south';
        }
        if(nextState == 'east'){
          currentState = 'facing'
          futureFacing = 'east';
        }
        if (nextState == 'report'){
          currentState = 'report';
        }
        if (nextState == 'attack'){
          currentState = 'attack';
        }
      }
      else{
        currentState = 'idle'
      }
    }
    if (currentState == 'start'){
      if (states[0] == 'start' && states[1] == 'placed'){
        var i = states.length;
        while(i-- ){
          (i + 1) % 1 === 0 && states.slice(i, 1);
         }
        
        currentState = 'placed';
      }
      if (states[0] == 'start' && states[1] != 'placed'){
        var i = states.length;
        while(i-- ){
          (i + 1) % 2 === 0 && states.splice(i, 1);
         }
        
      }
    }

    if (currentState == 'placed'){
      if (states[0] == 'start'){
        
        states.shift();
      }
      else{
        console.log("placed state")
          if (drone.coordinateX > states[1]){
            drone.position.x -= 0.052;
            drone.coordinateX -= 0.01;
            
          }
          if (drone.coordinateX < states[1]){
            drone.position.x += 0.052;
            drone.coordinateX += 0.01;
           
          }
          if (drone.coordinateY > states[2]){
            drone.position.z += 0.052;
            drone.coordinateY -= 0.01;
            
          }
          if (drone.coordinateY < states[2]){
            drone.position.z -= 0.052;
            drone.coordinateY += 0.01;
           
          }

        if(Math.round(drone.coordinateX) == states[1] && Math.round(drone.coordinateY) == states[2]){
          drone.coordinateX = Math.round(drone.coordinateX);
          drone.coordinateY = Math.round(drone.coordinateY);
          states.shift();
          states.shift();
          states.shift();
          
          futureFacing = states[0]
          currentState = 'facing';


        }
      }

    }

    if (currentState == "facing"){
      if (drone.facing == 'south' && futureFacing == 'north'){
        turnAngle = Math.PI;
        drone.facing = states[0];
        states.shift();
      }
      if (drone.facing == 'south' && futureFacing == 'west'){
        turnAngle = -Math.PI/2;
        drone.facing = states[0];
        states.shift();
      }
      if (drone.facing == 'south' && futureFacing == 'east'){
        turnAngle = Math.PI/2;
        drone.facing = states[0];
        states.shift();
      }

      if (drone.facing == 'west' && futureFacing == 'north'){
        turnAngle = -Math.PI/2;
        drone.facing = states[0];
        states.shift();
      }
      if (drone.facing == 'west' && futureFacing == 'south'){
        turnAngle = Math.PI/2;
        drone.facing = states[0];
        states.shift();
      }
      if (drone.facing == 'west' && futureFacing == 'east'){
        turnAngle = Math.PI;
        drone.facing = states[0];
        states.shift();
      }


      if (drone.facing == 'north' && futureFacing == 'south'){
        turnAngle = Math.PI;
        drone.facing = states[0];
        states.shift();
      }
      if (drone.facing == 'north' && futureFacing == 'west'){
        turnAngle = Math.PI/2;
        drone.facing = states[0];
        states.shift();
      }
      if (drone.facing == 'north' && futureFacing == 'east'){
        turnAngle = -Math.PI/2;
        drone.facing= states[0];
        states.shift();
      }

      if (drone.facing == 'east' && futureFacing == 'north'){
        turnAngle = Math.PI/2;
        drone.facing = states[0];
        states.shift();
      }
      if (drone.facing == 'east' && futureFacing == 'west'){
        turnAngle = -Math.PI;
        drone.facing = states[0];
        states.shift();
      }
      if (drone.facing == 'east' && futureFacing == 'south'){
        turnAngle = -Math.PI/2;
        drone.facing = states[0];
        states.shift();
      }
      if (drone.facing == futureFacing){
        states.shift();
      }


      if (turnAngle > Math.PI/200 || turnAngle < -Math.PI/200){
        if (turnAngle > Math.PI/200){
          drone.rotateY(Math.PI/200);
          turnAngle -= Math.PI/200;
        }
        if (turnAngle < -Math.PI/200){
          drone.rotateY(-Math.PI/200);
          turnAngle += Math.PI/200;
        }
      }

      else {
        
        if(!states[0]){
          currentState = 'idle';
        }
      }
    }

    if (currentState == 'move'){
      if (drone.coordinateY == 0 && drone.facing == 'south'){
        states.shift();
        currentState = 'idle';
        return;
      }
      if (drone.coordinateX == 0 && drone.facing == 'west'){

        states.shift();
        currentState = 'idle';
        return;
      }
      if (drone.coordinateX == 9 && drone.facing == 'east'){
        states.shift();
        currentState = 'idle';
        return;
      }
      if (drone.coordinateY == 9 && drone.facing == 'north'){
        states.shift();
        currentState = 'idle';
        return;
      }
      else{
        if (oneUnit > 0){
          drone.translateZ(0.05);
          oneUnit -= 0.05;
          console.log(oneUnit);
        }
        if (oneUnit < 0){
          states.shift()
          oneUnit = 5;
          console.log(oneUnit);
          if (drone.facing == 'north'){
            drone.coordinateY += 1;
          }
          if (drone.facing == 'south'){
            drone.coordinateY -= 1;
          }
          if (drone.facing == 'west'){
            drone.coordinateX -= 1;
          }
          if (drone.facing == 'east'){
            drone.coordinateX += 1;
          }
          
          else{
            currentState = 'idle';
          }
        }
      }
    }
    if (currentState == 'attack'){
      if (missileLaunched == false){
        let pos = new THREE.Vector3(5,5,5);
        scene.add(missile);
        const v1 = new THREE.Vector3(0,-1.85,-1).applyQuaternion(drone.quaternion);

        missile.quaternion.copy(drone.quaternion);
        missile.position.copy(drone.position).add(v1.multiplyScalar(-2));
        states.shift();
        missileLaunched = true;
      }
      
      if (drone.coordinateY <= 2 && drone.facing == 'south'){
        states.shift();
        scene.remove(missile);
        currentState = 'idle';
        return;
      }
      if (drone.coordinateX <= 2 && drone.facing == 'west'){
        states.shift();
        scene.remove(missile);
        currentState = 'idle';
        return;
      }
      if (drone.coordinateX >= 7 && drone.facing == 'east'){
        states.shift();
        scene.remove(missile);
        currentState = 'idle';
        return;
      }
      if (drone.coordinateY >= 7 && drone.facing == 'north'){
        states.shift();
        scene.remove(missile);
        currentState = 'idle';
        return;
      }

      if (twoUnit > 0){
        missile.translateZ(0.05);
        twoUnit -= 0.05;
        console.log(twoUnit);
      }
      if (twoUnit < 0){
        states.shift()
        twoUnit = 5;
        console.log(oneUnit);
        missileLaunched = false;
        currentState = 'idle';  
        scene.remove(missile);
      }
      
    }

    if (currentState == "report"){
      var xlable = document.getElementById('xlabel');
      var ylable = document.getElementById('ylabel');
      var flable = document.getElementById('flabel');

      xlable.innerHTML = "xCoord:" + drone.coordinateX+ "  ";
      ylable.innerHTML = "yCoord:" + drone.coordinateY+ "  ";
      flable.innerHTML = "Facing:" + drone.facing+ "  ";
      states.shift();
      currentState = 'idle';
    }


  }

	renderer.render( scene, camera );
}

function logStates(){
  console.log(states);
}

animate();

//Get Coordinates

function getXvalue(){
  let output = xValueElement.options[xValueElement.selectedIndex].value;
  states.push(output);
}

function getYvalue(){
  let output = yValueElement.options[yValueElement.selectedIndex].value;
  states.push(output);
}

function getFacing(){
  let output = facingElement.options[facingElement.selectedIndex].value;
  states.push(output);
}

/*Event Listeners*/
window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

place.addEventListener("click", placeClicked);
function placeClicked(){
  states.push('placed');
  getXvalue();
  getYvalue();
  getFacing();
  logStates();
  
}

move.addEventListener("click", moveClicked);
function moveClicked(){
  if (states[0] == 'move'){
    return;
  }
  states.push('move');
  logStates();
}

left.addEventListener("click", leftClicked);
function leftClicked(){
  if (drone.facing == 'north'){
    states.push('west');
  }
  if (drone.facing == 'west'){
    states.push('south');
  }
  if (drone.facing == 'south'){
    states.push('east');
  }
  if (drone.facing == 'east'){
    states.push('north');
  }
  logStates();
}

right.addEventListener("click", rightClicked);
function rightClicked(){
  if (drone.facing == 'north'){
    states.push('east');
  }
  if (drone.facing == 'west'){
    states.push('north');
  }
  if (drone.facing == 'south'){
    states.push('west');
  }
  if (drone.facing == 'east'){
    states.push('south');
  }
  logStates();
}

report.addEventListener("click", reportClicked);
function reportClicked(){
  states.push('report');
  logStates();
}

attack.addEventListener("click", attackClicked);

function attackClicked(){
  if (states[0] == 'attack'){
    states.shift;
    return;
  }
  states.push('attack');
  logStates();

}