"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const FLOWERS = [
  0xff284f, 0xff7a19, 0xffdd21, 0xf7f4df,
  0x3478ff, 0x22d9f2, 0xff5bbd, 0x9d56f7,
];

function seeded(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function addBox(
  parent: THREE.Object3D,
  size: [number, number, number],
  position: [number, number, number],
  color: number,
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color, roughness: 0.74 }),
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function createTree(x: number, z: number, variant: number) {
  const tree = new THREE.Group();
  tree.position.set(x, 0.5, z);
  const height = [3.8, 4.8, 5.8][variant];
  addBox(tree, [0.75, height, 0.75], [0, height / 2, 0], 0x6d3213);
  addBox(tree, [1.5, 1.25, 1.5], [0, height + 0.35, 0], 0x167a28);
  if (variant === 0) {
    addBox(tree, [2.1, 1.8, 1.8], [-0.65, height + 0.55, 0], 0x1f9a35);
    addBox(tree, [2.1, 1.8, 1.8], [0.65, height + 0.72, 0.1], 0x116524);
  } else if (variant === 1) {
    addBox(tree, [3, 1.2, 2.6], [0, height + 0.25, 0], 0x116524);
    addBox(tree, [2.45, 1.2, 2.15], [0, height + 1.1, 0], 0x1f8b2d);
    addBox(tree, [1.9, 1.15, 1.7], [0, height + 1.95, 0], 0x42ae35);
  } else {
    addBox(tree, [2.5, 1.45, 2], [-0.8, height + 0.55, 0], 0x116524);
    addBox(tree, [2.4, 1.45, 2], [0.8, height + 0.7, 0.1], 0x17802b);
    addBox(tree, [2.9, 1.45, 2.35], [0, height + 1.55, -0.2], 0x229438);
  }
  return tree;
}

function createFlower(x: number, z: number, color: number, variant: number) {
  const flower = new THREE.Group();
  flower.position.set(x, 0.5, z);
  const h = 1.15 + (variant % 3) * 0.18;
  addBox(flower, [0.09, h, 0.09], [0, h / 2, 0], 0x1f8e2e);
  addBox(flower, [0.28, 0.1, 0.15], [-0.12, h * 0.55, 0], 0x35ad35);
  const petals: [number, number][] = [[0, 0], [-0.2, 0], [0.2, 0], [0, 0.2], [0, -0.2]];
  petals.forEach(([dx, dy]) =>
    addBox(flower, [0.22, 0.22, 0.22], [dx, h + dy, 0], color),
  );
  addBox(flower, [0.13, 0.13, 0.24], [0, h, -0.05], 0xffb21a);
  return flower;
}

function createStone(x: number, z: number, variant: number) {
  const rock = new THREE.Group();
  rock.position.set(x, 0.5, z);
  addBox(rock, [0.9, 0.55, 0.75], [0, 0.27, 0], 0x596363);
  if (variant > 0) addBox(rock, [0.55, 0.42, 0.5], [0.45, 0.21, 0.15], 0x7a8380);
  if (variant > 1) addBox(rock, [0.45, 0.35, 0.45], [-0.4, 0.18, -0.18], 0x485f42);
  return rock;
}

function buildGardenlands(scene: THREE.Scene) {
  const floorGeometry = new THREE.BoxGeometry(1, 1, 1);
  const floorMaterial = [
    new THREE.MeshStandardMaterial({ color: 0x6bb852, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x6bb852, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x69b94f, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x4c9d3a, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x6d3f20, roughness: 1 }),
    new THREE.MeshStandardMaterial({ color: 0x6d3f20, roughness: 1 }),
  ];
  const floor = new THREE.InstancedMesh(floorGeometry, floorMaterial, 48 * 48);
  const matrix = new THREE.Matrix4();
  let index = 0;
  for (let x = 0; x < 48; x++) {
    for (let z = 0; z < 48; z++) {
      matrix.makeTranslation(x - 23.5, 0, z - 23.5);
      floor.setMatrixAt(index++, matrix);
    }
  }
  floor.receiveShadow = true;
  scene.add(floor);

  const treePositions = [
    [-18.5, -16.7], [-14.4, -18.5], [-18.5, -8.9], [-17, 12.6],
    [-13.5, 18], [-7, 19], [8.5, 18.5], [14.8, 17], [18.7, 11],
    [18, 2.2], [18.5, -13.8], [13.7, -18.5], [6.3, -19], [-18.5, 3.3],
  ];
  treePositions.forEach(([x, z], i) => scene.add(createTree(x, z, i % 3)));

  const random = seeded(333);
  for (let i = 0; i < 48; i++) {
    let x = 0;
    let z = 0;
    do {
      x = (random() - 0.5) * 41;
      z = (random() - 0.5) * 41;
    } while (x * x + z * z < 45);
    scene.add(createFlower(x, z, FLOWERS[i % FLOWERS.length], i));
  }
  const rocks = [
    [-13, -10], [-11.3, -9.2], [-9.4, -8.9], [-7.6, -7.8],
    [10.4, 8.9], [11.8, 7.6], [13.3, 5.9], [14.4, 4.1],
    [-4.1, 15.2], [-2, 15.9], [0.2, 15.5], [6.5, -13],
  ];
  rocks.forEach(([x, z], i) => scene.add(createStone(x, z, i % 3)));

  for (let i = 0; i < 90; i++) {
    let x = (random() - 0.5) * 42;
    let z = (random() - 0.5) * 42;
    if (x * x + z * z < 35) {
      x += Math.sign(x || 1) * 7;
      z += Math.sign(z || 1) * 7;
    }
    const tuft = new THREE.Group();
    tuft.position.set(x, 0.5, z);
    for (let b = 0; b < 4; b++) {
      const h = 0.2 + random() * 0.35;
      addBox(tuft, [0.05, h, 0.05], [(random() - 0.5) * 0.28, h / 2, (random() - 0.5) * 0.28], b % 2 ? 0x3b9f34 : 0x246e28);
    }
    scene.add(tuft);
  }
}

function fallbackAnciuxor() {
  const dragon = new THREE.Group();
  addBox(dragon, [3.2, 3.4, 4.5], [0, 2.2, 0], 0xe8e4cf);
  addBox(dragon, [2.2, 2, 2], [0, 5.2, -1.3], 0xf5f1db);
  addBox(dragon, [13, 0.5, 3], [-6.5, 5.4, 0], 0xf5f1db);
  addBox(dragon, [13, 0.5, 3], [6.5, 5.4, 0], 0xf5f1db);
  addBox(dragon, [1, 0.5, 0.5], [0, 5.3, -2.35], 0xff9e35);
  return dragon;
}

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeMenuRef = useRef<"map" | "main" | "settings" | null>(null);
  const selectedCharacterRef = useRef<"Anciuxor" | "Elzoran">("Anciuxor");
  const characterModelsRef = useRef<Partial<Record<"Anciuxor" | "Elzoran", THREE.Object3D>>>({});
  const [started, setStarted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [controller, setController] = useState("Keyboard");
  const [activeMenu, setActiveMenu] = useState<"map" | "main" | "settings" | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<"Anciuxor" | "Elzoran">("Anciuxor");

  const toggleMenu = (menu: "map" | "main" | "settings" | null) => {
    const next = activeMenuRef.current === menu ? null : menu;
    activeMenuRef.current = next;
    setActiveMenu(next);
  };

  const requestGameFullscreen = async (force = false) => {
    const isConsole = /PlayStation|Xbox|Nintendo/i.test(navigator.userAgent);
    const isLandscapeMobile = window.matchMedia("(pointer: coarse) and (orientation: landscape)").matches;
    if ((force || isConsole || isLandscapeMobile) && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
  };

  const enterGardenlands = async () => {
    await requestGameFullscreen();
    setStarted(true);
  };

  const switchCharacter = (character: "Anciuxor" | "Elzoran") => {
    selectedCharacterRef.current = character;
    setSelectedCharacter(character);
    Object.entries(characterModelsRef.current).forEach(([name, model]) => {
      if (model) model.visible = name === character;
    });
  };

  useEffect(() => {
    if (!started || !mountRef.current) return;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x68bde0);
    scene.fog = new THREE.Fog(0x68bde0, 55, 105);
    const camera = new THREE.PerspectiveCamera(58, mount.clientWidth / mount.clientHeight, 0.1, 180);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xbbe8ff, 0x29451f, 1.35));
    const sunTarget = new THREE.Object3D();
    scene.add(sunTarget);
    const sun = new THREE.DirectionalLight(0xffdda0, 4.6);
    sun.position.set(-18, 28, -12);
    sun.target = sunTarget;
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -24;
    sun.shadow.camera.right = 24;
    sun.shadow.camera.top = 24;
    sun.shadow.camera.bottom = -24;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 85;
    sun.shadow.bias = -0.00025;
    sun.shadow.normalBias = 0.035;
    sun.shadow.radius = 3;
    const skyRim = new THREE.DirectionalLight(0x8acbff, 1.15);
    skyRim.target = sunTarget;
    scene.add(sun, skyRim);
    buildGardenlands(scene);

    const player = new THREE.Group();
    player.position.set(0, 0.5, 0);
    scene.add(player);
    const mixers: THREE.AnimationMixer[] = [];
    const walkActions = new Map<"Anciuxor" | "Elzoran", THREE.AnimationAction>();
    const loader = new GLTFLoader();
    const loadCharacter = (name: "Anciuxor" | "Elzoran", url: string) => loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(model);
        model.position.y -= bounds.min.y;
        model.visible = selectedCharacterRef.current === name;
        player.add(model);
        characterModelsRef.current[name] = model;
        const mixer = new THREE.AnimationMixer(model);
        mixers.push(mixer);
        const clip =
          gltf.animations.find((animation) =>
            animation.name.includes(name) && animation.name.includes("Walk_RP9"),
          ) ?? gltf.animations.at(-1);
        if (clip) {
          const walkAction = mixer.clipAction(clip);
          walkAction.play();
          walkAction.paused = true;
          walkActions.set(name, walkAction);
        }
        if (name === "Anciuxor") setLoaded(true);
      },
      undefined,
      () => {
        if (name === "Anciuxor") {
          const fallback = fallbackAnciuxor();
          player.add(fallback);
          characterModelsRef.current.Anciuxor = fallback;
          setLoaded(true);
        }
      },
    );
    loadCharacter("Anciuxor", "/assets/anciuxor-rp9.glb");
    loadCharacter("Elzoran", "/assets/elzoran-rp9.glb");

    const keys = new Set<string>();
    const down = (event: KeyboardEvent) => {
      if (event.code === "Digit1" || event.code === "Numpad1") return toggleMenu("map");
      if (event.code === "Digit2" || event.code === "Numpad2") return toggleMenu("main");
      if (event.code === "Digit3" || event.code === "Numpad3") return toggleMenu("settings");
      if (event.code === "Escape") return toggleMenu(null);
      keys.add(event.code);
    };
    const up = (event: KeyboardEvent) => keys.delete(event.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    const connected = () => setController("DualSense / Gamepad");
    const disconnected = () => setController("Keyboard");
    window.addEventListener("gamepadconnected", connected);
    window.addEventListener("gamepaddisconnected", disconnected);

    let cameraYaw = Math.PI;
    let cameraPitch = 0.36;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const pointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      cameraYaw -= (event.clientX - lastX) * 0.006;
      cameraPitch = THREE.MathUtils.clamp(cameraPitch + (event.clientY - lastY) * 0.004, 0.12, 0.85);
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const pointerUp = () => (dragging = false);
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);

    const clock = new THREE.Clock();
    const move = new THREE.Vector2();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const desiredSun = new THREE.Vector3();
    const desiredSunTarget = new THREE.Vector3();
    const menuButtonLatch = [false, false, false];
    let animationFrame = 0;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      move.set(
        (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) - (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0),
        (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) - (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0),
      );
      let sprint = keys.has("ShiftLeft") || keys.has("ShiftRight");
      const pads = navigator.getGamepads?.() ?? [];
      const pad = Array.from(pads).find(Boolean);
      if (pad) {
        setController("DualSense / Gamepad");
        const dead = 0.14;
        const lx = Math.abs(pad.axes[0] ?? 0) > dead ? pad.axes[0] : 0;
        const ly = Math.abs(pad.axes[1] ?? 0) > dead ? -(pad.axes[1] ?? 0) : 0;
        if (Math.abs(lx) + Math.abs(ly) > move.length()) move.set(lx, ly);
        cameraYaw -= (Math.abs(pad.axes[2] ?? 0) > dead ? pad.axes[2] : 0) * delta * 2.2;
        cameraPitch = THREE.MathUtils.clamp(cameraPitch + (Math.abs(pad.axes[3] ?? 0) > dead ? pad.axes[3] : 0) * delta * 1.5, 0.12, 0.85);
        sprint ||= Boolean(pad.buttons[10]?.pressed || pad.buttons[7]?.pressed);
        const menuButtons = [
          Boolean(pad.buttons[8]?.pressed),
          Boolean(pad.buttons[17]?.pressed),
          Boolean(pad.buttons[9]?.pressed),
        ];
        const menuNames = ["map", "main", "settings"] as const;
        menuButtons.forEach((pressed, index) => {
          if (pressed && !menuButtonLatch[index]) toggleMenu(menuNames[index]);
          menuButtonLatch[index] = pressed;
        });
      }
      const moving = activeMenuRef.current === null && move.lengthSq() > 0.02;
      if (moving) {
        move.normalize();
        forward.set(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
        right.set(-forward.z, 0, forward.x);
        const direction = forward.multiplyScalar(move.y).add(right.multiplyScalar(move.x)).normalize();
        const speed = sprint ? 9.5 : 5.6;
        player.position.addScaledVector(direction, speed * delta);
        player.position.x = THREE.MathUtils.clamp(player.position.x, -22.25, 22.25);
        player.position.z = THREE.MathUtils.clamp(player.position.z, -22.25, 22.25);
        player.rotation.y = Math.atan2(direction.x, direction.z);
      }
      walkActions.forEach((action, name) => {
        action.paused = !moving || name !== selectedCharacterRef.current;
        action.timeScale = sprint ? 1.45 : 1;
      });
      mixers.forEach((mixer) => mixer.update(delta));

      const isElzoran = selectedCharacterRef.current === "Elzoran";
      const distance = isElzoran ? 16 : 27;
      const horizontal = Math.cos(cameraPitch) * distance;
      const desired = new THREE.Vector3(
        player.position.x + Math.sin(cameraYaw) * horizontal,
        player.position.y + 6 + Math.sin(cameraPitch) * distance,
        player.position.z + Math.cos(cameraYaw) * horizontal,
      );
      camera.position.lerp(desired, 1 - Math.pow(0.002, delta));
      camera.lookAt(player.position.x, player.position.y + (isElzoran ? 3.4 : 4.5), player.position.z);

      // Keep the playable area inside the best part of the shadow map while
      // letting the camera angle subtly reshape the key and rim lighting.
      const sunAngle = cameraYaw - 0.85;
      desiredSun.set(
        player.position.x + Math.sin(sunAngle) * 24,
        player.position.y + 32,
        player.position.z + Math.cos(sunAngle) * 24,
      );
      sun.position.lerp(desiredSun, 1 - Math.pow(0.035, delta));
      desiredSunTarget.set(player.position.x, player.position.y + 2.8, player.position.z);
      sunTarget.position.lerp(desiredSunTarget, 1 - Math.pow(0.012, delta));
      skyRim.position.set(
        player.position.x - Math.sin(sunAngle) * 18,
        player.position.y + 14,
        player.position.z - Math.cos(sunAngle) * 18,
      );
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("gamepadconnected", connected);
      window.removeEventListener("gamepaddisconnected", disconnected);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [started]);

  return (
    <main className="game-shell">
      {!started && (
        <section className="launch-screen" aria-label="AOV RP9 Gardenlands Playtest">
          <button onClick={enterGardenlands}>Play</button>
          <div className="launch-controls">
            <span>Keyboard: WASD + mouse</span>
            <span>DualSense: sticks + R2 sprint</span>
          </div>
        </section>
      )}
      <div ref={mountRef} className="game-viewport" aria-label="RP9 Gardenlands 3D playtest" />
      {started && (
        <>
          <header className="hud hud-top">
            <div>
              <strong>RP9</strong>
              <span>{selectedCharacter} · Gardenlands · Origon</span>
            </div>
            <div className="status">
              <i className={loaded ? "ready" : ""} />
              {loaded ? controller : "Summoning Anciuxor…"}
            </div>
          </header>
          <nav className="menu-strip" aria-label="Game menus">
            <button onClick={() => toggleMenu("map")} className={activeMenu === "map" ? "active" : ""}>
              <kbd>1</kbd><span>Map</span><small>Create</small>
            </button>
            <button onClick={() => toggleMenu("main")} className={activeMenu === "main" ? "active" : ""}>
              <kbd>2</kbd><span>Menu</span><small>Touchpad</small>
            </button>
            <button onClick={() => toggleMenu("settings")} className={activeMenu === "settings" ? "active" : ""}>
              <kbd>3</kbd><span>Settings</span><small>Options</small>
            </button>
          </nav>
          {activeMenu && (
            <section className="menu-backdrop" onClick={() => toggleMenu(null)}>
              <article className="menu-panel" onClick={(event) => event.stopPropagation()}>
                <header>
                  <div>
                    <small>AOV™ RP9</small>
                    <h2>{activeMenu === "map" ? "Gardenlands Map" : activeMenu === "main" ? "Main Menu" : "Settings"}</h2>
                  </div>
                  <button className="close-menu" onClick={() => toggleMenu(null)} aria-label="Close menu">×</button>
                </header>
                {activeMenu === "map" && (
                  <div className="map-shell">
                    <div className="map-grid"><i className="map-player">◆</i><span>Gardenlands · Origon</span></div>
                    <p>World markers, discoveries, missions, and Homeland routes will be built into this map.</p>
                  </div>
                )}
                {activeMenu === "main" && (
                  <div className="menu-actions">
                    <div className="character-switcher">
                      <small>Switch Character</small>
                      <div>
                        <button className={selectedCharacter === "Anciuxor" ? "selected" : ""} onClick={() => switchCharacter("Anciuxor")}>
                          <span>Anciuxor</span><strong>Ultimate Dracolord</strong>
                        </button>
                        <button className={selectedCharacter === "Elzoran" ? "selected" : ""} onClick={() => switchCharacter("Elzoran")}>
                          <span>Elzoran</span><strong>Supreme Dragon Lord</strong>
                        </button>
                      </div>
                    </div>
                    <button onClick={() => toggleMenu(null)}>Resume Gardenlands</button>
                    <button onClick={() => requestGameFullscreen(true)}>Enter Fullscreen</button>
                    <p>Character, mission journal, inventory, and affinity panels will connect here.</p>
                  </div>
                )}
                {activeMenu === "settings" && (
                  <div className="settings-shell">
                    <button onClick={() => requestGameFullscreen(true)}><span>Display</span><strong>Fullscreen</strong></button>
                    <button disabled><span>Controller</span><strong>Connected</strong></button>
                    <button disabled><span>Audio</span><strong>Coming next</strong></button>
                    <p>This overlay is ready for the complete RP9 settings system.</p>
                  </div>
                )}
                <footer>Press the same menu button again to close</footer>
              </article>
            </section>
          )}
          <aside className="hud controls-card">
            <span><b>Move</b> WASD / Left Stick</span>
            <span><b>Camera</b> Drag / Right Stick</span>
            <span><b>Sprint</b> Shift / R2</span>
          </aside>
          <div className="reticle" aria-hidden="true" />
        </>
      )}
    </main>
  );
}
