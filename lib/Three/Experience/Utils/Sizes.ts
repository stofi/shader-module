import { EventEmitter } from './EventEmitter'

class Sizes extends EventEmitter {
  width!: number
  height!: number
  pixelRatio!: number
  maxPixelRatio = 0.25

  constructor() {
    super()
    this.setSizes()

    // if window has ?lowres=true, then set maxPixelRatio to 1

    window.addEventListener('resize', this.setSizes.bind(this))
  }

  private setSizes() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.pixelRatio = Math.min(window.devicePixelRatio, this.maxPixelRatio)
    this.trigger('resize')
  }
}

export default Sizes
