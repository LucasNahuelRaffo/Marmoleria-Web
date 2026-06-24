import * as THREE from 'three';
import { RGBELoader }   from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader }   from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer }   from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }       from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass }         from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass }  from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }       from 'three/addons/postprocessing/OutputPass.js';

const _texCache = new Map();
const ASSET = 'assets/3d/';

  /* ── Materiales de herraje (acabados) ─────────────────────────────────── */
  const FINISH = {
    cromo:  { color: 0xc9c7c4, roughness: 0.12, metalness: 0.95 },
    niquel: { color: 0xb7b2aa, roughness: 0.34, metalness: 0.82 },
    dorado: { color: 0xcfa23a, roughness: 0.16, metalness: 0.95 },
    bronce: { color: 0x8a6536, roughness: 0.30, metalness: 0.85 },
    negro:  { color: 0x232323, roughness: 0.36, metalness: 0.70 },
    blanco: { color: 0xeeeae4, roughness: 0.55, metalness: 0.10 },
  };

  /* ── Mapa herraje → { tipo de geometría, acabado } ─────────────────────── */
  const HERRAJE_MAP = {
    'h-083-biselada':   { tipo: 'lever-recto', finish: 'blanco' },
    'h-083-sn':         { tipo: 'barra',       finish: 'cromo'  },
    'h-098':            { tipo: 'ministerio',  finish: 'cromo'  },
    'h-099':            { tipo: 'lever-recto', finish: 'cromo'  },
    'h-101':            { tipo: 'barra',       finish: 'cromo'  },
    'h-104':            { tipo: 'lever-curvo', finish: 'cromo'  },
    'h-106':            { tipo: 'ministerio',  finish: 'cromo'  },
    'h-107':            { tipo: 'lever-recto', finish: 'cromo'  },
    'h-116':            { tipo: 'ministerio',  finish: 'niquel' },
    'h-142-alerce':     { tipo: 'lever-curvo', finish: 'niquel' },
    'h-142-alerce-set': { tipo: 'lever-curvo', finish: 'niquel' },
    'h-143':            { tipo: 'lever-curvo', finish: 'niquel' },
    'h-175':            { tipo: 'lever-curvo', finish: 'cromo'  },
    'h-176':            { tipo: 'lever-curvo', finish: 'cromo'  },
    'h-180':            { tipo: 'lever-curvo', finish: 'dorado' },
    'h-351':            { tipo: 'lever-curvo', finish: 'dorado' },
    'h-503':            { tipo: 'lever-recto', finish: 'cromo'  },
    'h-506':            { tipo: 'barra',       finish: 'cromo'  },
    'h-910':            { tipo: 'manijon',     finish: 'cromo',  largo: 1.0 },
    'h-911':            { tipo: 'manijon',     finish: 'cromo',  largo: 1.4 },
    'h-912':            { tipo: 'manijon',     finish: 'negro',  largo: 1.7 },
    'h-2085':           { tipo: 'pomo',        finish: 'cromo'  },
  };

  /* ── Presets de mueble (cocinas) ───────────────────────────────────────── */
  const FURNITURE = {
    'cocina-l':        { cab: 0xf1ede7, rough: 0.5, frente: 'puerta', anafe: true,  horno: false, defaultStone: 0xb8bcc0 },
    'cocina-integral': { cab: 0x2e3230, rough: 0.42, frente: 'gola',  anafe: false, horno: true,  defaultStone: 0x1c1c1e },
    'cocina-cajones':  { cab: 0xf3f0ea, rough: 0.5, frente: 'cajon',  anafe: false, horno: false, defaultStone: 0xe8e3da },
  };

  class KitchenScene {
    constructor(container) {
      this.container = container;
      this._animId   = null;
      this._reqStone = null;
      this._curFurniture = 'cocina-l';
      this._curHerraje   = 'h-101';

      const w = container.clientWidth  || 600;
      const h = container.clientHeight || 400;

      /* Renderer */
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
      this.renderer.outputColorSpace  = THREE.SRGBColorSpace;
      this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 0.58;
      Object.assign(this.renderer.domElement.style, { width: '100%', height: '100%', display: 'block' });
      container.appendChild(this.renderer.domElement);

      /* Scene */
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xe9e3da);
      this.scene.fog = new THREE.Fog(0xe9e3da, 12, 24);

      /* Camera */
      this.target = new THREE.Vector3(-0.3, 0.85, -1.25);
      this.camera = new THREE.PerspectiveCamera(48, w / h, 0.05, 40);
      this.camera.position.set(2.45, 1.78, 3.05);
      this.camera.lookAt(this.target);

      /* OrbitControls — cámara animada (auto-órbita + arrastre) */
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.target.copy(this.target);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.enablePan     = false;
      this.controls.autoRotate    = true;
      this.controls.autoRotateSpeed = 0.55;
      this.controls.minDistance   = 2.6;
      this.controls.maxDistance   = 5.5;
      this.controls.minPolarAngle = Math.PI * 0.18;
      this.controls.maxPolarAngle = Math.PI * 0.49;
      this.controls.update();
      this._idleTimer = null;
      this.controls.addEventListener('start', () => {
        this.controls.autoRotate = false;
        if (this._idleTimer) clearTimeout(this._idleTimer);
      });
      this.controls.addEventListener('end', () => {
        if (this._idleTimer) clearTimeout(this._idleTimer);
        this._idleTimer = setTimeout(() => { this.controls.autoRotate = true; }, 4000);
      });

      this.frentes = [];                       // posiciones de frentes para herrajes
      this.cabGroup    = new THREE.Group();    // gabinetes (reconstruible)
      this.applGroup   = new THREE.Group();    // anafe/horno (reconstruible)
      this.handleGroup = new THREE.Group();    // manijas (reconstruible)
      this.propsGroup  = new THREE.Group();    // props decorativos (planta, jarrón)
      this.scene.add(this.cabGroup, this.applGroup, this.handleGroup, this.propsGroup);

      this._buildLights();
      this._buildEnvironment();                // HDRI → reflejos realistas
      this._buildShell();
      this._buildCountertops();
      this._buildFixtures();
      this._buildLuminaires();
      this._loadProps();                       // planta + jarrón GLB (async, tolerante)
      this._buildDecor();                      // banquetas, frutero, vajilla, cuadros (geometría)
      this._buildComposer(w, h);               // post-procesado: oclusión ambiental + bloom

      this.setFurniture('cocina-l');
      this.setHerraje('h-101');
      this.setIluminacion('lum-interior');

      this._animate();

      this._ro = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(width, height);
          if (this.composer) this.composer.setSize(width, height);
        }
      });
      this._ro.observe(container);
    }

    /* ── Helpers ─────────────────────────────────────────── */
    _std(color, roughness = 0.8, metalness = 0) {
      return new THREE.MeshStandardMaterial({ color, roughness, metalness, envMapIntensity: 0.35 });
    }
    _box(w, h, d, mat, x, y, z, parent) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      (parent || this.scene).add(m);
      return m;
    }
    _clearGroup(g) {
      while (g.children.length) {
        const c = g.children.pop();
        c.traverse(o => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) { Array.isArray(o.material) ? o.material.forEach(m => m.dispose()) : o.material.dispose(); }
        });
        g.remove(c);
      }
    }
    /* Marco shaker (relieve perimetral) sobre un frente. n='z' (frontal) o 'x' (lateral) */
    _shakerFrame(cx, cy, cz, w, h, n, mat, group) {
      const t = 0.05, d = 0.018, iw = w - 0.07, ih = h - 0.07;
      if (n === 'z') {
        const z = cz + 0.012;
        this._box(iw, t, d, mat, cx, cy + ih / 2, z, group);
        this._box(iw, t, d, mat, cx, cy - ih / 2, z, group);
        this._box(t, ih, d, mat, cx - iw / 2, cy, z, group);
        this._box(t, ih, d, mat, cx + iw / 2, cy, z, group);
      } else {
        const x = cx + 0.012;
        this._box(d, t, iw, mat, x, cy + ih / 2, cz, group);
        this._box(d, t, iw, mat, x, cy - ih / 2, cz, group);
        this._box(d, ih, t, mat, x, cy, cz - iw / 2, group);
        this._box(d, ih, t, mat, x, cy, cz + iw / 2, group);
      }
    }

    /* ── Luces base (el HDRI aporta el resto del relleno) ── */
    _buildLights() {
      this.ambient = new THREE.AmbientLight(0xfbf4e8, 0.3);
      this.scene.add(this.ambient);

      this.hemi = new THREE.HemisphereLight(0xfff6e6, 0x6b6258, 0.1);
      this.scene.add(this.hemi);

      this.sun = new THREE.DirectionalLight(0xfff4e2, 1.0);
      this.sun.position.set(3.2, 4.6, 2.6);
      this.sun.castShadow = true;
      this.sun.shadow.mapSize.set(2048, 2048);
      this.sun.shadow.camera.near =  1;
      this.sun.shadow.camera.far  = 16;
      this.sun.shadow.camera.left = -5; this.sun.shadow.camera.right = 5;
      this.sun.shadow.camera.top  =  5; this.sun.shadow.camera.bottom = -3;
      this.sun.shadow.bias = -0.0006;
      this.sun.shadow.normalBias = 0.02;
      this.scene.add(this.sun);

      /* Luz cálida que entra por la ventana */
      this.winLight = new THREE.PointLight(0xfff2dc, 0.55, 6, 1.8);
      this.winLight.position.set(1.2, 1.85, -2.05);
      this.scene.add(this.winLight);
    }

    /* ── Environment map (HDRI) → reflejos PBR realistas ──── */
    _buildEnvironment() {
      this._pmrem = new THREE.PMREMGenerator(this.renderer);
      new RGBELoader().load(ASSET + 'brown_photostudio_01_1k.hdr', (hdr) => {
        const envMap = this._pmrem.fromEquirectangular(hdr).texture;
        this.scene.environment = envMap;     // ilumina y refleja (no es el background)
        this._envMap = envMap;
        hdr.dispose();
        this._pmrem.dispose();
      }, undefined, () => console.warn('[KitchenScene] no se pudo cargar el HDRI'));
    }

    /* ── Post-procesado: oclusión ambiental (GTAO) + bloom ── */
    _buildComposer(w, h) {
      try {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        /* Oclusión ambiental de contacto → sombras suaves donde los objetos se tocan */
        const gtao = new GTAOPass(this.scene, this.camera, w, h);
        gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.0, thickness: 0.4, scale: 1.0, samples: 16 });
        gtao.blendIntensity = 0.85;
        this.composer.addPass(gtao);
        this._gtao = gtao;

        /* Bloom suave → solo los emisores reales destellan (no las paredes) */
        const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.16, 0.4, 1.05);
        this.composer.addPass(bloom);

        /* OutputPass aplica tone mapping + sRGB al canvas (una sola vez) */
        this.composer.addPass(new OutputPass());
      } catch (e) {
        console.warn('[KitchenScene] post-procesado no disponible, render directo:', e);
        this.composer = null;
      }
    }

    /* ── Caparazón: piso, paredes, techo, ventana ────────── */
    _buildShell() {
      /* Piso — madera realista (textura PBR, carga async) */
      this.floorMat = new THREE.MeshStandardMaterial({ color: 0xb59a78, roughness: 0.65, metalness: 0, envMapIntensity: 0.4 });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), this.floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);
      this._applyFloorTextures();

      /* Paredes off-white cálido */
      const wallMat = this._std(0xf2ede5, 0.95);
      const back = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), wallMat);
      back.position.set(0, 2.5, -2.5); back.receiveShadow = true;
      this.scene.add(back);

      const left = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), wallMat.clone());
      left.rotation.y = Math.PI / 2; left.position.set(-2.5, 2.5, 0);
      left.receiveShadow = true;
      this.scene.add(left);

      /* Cielorraso */
      this.ceilingY = 2.72;
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), this._std(0xf6f1ea, 1.0));
      ceil.rotation.x = Math.PI / 2; ceil.position.set(0, this.ceilingY, 0);
      ceil.receiveShadow = true;
      this.scene.add(ceil);

      /* Ventana sobre la mesada (pared de fondo, lado derecho) */
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(1.3, 1.05),
        new THREE.MeshStandardMaterial({ color: 0xcfe6f4, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.32, emissive: 0xbcdcf0, emissiveIntensity: 0.35 })
      );
      glass.position.set(1.2, 1.78, -2.48);
      this.scene.add(glass);

      const fm = this._std(0xffffff, 0.85);
      [
        [1.2, 2.34, 1.44, 0.07, 0.05],
        [1.2, 1.22, 1.44, 0.07, 0.05],
        [0.50, 1.78, 0.07, 1.12, 0.05],
        [1.90, 1.78, 0.07, 1.12, 0.05],
        [1.2, 1.78, 1.44, 0.04, 0.035],
      ].forEach(([x, y, w, h, d]) => this._box(w, h, d, fm, x, y, -2.46, this.scene));
    }

    /* ── Mesadas + backsplash (material de piedra mutable) ── */
    _buildCountertops() {
      this.stoneMat = new THREE.MeshStandardMaterial({ color: 0xe8e2d8, roughness: 0.2, metalness: 0.04, envMapIntensity: 0.6 });

      /* Mesada principal */
      const ctMain = this._box(2.96, 0.045, 0.66, this.stoneMat, -0.35, 0.9, -1.86, this.scene);
      ctMain.castShadow = ctMain.receiveShadow = true;
      /* Mesada lateral (forma L) */
      const ctSide = this._box(0.66, 0.045, 1.2, this.stoneMat, -2.07, 0.9, -1.28, this.scene);
      ctSide.castShadow = ctSide.receiveShadow = true;

      /* Backsplash */
      const bsMain = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 0.62), this.stoneMat);
      bsMain.position.set(-0.35, 1.23, -2.17);
      this.scene.add(bsMain);
      const bsSide = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 0.62), this.stoneMat);
      bsSide.rotation.y = Math.PI / 2; bsSide.position.set(-2.38, 1.23, -1.28);
      this.scene.add(bsSide);
    }

    /* ── Pileta + canilla + alacenas + campana + heladera ── */
    _buildFixtures() {
      /* Alacenas superiores */
      const upMat = this._std(0xf1ede7, 0.5);
      this.upperCab = upMat;
      const uc = this._box(2.5, 0.62, 0.36, upMat, -0.55, 2.12, -2.14, this.scene);
      uc.castShadow = true;
      this.upperCabY = 2.12; this.upperCabBottom = 2.12 - 0.31;

      /* Pileta bajo mesada (derecha) */
      const sinkMat = new THREE.MeshStandardMaterial({ color: 0xcdccc9, roughness: 0.18, metalness: 0.85 });
      const sink = this._box(0.5, 0.16, 0.38, sinkMat, 0.55, 0.86, -1.88, this.scene);
      sink.position.y = 0.85;
      const faucetMat = new THREE.MeshStandardMaterial({ color: 0xcac6c2, roughness: 0.1, metalness: 0.95 });
      this._box(0.05, 0.26, 0.05, faucetMat, 0.55, 1.04, -2.08, this.scene);
      const spout = this._box(0.04, 0.04, 0.22, faucetMat, 0.55, 1.16, -1.97, this.scene);

      /* Campana de acero tipo pirámide truncada sobre el anafe, apoyada a la pared */
      const steel = new THREE.MeshStandardMaterial({ color: 0xc2c5c9, roughness: 0.22, metalness: 0.92 });
      this.campana = new THREE.Group();
      const cBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 0.34, 4), steel);
      cBody.rotation.y = Math.PI / 4;                 // caras al frente/lados
      cBody.position.set(-1.25, 1.78, -2.0);
      cBody.castShadow = true;
      const cBrim = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.05, 0.58), steel);
      cBrim.position.set(-1.25, 1.6, -2.0);
      const cDuct = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.62, 16), steel);
      cDuct.position.set(-1.25, 2.26, -2.05);
      this.campana.add(cBody, cBrim, cDuct);
      this.scene.add(this.campana);

      /* Heladera (rincón derecho, contra pared de fondo) */
      const fridgeMat = this._std(0xdde0e2, 0.3, 0.55);
      const fridge = this._box(0.72, 1.9, 0.7, fridgeMat, 1.92, 0.95, -2.05, this.scene);
      fridge.castShadow = true;
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xb7b2aa, roughness: 0.3, metalness: 0.85 });
      this._box(0.04, 0.5, 0.05, handleMat, 1.58, 1.35, -1.68, this.scene);
      this._box(0.04, 0.4, 0.05, handleMat, 1.58, 0.7, -1.68, this.scene);
    }

    /* ── Luminarias visibles (se construyen una vez) ──────── */
    _buildLuminaires() {
      /* base gris claro: apagado se ve como aluminio/lámpara, nunca como barra negra */
      const emis = (color) => new THREE.MeshStandardMaterial({ color: 0xcfcfcf, emissive: color, emissiveIntensity: 0, roughness: 0.4, metalness: 0.2 });

      /* Spots empotrados en el techo */
      this.spots = [];
      const spotPos = [[-1.4, -1.1], [-0.2, -1.1], [1.0, -0.6], [-1.4, 0.2], [0.2, 0.2]];
      spotPos.forEach(([x, z]) => {
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 20), this._std(0xe8e8e8, 0.5, 0.3));
        ring.position.set(x, this.ceilingY - 0.015, z);
        const led = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), emis(0xfff2d6));
        led.rotation.x = Math.PI / 2; led.position.set(x, this.ceilingY - 0.032, z);
        const light = new THREE.SpotLight(0xfff2d6, 0, 6, Math.PI / 5, 0.5, 1.4);
        light.position.set(x, this.ceilingY - 0.03, z);
        light.target.position.set(x, 0, z);
        this.scene.add(ring, led, light, light.target);
        this.spots.push({ led, light });
      });

      /* Colgantes sobre la mesada principal */
      this.pendants = [];
      [-0.9, -0.1, 0.7].forEach(x => {
        const cord = this._box(0.012, 0.6, 0.012, this._std(0x2a2a2a, 0.6), x, 2.1, -1.7, this.scene);
        const shade = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.18, 20, 1, true), this._std(0x2c2c2c, 0.5, 0.3));
        shade.position.set(x, 1.78, -1.7);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), emis(0xffe6b0));
        bulb.position.set(x, 1.73, -1.7);
        const light = new THREE.PointLight(0xffe6b0, 0, 3.2, 1.6);
        light.position.set(x, 1.7, -1.7);
        this.scene.add(light);
        this.pendants.push({ shade, bulb, light, cord });
      });

      /* Tira LED bajo alacenas */
      this.led = { emissives: [], lights: [] };
      const strip = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.025, 0.04), emis(0xeaf4ff));
      strip.position.set(-0.55, this.upperCabBottom - 0.02, -1.98);
      this.scene.add(strip);
      this.led.emissives.push(strip);
      [-1.3, -0.55, 0.2].forEach(x => {
        const l = new THREE.PointLight(0xeaf4ff, 0, 2.4, 2);
        l.position.set(x, this.upperCabBottom - 0.05, -1.8);
        this.scene.add(l);
        this.led.lights.push(l);
      });

      /* Plafón cenital central */
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.7), emis(0xfff4e2));
      panel.position.set(0.1, this.ceilingY - 0.03, -0.4);
      this.scene.add(panel);
      this.plafonLight = new THREE.PointLight(0xfff4e2, 0, 7, 1.2);
      this.plafonLight.position.set(0.1, this.ceilingY - 0.2, -0.4);
      this.scene.add(this.plafonLight);
      this.plafon = { panel, light: this.plafonLight };
    }

    /* ════════════════════ API pública ════════════════════ */

    async setStoneMaterial(item) {
      const token = item ? (item.id || item.img || item.tex) : null;
      this._reqStone = token;
      const M = this.stoneMat;
      if (!item) {
        M.map = M.normalMap = M.roughnessMap = null;
        M.color.set(FURNITURE[this._curFurniture].defaultStone);
        M.roughness = 0.22; M.needsUpdate = true;
        return;
      }
      if (item.tex) {
        /* Textura PBR realista (color + normal + rugosidad) */
        const base = ASSET + 'stone/' + item.tex + '/';
        const [color, nor, rough] = await Promise.all([
          this._loadTex(base + 'color.jpg', true),
          this._loadTex(base + 'nor.jpg',   false),
          this._loadTex(base + 'rough.jpg', false),
        ]);
        if (this._reqStone !== token) return;
        [color, nor, rough].forEach(t => t.repeat.set(1.6, 1));
        M.map = color; M.normalMap = nor; M.roughnessMap = rough;
        M.normalScale.set(0.6, 0.6);
        M.color.set(0xffffff);
        M.roughness = 1.0; M.metalness = 0.0; M.envMapIntensity = 0.6;
        M.needsUpdate = true;
      } else {
        /* Fallback: swatch del catálogo (con anisotropy) */
        const tex = await this._loadTex(item.img, true);
        if (this._reqStone !== token) return;
        tex.repeat.set(1, 1);
        M.map = tex; M.normalMap = M.roughnessMap = null;
        M.color.set(0xffffff); M.roughness = 0.18; M.needsUpdate = true;
      }
    }

    setFurniture(id) {
      const p = FURNITURE[id] || FURNITURE['cocina-l'];
      this._curFurniture = id in FURNITURE ? id : 'cocina-l';
      this._clearGroup(this.cabGroup);
      this._clearGroup(this.applGroup);
      this.frentes = [];

      const cabMat   = this._std(p.cab, p.rough);
      const golaMat  = this._std(0x9a9ea2, 0.4, 0.6);
      const kickMat  = this._std(0x1a1a1c, 0.7);

      /* Cuerpo gabinete inferior principal */
      this._box(2.9, 0.8, 0.6, cabMat, -0.35, 0.46, -1.88, this.cabGroup).receiveShadow = true;
      /* Cuerpo lateral (L) */
      this._box(0.6, 0.8, 1.16, cabMat, -2.07, 0.46, -1.28, this.cabGroup).receiveShadow = true;
      /* Zócalo oscuro */
      this._box(2.9, 0.1, 0.55, kickMat, -0.35, 0.05, -1.86, this.cabGroup);
      this._box(0.55, 0.1, 1.12, kickMat, -2.07, 0.05, -1.28, this.cabGroup);

      /* Frentes del módulo principal (cara mira +z, en z≈-1.575) */
      const frenteZ = -1.575;
      const startX = -1.75, endX = 1.05;
      const nMod = 4, modW = (endX - startX) / nMod;
      for (let i = 0; i < nMod; i++) {
        const cx = startX + modW * (i + 0.5);
        if (p.frente === 'cajon') {
          /* 3 cajones horizontales por módulo */
          for (let r = 0; r < 3; r++) {
            const cy = 0.22 + r * 0.24;
            this._box(modW - 0.04, 0.22, 0.02, cabMat, cx, cy, frenteZ, this.cabGroup);
            this.frentes.push({ x: cx + modW / 2 - 0.06, y: cy, z: frenteZ + 0.02, n: 'z', vertical: false });
          }
        } else {
          /* Puerta entera con marco shaker (relieve) */
          this._box(modW - 0.04, 0.72, 0.02, cabMat, cx, 0.47, frenteZ, this.cabGroup);
          this._shakerFrame(cx, 0.47, frenteZ, modW - 0.04, 0.72, 'z', cabMat, this.cabGroup);
          this.frentes.push({ x: cx + modW / 2 - 0.07, y: 0.6, z: frenteZ + 0.02, n: 'z', vertical: true });
        }
        /* Perfil gola: ranura de aluminio en el tope del frente (sin manijas) */
        if (p.frente === 'gola') {
          this._box(modW - 0.02, 0.03, 0.05, golaMat, cx, 0.83, frenteZ + 0.01, this.cabGroup);
        }
      }

      /* Frentes del módulo lateral (cara mira +x, en x≈-1.78) */
      const ladoX = -1.78;
      [-1.62, -1.02].forEach(cz => {
        if (p.frente === 'gola') {
          this._box(0.05, 0.03, 0.5, golaMat, ladoX + 0.01, 0.83, cz, this.cabGroup);
        } else {
          this._box(0.02, 0.72, 0.5, cabMat, ladoX, 0.47, cz, this.cabGroup);
          this._shakerFrame(ladoX, 0.47, cz, 0.5, 0.72, 'x', cabMat, this.cabGroup);
          this.frentes.push({ x: ladoX + 0.02, y: 0.6, z: cz + 0.2, n: 'x', vertical: true });
        }
      });

      /* Anafe a gas (cocina en L) sobre la mesada, sector izquierdo */
      if (p.anafe) {
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.12, metalness: 0.3 });
        this._box(0.56, 0.03, 0.48, glassMat, -1.25, 0.94, -1.9, this.applGroup);
        const burner = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.4, metalness: 0.6 });
        [[-1.4, -2.02], [-1.1, -2.02], [-1.4, -1.78], [-1.1, -1.78]].forEach(([x, z]) =>
          this._box(0.12, 0.02, 0.12, burner, x, 0.96, z, this.applGroup));
      }
      /* Horno empotrado de acero (integral) */
      if (p.horno) {
        const steel = this._std(0xc2c5c8, 0.3, 0.85);
        this._box(0.6, 0.6, 0.04, steel, -1.25, 0.45, frenteZ - 0.005, this.applGroup);
        this._box(0.5, 0.06, 0.06, this._std(0x8d9094, 0.3, 0.9), -1.25, 0.68, frenteZ + 0.03, this.applGroup);
      }

      /* Reconstruir manijas según el frente nuevo (gola = sin manijas) */
      if (p.frente === 'gola') this._clearGroup(this.handleGroup);
      else this.setHerraje(this._curHerraje);

      /* Mantener piedra: si no hay textura, usar el default del mueble */
      if (!this.stoneMat.map) this.stoneMat.color.set(p.defaultStone);
    }

    setHerraje(id) {
      this._curHerraje = id;
      /* Si el mueble es gola (sin manijas), no dibujar nada */
      if (FURNITURE[this._curFurniture] && FURNITURE[this._curFurniture].frente === 'gola') {
        this._clearGroup(this.handleGroup);
        return;
      }
      const cfg = HERRAJE_MAP[id] || { tipo: 'barra', finish: 'cromo' };
      const f = FINISH[cfg.finish] || FINISH.cromo;
      const mat = new THREE.MeshStandardMaterial({ color: f.color, roughness: f.roughness, metalness: f.metalness });

      this._clearGroup(this.handleGroup);
      this.frentes.forEach(fr => {
        const g = this._buildHandle(cfg.tipo, mat, cfg.largo || 1);
        g.position.set(fr.x, fr.y, fr.z);
        if (fr.n === 'x') g.rotation.y = Math.PI / 2;        // frente lateral mira +x
        this.handleGroup.add(g);
      });
    }

    /* Construye la geometría de una manija según arquetipo (cara hacia +z) */
    _buildHandle(tipo, mat, largo) {
      const g = new THREE.Group();
      const add = (mesh) => { mesh.castShadow = true; g.add(mesh); return mesh; };
      const roseta = () => {
        const r = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 18), mat);
        r.rotation.x = Math.PI / 2; r.position.z = 0.01; return r;
      };

      if (tipo === 'barra') {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 12), mat);
        bar.position.z = 0.04; add(bar);
        [-0.11, 0.11].forEach(dy => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.045, 8), mat);
          leg.rotation.x = Math.PI / 2; leg.position.set(0, dy, 0.02); add(leg);
        });
      } else if (tipo === 'manijon') {
        const L = 0.4 * largo;
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.035, L, 0.025), mat);
        bar.position.z = 0.05; add(bar);
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.07, L + 0.05, 0.015), mat);
        base.position.z = 0.012; add(base);
        [-(L / 2 - 0.03), (L / 2 - 0.03)].forEach(dy => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.04), mat);
          leg.position.set(0, dy, 0.03); add(leg);
        });
      } else if (tipo === 'lever-recto') {
        add(roseta());
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 10), mat);
        neck.rotation.x = Math.PI / 2; neck.position.z = 0.04; add(neck);
        const lever = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.028, 0.028), mat);
        lever.position.set(0.07, 0, 0.06); add(lever);
      } else if (tipo === 'lever-curvo') {
        add(roseta());
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 10), mat);
        neck.rotation.x = Math.PI / 2; neck.position.z = 0.04; add(neck);
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0.06),
          new THREE.Vector3(0.1, -0.02, 0.07),
          new THREE.Vector3(0.16, 0.04, 0.05)
        );
        const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.016, 8), mat);
        add(tube);
      } else if (tipo === 'ministerio') {
        const shield = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.015), mat);
        shield.position.z = 0.01; add(shield);
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 10), mat);
        neck.rotation.x = Math.PI / 2; neck.position.set(0, 0.05, 0.04); add(neck);
        const lever = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.026, 0.026), mat);
        lever.position.set(0.065, 0.05, 0.06); add(lever);
      } else if (tipo === 'pomo') {
        add(roseta());
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.04, 12), mat);
        stem.rotation.x = Math.PI / 2; stem.position.z = 0.035; add(stem);
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 18, 14), mat);
        knob.scale.set(1, 1, 0.7); knob.position.z = 0.075; add(knob);
      }
      return g;
    }

    setIluminacion(id) {
      const off = () => {
        this.spots.forEach(s => { s.light.intensity = 0; s.led.material.emissiveIntensity = 0; });
        this.pendants.forEach(p => { p.light.intensity = 0; p.bulb.material.emissiveIntensity = 0; });
        this.led.lights.forEach(l => l.intensity = 0);
        this.led.emissives.forEach(e => { e.material.emissiveIntensity = 0; e.visible = false; });
        this.plafon.light.intensity = 0; this.plafon.panel.material.emissiveIntensity = 0;
      };
      const setSpots   = (i, c) => this.spots.forEach(s => { s.light.intensity = i; s.light.color.set(c); s.led.material.emissive.set(c); s.led.material.emissiveIntensity = i > 0 ? 1.4 : 0; });
      const setPend    = (i, c) => this.pendants.forEach(p => { p.light.intensity = i; p.light.color.set(c); p.bulb.material.emissive.set(c); p.bulb.material.emissiveIntensity = i > 0 ? 1.6 : 0; });
      const setLed     = (i, c) => { this.led.lights.forEach(l => { l.intensity = i; l.color.set(c); }); this.led.emissives.forEach(e => { e.visible = i > 0; e.material.emissive.set(c); e.material.emissiveIntensity = i > 0 ? 1.5 : 0; }); };
      const setPlafon  = (i, c) => { this.plafon.light.intensity = i; this.plafon.light.color.set(c); this.plafon.panel.material.emissive.set(c); this.plafon.panel.material.emissiveIntensity = i > 0 ? 1.3 : 0; };

      off();
      switch (id) {
        case 'lum-interior':   // luz hogareña cálida
          setPend(1.0, 0xffdca0); setPlafon(0.32, 0xffe8c4);
          this.ambient.intensity = 0.16; this.ambient.color.set(0xffeede);
          this.sun.intensity = 0.95; this.winLight.intensity = 0.3;
          break;
        case 'lum-led':        // blanco frío técnico
          setLed(1.4, 0xeaf4ff); setSpots(1.0, 0xf0f6ff);
          this.ambient.intensity = 0.42; this.ambient.color.set(0xeef4ff);
          this.sun.intensity = 1.1; this.sun.color.set(0xeef6ff); this.winLight.intensity = 0.6;
          break;
        case 'instalacion':    // todo encendido, neutro
          setSpots(0.9, 0xfff4e2); setPend(0.9, 0xfff2dc); setLed(1.0, 0xf2f6ff); setPlafon(0.7, 0xffffff);
          this.ambient.intensity = 0.5; this.ambient.color.set(0xfdf6ec);
          this.sun.intensity = 1.2; this.sun.color.set(0xfff4e2); this.winLight.intensity = 0.7;
          break;
        case 'automatizacion': // ambiente tenue / dimmer
          setPend(0.55, 0xffcaa0); setLed(0.5, 0xa0c0ff);
          this.ambient.intensity = 0.22; this.ambient.color.set(0xffe6c8);
          this.sun.intensity = 0.4; this.sun.color.set(0xffd9a8); this.winLight.intensity = 0.3;
          break;
        case 'lum-exterior':   // fuerte luz de día por la ventana
          setSpots(0.3, 0xffffff);
          this.ambient.intensity = 0.6; this.ambient.color.set(0xf6f8fc);
          this.sun.intensity = 2.1; this.sun.color.set(0xffffff); this.winLight.intensity = 1.6; this.winLight.color.set(0xfff6e8);
          break;
        default:
          setPend(1.2, 0xffdca0); setPlafon(0.5, 0xffe8c4);
          this.ambient.intensity = 0.5; this.sun.intensity = 1.1; this.winLight.intensity = 0.7;
      }
    }

    /* ── Piso de madera PBR (diff + normal + rough) ──────── */
    _applyFloorTextures() {
      const L = new THREE.TextureLoader();
      const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
      const set = (tex, srgb) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 4);
        tex.anisotropy = maxAniso;
        if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      };
      L.load(ASSET + 'wood_floor_diff_1k.jpg',   t => { this.floorMat.map = set(t, true);  this.floorMat.color.set(0xffffff); this.floorMat.needsUpdate = true; });
      L.load(ASSET + 'wood_floor_nor_gl_1k.jpg', t => { this.floorMat.normalMap = set(t, false); this.floorMat.needsUpdate = true; });
      L.load(ASSET + 'wood_floor_rough_1k.jpg',  t => { this.floorMat.roughnessMap = set(t, false); this.floorMat.needsUpdate = true; });
    }

    /* ── Props decorativos GLB (planta + jarrón) ─────────── */
    _loadProps() {
      const loader = new GLTFLoader();
      /* Planta en maceta, en el piso (rincón frente-derecha, espacio libre) */
      this._loadProp(loader, ASSET + 'potted_plant_01/potted_plant_01_1k.gltf',
        { targetH: 0.85, x: 1.35, z: 0.55, onFloor: true });
      /* Jarrón sobre la mesada lateral (sector libre, no choca con vajilla) */
      this._loadProp(loader, ASSET + 'ceramic_vase_01/ceramic_vase_01_1k.gltf',
        { targetH: 0.32, x: -2.0, z: -1.0, baseY: 0.925 });
    }

    _loadProp(loader, url, opt) {
      loader.load(url, (gltf) => {
        const obj = gltf.scene;
        obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        /* Normalizar tamaño por bounding box y apoyar la base */
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3(); box.getSize(size);
        const ctr  = new THREE.Vector3(); box.getCenter(ctr);
        const s = opt.targetH / (size.y || 1);
        obj.scale.setScalar(s);
        const baseY = opt.onFloor ? 0 : (opt.baseY || 0);
        obj.position.set(
          opt.x - ctr.x * s,
          baseY - box.min.y * s,
          opt.z - ctr.z * s
        );
        this.propsGroup.add(obj);
      }, undefined, () => console.warn('[KitchenScene] no se pudo cargar prop:', url));
    }

    /* ── Decoración procedural (banquetas, frutero, vajilla, cuadros) ── */
    _buildDecor() {
      const G = this.propsGroup;
      const wood   = this._std(0x9c6b3f, 0.6);
      const steelP = new THREE.MeshStandardMaterial({ color: 0xc8ccd0, roughness: 0.25, metalness: 0.9 });
      const MY = 0.925;  // altura tope mesada

      /* Banquetas desayunador (frente a la mesada) */
      [0.2, 0.95].forEach(x => {
        const g = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 22), wood);
        seat.position.y = 0.63; seat.castShadow = true; g.add(seat);
        [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]].forEach(([dx, dz]) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.63, 8), steelP);
          leg.position.set(dx, 0.315, dz); leg.castShadow = true; g.add(leg);
        });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.008, 8, 22), steelP);
        ring.rotation.x = Math.PI / 2; ring.position.y = 0.24; g.add(ring);
        g.position.set(x, 0, -0.95);
        G.add(g);
      });

      /* Frutero con frutas (mesada principal) */
      const bowl = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 22, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0xe8e3d8, roughness: 0.25, metalness: 0.05 })
      );
      bowl.position.set(0.15, MY + 0.05, -1.82); bowl.castShadow = true; G.add(bowl);
      const fruitCols = [0xd8682f, 0xc0392b, 0x6b8e23, 0xe0a92f, 0x8e44ad];
      fruitCols.forEach((c, i) => {
        const f = new THREE.Mesh(new THREE.SphereGeometry(0.038, 14, 12), this._std(c, 0.5));
        const a = (i / fruitCols.length) * Math.PI * 2;
        f.position.set(0.15 + Math.cos(a) * 0.05, MY + 0.085, -1.82 + Math.sin(a) * 0.05);
        f.castShadow = true; G.add(f);
      });

      /* Olla con tapa sobre el anafe */
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.12, 20), steelP);
      pot.position.set(-1.3, MY + 0.07, -1.95); pot.castShadow = true; G.add(pot);
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.112, 0.112, 0.02, 20), steelP);
      lid.position.set(-1.3, MY + 0.14, -1.95); G.add(lid);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), this._std(0x222222, 0.5));
      knob.position.set(-1.3, MY + 0.16, -1.95); G.add(knob);

      /* Tabla de cortar + cuchillo (mesada) */
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.022, 0.2), this._std(0x8a5a30, 0.55));
      board.position.set(-0.55, MY + 0.012, -1.75); board.castShadow = true; G.add(board);
      const knife = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.006, 0.03), steelP);
      knife.position.set(-0.5, MY + 0.027, -1.82); knife.rotation.y = 0.3; G.add(knife);
      const knifeH = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.018), this._std(0x2a2a2a, 0.5));
      knifeH.position.set(-0.62, MY + 0.027, -1.78); knifeH.rotation.y = 0.3; G.add(knifeH);

      /* Botella de aceite */
      const oil = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.18, 14),
        new THREE.MeshStandardMaterial({ color: 0x4a6b2f, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85 }));
      oil.position.set(-0.95, MY + 0.09, -1.95); oil.castShadow = true; G.add(oil);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.06, 12), this._std(0x999999, 0.3, 0.7));
      neck.position.set(-0.95, MY + 0.21, -1.95); G.add(neck);

      /* Cuadros en la pared lateral izquierda (x = -2.5, miran +x) */
      const frame = this._std(0x2b2b2b, 0.5);
      const arts = ['images/marmoles/Negro-marquina.webp', 'images/marmoles/Carrara.webp'];
      [[1.75, -0.2], [1.75, 0.55]].forEach(([y, z], i) => {
        const fr = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.62, 0.46), frame);
        fr.rotation.y = Math.PI / 2; fr.position.set(-2.49, y, z); fr.castShadow = true; G.add(fr);
        const canvasMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.7 });
        this._loadTex(arts[i], true).then(t => { canvasMat.map = t; canvasMat.color.set(0xffffff); canvasMat.needsUpdate = true; });
        const canvas = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.56), canvasMat);
        canvas.rotation.y = Math.PI / 2; canvas.position.set(-2.468, y, z); G.add(canvas);
      });
    }

    /* ── Interno ─────────────────────────────────────────── */
    async _loadTex(url, srgb = true) {
      if (_texCache.has(url)) return _texCache.get(url);
      return new Promise(resolve => {
        new THREE.TextureLoader().load(url, tex => {
          tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
          _texCache.set(url, tex);
          resolve(tex);
        });
      });
    }

    _animate() {
      this._animId = requestAnimationFrame(() => this._animate());
      if (this.controls) this.controls.update();
      if (this.container.clientWidth > 0 && this.container.clientHeight > 0) {
        if (this.composer) this.composer.render();
        else this.renderer.render(this.scene, this.camera);
      }
    }

    destroy() {
      cancelAnimationFrame(this._animId);
      if (this._idleTimer) clearTimeout(this._idleTimer);
      if (this.controls) this.controls.dispose();
      if (this.composer) this.composer.dispose();
      if (this._envMap) this._envMap.dispose();
      if (this._ro) this._ro.disconnect();
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode === this.container) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
  }

  window.KitchenScene = KitchenScene;
