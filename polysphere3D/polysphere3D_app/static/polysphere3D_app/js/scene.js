import { OrbitControls } from "./OrbitControls.js";
import {
    Scene, Vector4, ArrayCamera, MeshLambertMaterial, DirectionalLight, PerspectiveCamera, AmbientLight, PointLightHelper, WebGLRenderer, PointLight, BoxGeometry, DodecahedronGeometry, CylinderGeometry,
    SphereGeometry, MeshPhongMaterial, Mesh, PlaneGeometry, Color, PCFSoftShadowMap, Raycaster, Vector2, Vector3, RectAreaLight, AxesHelper
} from "./three.js";
import { shapeStore } from "../Logic/PolyPyramidLogic/Shapes3D.js";

const scene = new Scene();
const camera = new PerspectiveCamera();
//const sol_camera = new PerspectiveCamera(40, ASPECT_RATIO, 0.1, 10 );
scene.background = new Color("rgb(188,244,250)");
const globalLight = new AmbientLight(0xeeeeee);
scene.add(globalLight);

const light = new PointLight(0xBCF4FA, 15, 0);
light.castShadow = true;
const helper = new PointLightHelper(light, 2);
scene.add(light);
scene.add(helper);
light.intensity = 0.5;
light.position.set(0, 0, 1).normalize();

const renderer = new WebGLRenderer({ antialias: true });
const sol_renderer = new WebGLRenderer({ antialias: true });

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.setClearColor(0x999999);

let resizeObeserver;
let firstPlacementCoord = null;
let currentShapePlacements = [];

export let inputShapes = {
    get() {
        return this.store;
    },
    add(shape_name) {
        this.store.push(shape_name);
    },
    clear() {
        this.store = [];
    },
    store: []
};

export let inputCoords = {
    get() {
        return this.store;
    },
    add(coord) {
        this.store.push(coord);
    },
    clear() {
        this.store = [];
    },
    store: []
};

const Colours = {
    A: 0x228B1E,
    B: 0x6D359A,
    C: 0x1E9195,
    D: 0x931515,
    E: 0xA2A42C,
    F: 0x9F1B92,
    G: 0x904512,
    H: 0x0E2B0C,
    I: 0x272899,
    J: 0x966E9A,
    K: 0x205F90,
    L: 0x9DA15E,
};

export function initScene(canvas) {
    camera.fov = 75;
    camera.near = 0.2;
    camera.far = 300;
    camera.position.z = 18;
    camera.position.x = -0;
    camera.position.y = 0;

    renderer.setSize(canvas.clientWidth, canvas.clientWidth);
    resizeObeserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientWidth);
        })
    });
    resizeObeserver.observe(canvas);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxDistance = 300;

    controls.target = new Vector3(5, 3.8, 5);
    controls.maxPolarAngle = Math.PI / 2;

    function arrayCoordsFromWorldCoords(x, y, height) {
        let layer = Math.round((height - 1) / Math.sqrt(2));
        let x_index;
        let y_index;
        if (layer % 2 === 1) {
            x_index = (x - 1 - 1 * layer) / 2;
            y_index = (y - 1 - 1 * layer) / 2;
        } else {
            x_index = (x - 1 - 1 * layer) / 2;
            y_index = (y - 1 - 1 * layer) / 2;
        }
        return [x_index, y_index, layer];
    }

    function setInput(shape, coord) {
        if (!(inputShapes.get().includes(shape))) {
            inputShapes.add(shape);
            inputCoords.add(new Array(coord));
        } else {
            inputCoords.get()[inputShapes.get().indexOf(shape)].push(coord);
        }
    }

    const raycaster = new Raycaster();
    const pointer = new Vector2();

    function onClick(event) {
        const canvasBounds = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - canvasBounds.left) / canvas.clientWidth) * 2 - 1;
        pointer.y = -((event.clientY - canvasBounds.top) / canvas.clientHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        let currentShapeElement = document.getElementById("currentImage");
        let shape = currentShapeElement.className;
        let currentShape = shapeStore[shape]

        const intersects = raycaster.intersectObjects(scene.children);

        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.visible === true && intersects[i].object.name[0] === "s" &&
                intersects[i].object.material.color.equals(new Color(0x999999))) {

                let coord = arrayCoordsFromWorldCoords(intersects[i].object.position.x, intersects[i].object.position.z, intersects[i].object.position.y);
                let shapeIndex = inputShapes.get().indexOf(shape);
                let lastCoord = shapeIndex >= 0 && inputCoords.get()[shapeIndex].length > 0 ? inputCoords.get()[shapeIndex][inputCoords.get()[shapeIndex].length - 1] : null;

                if (!lastCoord ||
                    (lastCoord[2] === coord[2] && (Math.abs(lastCoord[0] - coord[0]) + Math.abs(lastCoord[1] - coord[1]) === 1)) ||
                    (Math.abs(lastCoord[2] - coord[2]) === 1 && lastCoord[0] === coord[0] && lastCoord[1] === coord[1])) {
                    if (isPlacementValid(coord, currentShape, lastCoord)) {
                        intersects[i].object.material.color.set(Colours[shape]);
                        setInput(shape, coord);
                        console.log("Placed sphere for shape:", shape, "at coordinates:", coord);
                        firstPlacementCoord = coord;
                        break;
                    } else {
                        alert("Invalid placement: Sphere is not correctly adjacent.");
                    }
                }
            }
        }
    }

    function isPlacementValid(coord, shape, lastCoord) {
        return (
            !lastCoord ||
            (lastCoord[2] === coord[2] && (Math.abs(lastCoord[0] - coord[0]) + Math.abs(lastCoord[1] - coord[1]) === 1)) ||
            (Math.abs(lastCoord[2] - coord[2]) === 1 && lastCoord[0] === coord[0] && lastCoord[1] === coord[1]) ||
            (Math.abs(lastCoord[0] - coord[0]) === 1 && Math.abs(lastCoord[1] - coord[1]) === 1 && lastCoord[2] === coord[2])
        );
    }

    window.addEventListener('click', onClick);

    function animate() {
        renderer.render(scene, camera);
        controls.update();
        requestAnimationFrame(animate);
    }

    canvas.appendChild(renderer.domElement);

    const meshfloor = new Mesh(
        new PlaneGeometry(130, 130, 10, 10),
        new MeshPhongMaterial({
            color: 0xBCF4FA,
            wireframe: false
        })
    )
    meshfloor.rotation.x -= Math.PI / 2;
    meshfloor.receiveShadow = true;

    light.position.set(4, 20, 4);

    animate();
}

let sol_scene;
let mesh;
const AMOUNT = 6;
//Solution INIT
export function solinit(sol_canvas) {
    const ASPECT_RATIO = sol_canvas.clientWidth/sol_canvas.clientHeight;
    const WIDTH = (sol_canvas.clientWidth/AMOUNT) * window.devicePixelRatio;
    const HEIGHT = (sol_canvas.clientHeight/AMOUNT) * window.devicePixelRatio;
    console.log("Width is",window.devicePixelRatio);

    const cameras = [];

    for (let y = 0; y < AMOUNT; y++) {
        for (let x = 0; x < AMOUNT; x++) {
            const subcamera = new PerspectiveCamera(40, ASPECT_RATIO, 0.1, 10 );
            subcamera.viewport = new Vector4(Math.floor(x * WIDTH), Math.floor(y * HEIGHT), Math.ceil(WIDTH), Math.ceil(HEIGHT));
            subcamera.fov = 75;
            subcamera.near = 0.2;
            subcamera.far = 300;
            subcamera.position.x = (x / AMOUNT) - 0.5;
            subcamera.position.y = 0.5 - (y / AMOUNT);
            subcamera.position.z = 1.5;
            subcamera.position.multiplyScalar(2);
            subcamera.lookAt(0, 0, 0);
            subcamera.updateMatrixWorld();
            cameras.push(subcamera);
        }
    }

    let sol_camera = new ArrayCamera(cameras);
    sol_camera.position.z = 3;

    const sol_controls = new OrbitControls(camera, renderer.domElement);
    sol_controls.enablePan = false;
    sol_controls.enableDamping = true;
    sol_controls.dampingFactor = 0.05;
    sol_controls.screenSpacePanning = false;
    sol_controls.maxDistance = 300;

    sol_controls.target = new Vector3(5, 3.8, 5);
    sol_controls.maxPolarAngle = Math.PI / 2;
    sol_scene = new Scene();

    sol_scene.add(new AmbientLight(0x999999));

    const light = new DirectionalLight(0xffffff, 3);
    light.position.set(0.5, 0.5, 1);
    light.castShadow = true;
    light.shadow.camera.zoom = 4;
    sol_scene.add(light);

    const geometryBackground = new PlaneGeometry(10, 10, 10, 10);
    const materialBackground = new MeshPhongMaterial({ color: 0x000066 });

    const background = new Mesh(geometryBackground, materialBackground);
    background.receiveShadow = true;
    background.position.set(0, 0, -1);
    sol_scene.add(background);

    const geometryCylinder = new CylinderGeometry(0.5, 0.5, 1, 32);
    const materialCylinder = new MeshPhongMaterial({ color: 0xff0000 });

    mesh = new Mesh(geometryCylinder, materialCylinder);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    sol_scene.add(mesh);

    sol_renderer.setPixelRatio(window.devicePixelRatio);
    sol_renderer.setSize(WIDTH, HEIGHT);
    sol_renderer.shadowMap.enabled = true;
    document.body.appendChild(sol_renderer.domElement);

    function onWindowResize() {
        const ASPECT_RATIO = sol_canvas.clientWidth/sol_canvas.clientHeight;
        const WIDTH = sol_canvas.clientWidth;
        const HEIGHT = sol_canvas.clientHeight;

        camera.aspect = ASPECT_RATIO;
        camera.updateProjectionMatrix();

        for (let y = 0; y < AMOUNT; y++) {
            for (let x = 0; x < AMOUNT; x++) {
                const subcamera = camera.cameras[AMOUNT * y + x];
                subcamera.viewport.set(
                    Math.floor(x * WIDTH),
                    Math.floor(y * HEIGHT),
                    Math.ceil(WIDTH),
                    Math.ceil(HEIGHT)
                );
                subcamera.aspect = ASPECT_RATIO;
                subcamera.updateProjectionMatrix();
            }
        }

        sol_renderer.setSize(WIDTH, HEIGHT);
    }

    function solanimate() {
        mesh.rotation.x += 0.005;
        mesh.rotation.z += 0.01;

        sol_renderer.render(sol_scene, sol_camera);
        sol_controls.update();
        requestAnimationFrame(solanimate);
    }

    sol_canvas.appendChild(sol_renderer.domElement);
    window.addEventListener('resize', onWindowResize);
    solanimate();
}

function createSphere(x, y, z, color, radius, segs) {
    let mat = new MeshPhongMaterial({
        color: color,
        specular: color,
        shininess: 30
    });
    mat.castShadow = true;
    mat.receiveShadow = true;
    let sphere = new Mesh(new SphereGeometry(radius, segs, segs), mat);
    sphere.position.set(x, z, y);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.name = ["s", x, y, z].join(",");
    return sphere;
}

function disposeSphere(instance) {
    scene.remove(instance);
    instance.material.dispose();
    instance.dispose();
}

export default class {
    createSphere(x, y, z, color, radius = 1, segs = 15) {
        return createSphere(x, y, z, color, radius, segs);
    }
    disposeSphere(sphere) {
        disposeSphere(sphere);
    }

    add(obj) {
        scene.add(obj);
    }

    init(dom) {
        initScene(dom);
    }
    init2(dom) {
        solinit(dom);
    }

    dispose() {
        resizeObeserver.disconnect();
        cancelAnimationFrame();
    }
};

function resetFirstPlacementCoord() {
    firstPlacementCoord = null;
}

export { Colours };
