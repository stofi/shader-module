import { Scene, PerspectiveCamera, Vector3 } from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import type Sizes from './Utils/Sizes'

import Experience from './Experience'

interface CameraOptions {
  controls?: 'orbit' | 'first-person'
}

class Camera {
  experience: Experience
  sizes: Sizes
  scene: Scene
  canvas: HTMLCanvasElement
  options: CameraOptions
  instance!: PerspectiveCamera
  controls?: OrbitControls | FirstPersonControls

  // getters
  get useFirstPersonControls() {
    return this.options.controls === 'first-person'
  }

  get useOrbitControls() {
    return this.options.controls === 'orbit'
  }

  constructor(options: CameraOptions = {}) {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    this.options = options

    this.setInstance()
  }

  private setInstance() {
    this.instance = new PerspectiveCamera(
      65,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    )
    this.instance.position.set(0, 0, 2)

    if (this.useFirstPersonControls) {
      this.controls = new FirstPersonControls(this.instance, this.canvas)
      this.controls.movementSpeed = 1
      this.controls.lookSpeed = 0.05
      this.controls.lookVertical = true
      this.controls.constrainVertical = true
      this.controls.verticalMin = 1.1
      this.controls.verticalMax = 2.1
    } else if (this.useOrbitControls) {
      this.controls = new OrbitControls(this.instance, this.canvas)
    } else {
      this.instance.position.set(0, 3, 2)
      this.instance.lookAt(new Vector3(0, -1, 0))
    }

    this.scene.add(this.instance)
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update() {
    if (this.controls instanceof FirstPersonControls) {
      this.controls.update(this.experience.time.delta / 1000)
    } else if (this.controls instanceof OrbitControls) {
      this.controls.update()
    }
  }
}

export default Camera
