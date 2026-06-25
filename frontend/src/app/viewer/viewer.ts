import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { ScanAnalysisResult } from '../models/scan-analysis-result.model';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-viewer',
  imports: [],
  templateUrl: './viewer.html',
  styleUrl: './viewer.css',
})
export class Viewer implements AfterViewInit, OnChanges {

  @ViewChild('renderCanvas', { static: true })
  public renderCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() lesionData?: ScanAnalysisResult;

  private controls!: OrbitControls;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Group;

  ngAfterViewInit(): void {
    this.initThreeJs();
    this.loadModel();
    this.animate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('--- ngOnChanges FIRED ---', changes);
    if (changes['lesionData'] && this.lesionData?.presence) {
      console.log('Lesion data detected in Viewer! Attempting to highlight:', this.lesionData.location);
      this.highlightOrgan(this.lesionData.location);
    }
  }

  private initThreeJs(): void {
    const canvas = this.renderCanvas.nativeElement;

    // scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe6e6e6); // Premium soft light grey

    //Camera setup (Adjusted Z from 5 to 2 to zoom in)
    this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.camera.position.z = 1.4;

    //Renderer setup
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    //Lighting (Crucial so the model isn't completely black)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);

    //Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Smooth rotation
  }

  private loadModel(): void {
    const loader = new GLTFLoader();

    loader.load('assets/models/human_anatomy.glb', (gltf: any) => {

      this.model = gltf.scene;

      // Center the model
      const box = new THREE.Box3().setFromObject(this.model);
      const center = box.getCenter(new THREE.Vector3());
      this.model.position.sub(center);

      // --- LOG EVERY MESH NAME TO THE CONSOLE ---
      console.log('--- 3D MODEL MESHES ---');
      this.model.traverse((child: any) => {
        if (child.isMesh) {
          console.log(`Mesh Name: "${child.name}"`);
        }
      });
      console.log('-----------------------');

      this.scene.add(this.model);

      // If the AI finished analyzing BEFORE the 3D model finished downloading,
      // we need to trigger the highlight now!
      if (this.lesionData?.presence && this.lesionData.location) {
        this.highlightOrgan(this.lesionData.location);
      }

    }, undefined, (error: any) => {
      console.log('Model not found yet. Make sure you add human_anatomy.glb to the assets folder.', error);
    });
  }

  private highlightOrgan(locationString: string): void {
    console.log('highlightOrgan called with:', locationString);
    if (!this.model) {
      console.warn('highlightOrgan aborted: 3D model is not loaded yet.');
      return;
    }
    if (!locationString) {
      console.warn('highlightOrgan aborted: locationString is empty.');
      return;
    }

    // 2. Dynamic Auto-Discovery Algorithm!
    // Instead of a hardcoded map, we look for major body parts in the AI sentence.
    const majorOrgans = [
      'liver', 'heart', 'kidney', 'lung', 'brain', 'stomach',
      'spleen', 'pancreas', 'intestine', 'colon', 'bladder', 'bone', 'spine'
    ];

    let detectedOrgan = '';
    const locationLower = locationString.toLowerCase();

    for (const organ of majorOrgans) {
      if (locationLower.includes(organ)) {
        detectedOrgan = organ;
        break;
      }
    }

    if (!detectedOrgan) {
      console.warn('AI location did not mention any major organ we recognize:', locationString);
      return;
    }

    // 3. Search the actual 3D model for a mesh that matches the detected organ!
    let targetOrgan: THREE.Object3D | null = null;

    // First, turn the ENTIRE model into faint "Glass" to ensure the highlighted organ is visible
    this.model.traverse((child: any) => {
      if (child.isMesh) {
        // Ghost the mesh
        child.material = new THREE.MeshStandardMaterial({
          color: 0x666666,      // Darker grey glass to contrast against the light background
          transparent: true,
          opacity: 0.15,        // Very faint
          depthWrite: false     // Fixes transparency sorting issues
        });

        // Also check if this mesh matches our detected organ!
        if (!targetOrgan && child.name && child.name.toLowerCase().includes(detectedOrgan)) {
          targetOrgan = child;
          console.log(`Dynamic Search Success! Found mesh "${child.name}" for organ "${detectedOrgan}"`);
        }
      }
    });

    const foundOrgan = targetOrgan as THREE.Object3D | null;

    if (foundOrgan) {
      // 3. Highlight the target object with solid Yellow
      // We use traverse to guarantee we hit the mesh, even if the artist grouped it.
      foundOrgan.traverse((child: any) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xffff00,       // Solid Yellow
            emissive: 0x666600,    // Yellow glow
            transparent: false,
            opacity: 1.0,
            depthWrite: true
          });
        }
      });
    } else {
      console.warn(`Could not find any mesh containing the name "${detectedOrgan}" in the 3D scene!`);
    }
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

}
