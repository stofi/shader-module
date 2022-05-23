import { Scene } from 'three'

import Sizes from './Utils/Sizes'
import Time from './Utils/Time'

import Camera from './Camera'
import Renderer from './Renderer'

let instance: Experience

class Experience {
  canvas!: HTMLCanvasElement
  sizes!: Sizes
  time!: Time
  camera!: Camera
  scene!: Scene
  renderer!: Renderer

  constructor(canvas?: HTMLCanvasElement) {
    if (instance) return instance
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    instance = this

    if (!canvas) throw new Error('Experience requires a canvas element')

    this.canvas = canvas
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new Scene()
    this.camera = new Camera({
      controls: 'orbit',
    })
    // this.world = new World()
    this.renderer = new Renderer()

    this.resize()

    this.sizes.on('resize', this.resize.bind(this))
    this.time.on('tick', this.update.bind(this))

  
  }

  private resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  private update() {
    this.camera.update()
    this.renderer.update()
  }
}

export default Experience
