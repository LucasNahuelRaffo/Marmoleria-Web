(function () {
  'use strict';
  if (!window.THREE) { console.warn('[KitchenScene] Three.js no cargado'); return; }

  const THREE = window.THREE;
  const _texCache = new Map(); // persiste entre instancias (re-init al volver del form)

  class KitchenScene {
    constructor(container) {
      this.container = container;
      this._animId  = null;
      this._requestedStoneUrl = null;

      const w = container.clientWidth  || 600;
      const h = container.clientHeight || 400;

      /* ── Renderer ── */
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
      this.renderer.outputColorSpace  = THREE.SRGBColorSpace;
      this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.15;
      Object.assign(this.renderer.domElement.style, { width: '100%', height: '100%', display: 'block' });
      container.appendChild(this.renderer.domElement);

      /* ── Scene ── */
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf2ede6);
      this.scene.fog = new THREE.Fog(0xf2ede6, 10, 20);

      /* ── Camera ── */
      this.camera = new THREE.PerspectiveCamera(50, w / h, 0.05, 40);
      this.camera.position.set(2.3, 1.75, 2.9);
      this.camera.lookAt(-0.2, 0.78, -0.9);

      this._buildLights();
      this._buildKitchen();
      this._animate();

      /* ── ResizeObserver ── */
      this._ro = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(width, height);
        }
      });
      this._ro.observe(container);
    }

    /* ── Luces ──────────────────────────────────────────── */
    _buildLights() {
      this.ambientLight = new THREE.AmbientLight(0xfff5e6, 0.45);
      this.scene.add(this.ambientLight);

      this.sunLight = new THREE.DirectionalLight(0xfffaf0, 1.5);
      this.sunLight.position.set(2.5, 5, 3);
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(1024, 1024);
      this.sunLight.shadow.camera.near   =  1;
      this.sunLight.shadow.camera.far    = 14;
      this.sunLight.shadow.camera.left   = -5;
      this.sunLight.shadow.camera.right  =  5;
      this.sunLight.shadow.camera.top    =  5;
      this.sunLight.shadow.camera.bottom = -3;
      this.sunLight.shadow.bias = -0.001;
      this.scene.add(this.sunLight);

      this.ceilA = new THREE.PointLight(0xfff0cc, 0.7, 6);
      this.ceilA.position.set(-0.5, 2.8, -0.5);
      this.scene.add(this.ceilA);

      this.ceilB = new THREE.PointLight(0xfff0cc, 0.6, 5);
      this.ceilB.position.set(0.8, 2.8, -1.5);
      this.scene.add(this.ceilB);
    }

    _std(color, roughness = 0.8, metalness = 0) {
      return new THREE.MeshStandardMaterial({ color, roughness, metalness });
    }

    /* ── Geometría ──────────────────────────────────────── */
    _buildKitchen() {
      /* Piso */
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), this._std(0xcec5b8, 0.88));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      this.scene.add(floor);

      /* Paredes */
      const wallMat = this._std(0xfaf8f4, 0.95);
      const bw = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.5), wallMat);
      bw.position.set(0, 2.25, -2.5);
      bw.receiveShadow = true;
      this.scene.add(bw);

      const lw = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.5), wallMat.clone());
      lw.rotation.y = Math.PI / 2;
      lw.position.set(-2.5, 2.25, 0);
      lw.receiveShadow = true;
      this.scene.add(lw);

      /* Material gabinetes (mutable) */
      this.cabMat = this._std(0xf0ece6, 0.62);

      /* Gabinetes inferiores — módulo frontal */
      const lcMain = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.88, 0.62), this.cabMat);
      lcMain.position.set(-0.35, 0.44, -1.88);
      lcMain.castShadow = lcMain.receiveShadow = true;
      this.scene.add(lcMain);

      /* Gabinetes inferiores — lateral (forma L) */
      const lcSide = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.88, 1.15), this.cabMat);
      lcSide.position.set(-2.08, 0.44, -1.26);
      lcSide.castShadow = lcSide.receiveShadow = true;
      this.scene.add(lcSide);

      /* Material mesada/zócalo (mutable) */
      this.stoneMat = new THREE.MeshStandardMaterial({ color: 0xe8e2d8, roughness: 0.22, metalness: 0.04 });

      /* Mesada principal */
      const ctMain = new THREE.Mesh(new THREE.BoxGeometry(2.96, 0.04, 0.68), this.stoneMat);
      ctMain.position.set(-0.35, 0.9, -1.85);
      ctMain.castShadow = ctMain.receiveShadow = true;
      this.scene.add(ctMain);

      /* Mesada lateral */
      const ctSide = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.04, 1.18), this.stoneMat);
      ctSide.position.set(-2.08, 0.9, -1.26);
      ctSide.castShadow = ctSide.receiveShadow = true;
      this.scene.add(ctSide);

      /* Zócalo/backsplash principal */
      const bsMain = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 0.68), this.stoneMat);
      bsMain.position.set(-0.35, 1.26, -2.19);
      this.scene.add(bsMain);

      /* Zócalo lateral */
      const bsSide = new THREE.Mesh(new THREE.PlaneGeometry(1.14, 0.68), this.stoneMat);
      bsSide.rotation.y = Math.PI / 2;
      bsSide.position.set(-2.19, 1.26, -1.26);
      this.scene.add(bsSide);

      /* Gabinetes superiores */
      const ucMain = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.65, 0.37), this.cabMat);
      ucMain.position.set(-0.45, 2.1, -2.12);
      ucMain.castShadow = true;
      this.scene.add(ucMain);

      /* Herrajes / manijas */
      this.handleMat = new THREE.MeshStandardMaterial({ color: 0xb8b4b0, roughness: 0.12, metalness: 0.94 });
      this.handles = [];
      [[-1.42, 0.57, -1.56], [-0.42, 0.57, -1.56], [0.58, 0.57, -1.56], [1.48, 0.57, -1.56]].forEach(pos => {
        const h = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.18, 8), this.handleMat);
        h.rotation.z = Math.PI / 2;
        h.position.set(...pos);
        this.scene.add(h);
        this.handles.push(h);
      });

      /* Pileta */
      const sinkMat = new THREE.MeshStandardMaterial({ color: 0xcacac8, roughness: 0.12, metalness: 0.88 });
      const sink = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, 0.4), sinkMat);
      sink.position.set(0.62, 0.87, -1.87);
      this.scene.add(sink);

      /* Canilla */
      const faucetMat = new THREE.MeshStandardMaterial({ color: 0xc8c4c0, roughness: 0.08, metalness: 0.96 });
      const fb = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.24, 8), faucetMat);
      fb.position.set(0.62, 1.03, -2.06);
      this.scene.add(fb);
      const fs = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.26, 8), faucetMat);
      fs.rotation.x = Math.PI / 2;
      fs.position.set(0.62, 1.14, -1.94);
      this.scene.add(fs);

      this._buildWindow();
    }

    _buildWindow() {
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0xc8e4f4, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.26,
      });
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.95), glassMat);
      glass.position.set(1.15, 1.8, -2.49);
      this.scene.add(glass);

      const fm = this._std(0xfefefe, 0.9);
      [
        [1.15, 2.30, -2.49, 1.25, 0.06, 0.04],
        [1.15, 1.30, -2.49, 1.25, 0.06, 0.04],
        [0.56, 1.80, -2.49, 0.06, 1.01, 0.04],
        [1.74, 1.80, -2.49, 0.06, 1.01, 0.04],
        [1.15, 1.80, -2.49, 1.25, 0.04, 0.03],
      ].forEach(([x, y, z, w, h, d]) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), fm);
        m.position.set(x, y, z);
        this.scene.add(m);
      });

      const wl = new THREE.PointLight(0xfff8f0, 1.0, 4.5);
      wl.position.set(1.15, 1.8, -2.1);
      this.scene.add(wl);
    }

    /* ── API pública ────────────────────────────────────── */

    async setStoneMaterial(imgUrl) {
      this._requestedStoneUrl = imgUrl;
      if (!imgUrl) {
        this.stoneMat.map = null;
        this.stoneMat.color.set(0xe8e2d8);
        this.stoneMat.roughness = 0.22;
        this.stoneMat.needsUpdate = true;
        return;
      }
      const tex = await this._loadTex(imgUrl);
      if (this._requestedStoneUrl !== imgUrl) return; // request más nuevo en vuelo
      tex.repeat.set(2, 1);
      this.stoneMat.map = tex;
      this.stoneMat.color.set(0xffffff);
      this.stoneMat.roughness = 0.18;
      this.stoneMat.needsUpdate = true;
    }

    setFurniture(id) {
      const presets = {
        'cocina-l':          { color: 0xf0ece6, roughness: 0.62 },
        'cocina-integral':   { color: 0x6c706a, roughness: 0.52 },
        'cocina-cajones':    { color: 0xb07840, roughness: 0.48 },
        'vanitory-amplio':   { color: 0xf0ece6, roughness: 0.62 },
        'vanitory-blanco':   { color: 0xe8e4dc, roughness: 0.68 },
        'vanitory-sencillo': { color: 0xc4beb8, roughness: 0.58 },
      };
      const p = presets[id] || presets['cocina-l'];
      this.cabMat.color.set(p.color);
      this.cabMat.roughness = p.roughness;
      this.cabMat.needsUpdate = true;
    }

    setHerraje(id) {
      const gold   = { color: 0xcf9e38, roughness: 0.10, metalness: 0.97 };
      const black  = { color: 0x282828, roughness: 0.32, metalness: 0.78 };
      const bronze = { color: 0x8a6035, roughness: 0.28, metalness: 0.82 };
      const chrome = { color: 0xb8b4b0, roughness: 0.10, metalness: 0.95 };
      const map = {
        'h-104': gold,  'h-116': bronze, 'h-142-alerce': bronze,
        'h-142-alerce-set': bronze, 'h-143': bronze,
        'h-175': chrome, 'h-176': chrome, 'h-180': gold,
        'h-910': black,  'h-911': black,  'h-912': black, 'h-2085': black,
      };
      const p = map[id] || chrome;
      this.handleMat.color.set(p.color);
      this.handleMat.roughness = p.roughness;
      this.handleMat.metalness = p.metalness;
      this.handleMat.needsUpdate = true;
    }

    setIluminacion(id) {
      const presets = {
        'lum-interior':   { amb: [0xffe8c4, 0.55], sun: [0xffdd96, 1.1], ceil: [0xffcc88, 1.2] },
        'lum-led':        { amb: [0xe8f2ff, 0.45], sun: [0xeef8ff, 1.9], ceil: [0xddeeff, 1.3] },
        'instalacion':    { amb: [0xffffff, 0.50], sun: [0xffffff, 1.7], ceil: [0xffffff, 0.9] },
        'automatizacion': { amb: [0xffe0a0, 0.20], sun: [0xffd080, 0.50], ceil: [0xffcc66, 0.32] },
        'lum-exterior':   { amb: [0xf8f8f2, 0.55], sun: [0xffffff, 2.3], ceil: [0xfff0e8, 0.38] },
      };
      const p = presets[id] || { amb: [0xfff5e6, 0.45], sun: [0xfffaf0, 1.5], ceil: [0xfff0cc, 0.65] };
      this.ambientLight.color.set(p.amb[0]); this.ambientLight.intensity = p.amb[1];
      this.sunLight.color.set(p.sun[0]);     this.sunLight.intensity     = p.sun[1];
      this.ceilA.color.set(p.ceil[0]);       this.ceilA.intensity        = p.ceil[1];
      this.ceilB.color.set(p.ceil[0]);       this.ceilB.intensity        = p.ceil[1] * 0.82;
    }

    /* ── Interno ────────────────────────────────────────── */

    async _loadTex(url) {
      if (_texCache.has(url)) return _texCache.get(url);
      return new Promise(resolve => {
        new THREE.TextureLoader().load(url, tex => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          _texCache.set(url, tex);
          resolve(tex);
        });
      });
    }

    _animate() {
      this._animId = requestAnimationFrame(() => this._animate());
      if (this.container.clientWidth > 0 && this.container.clientHeight > 0) {
        this.renderer.render(this.scene, this.camera);
      }
    }

    destroy() {
      cancelAnimationFrame(this._animId);
      if (this._ro) this._ro.disconnect();
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode === this.container) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
  }

  window.KitchenScene = KitchenScene;
})();
