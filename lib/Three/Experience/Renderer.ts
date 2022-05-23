import {
  Scene,
  WebGLRenderer,
  WebGLRenderTarget,
  Vector2,
  LinearFilter,
  RGBAFormat,
  Color,
  MathUtils,
} from 'three'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js'

import Experience from './Experience'
import shader from './Shaders/Blobs'

import type Sizes from './Utils/Sizes'
import type Camera from './Camera'

class Renderer {
  experience: Experience
  canvas: HTMLCanvasElement
  sizes: Sizes
  scene: Scene
  camera: Camera
  instance!: WebGLRenderer
  effects!: EffectComposer
  renderPass!: RenderPass
  customPass!: ShaderPass
  blendPass!: ShaderPass
  savePass!: SavePass
  outputPass!: ShaderPass
  target!: WebGLRenderTarget

  mouse = new Vector2()
  mouseLerp = new Vector2()

  offset = 0
  scroll = 0
  scrollLerp = 0

  constructor() {
    this.experience = new Experience()
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.camera = this.experience.camera
    this.offset = Math.random() * 100

    this.setInstance()

    window.addEventListener('mousemove', this.onMouseMove.bind(this))

    setInterval(() => {
      this.onScroll()
    }, 100)
  }

  onMouseMove(event: MouseEvent) {
    const x = event.clientX / window.innerWidth
    const y = 1 - event.clientY / window.innerHeight
    this.mouseLerp.set(x, y)
  }

  onScroll() {
    this.scrollLerp = window.scrollY / window.innerHeight
  }

  private setInstance() {
    this.instance = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    })

    this.target = new WebGLRenderTarget(4, 3, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
    })

    this.effects = new EffectComposer(this.instance, this.target)
    this.resize()
    this.renderPass = new RenderPass(this.scene, this.camera.instance)

    this.customPass = new ShaderPass(shader)
    this.customPass.enabled = true

    // save pass
    this.savePass = new SavePass(
      new WebGLRenderTarget(
        this.experience.sizes.width,
        this.experience.sizes.height
      )
    )

    // blend pass
    this.blendPass = new ShaderPass(BlendShader, 'tDiffuse1')
    this.blendPass.uniforms.tDiffuse2.value = this.savePass.renderTarget.texture
    this.blendPass.uniforms.mixRatio.value = 0.5

    // output pass
    this.outputPass = new ShaderPass(CopyShader)
    this.outputPass.renderToScreen = true

    this.effects.addPass(this.renderPass)
    this.effects.addPass(this.customPass)
    this.effects.addPass(this.blendPass)
    this.effects.addPass(this.savePass)
    this.effects.addPass(this.outputPass)

    this.instance.setClearColor(0x000000, 0)
    this.turnOffEffects()

    this.setCustomUniforms()

    this.customPass.enabled = true
  }

  turnOffEffects() {
    this.customPass.enabled = false
    this.blendPass.enabled = false
    this.savePass.enabled = false
    this.outputPass.enabled = false
  }

  turnOnEffects() {
    this.customPass.enabled = true
    this.blendPass.enabled = true
    this.savePass.enabled = true
    this.outputPass.enabled = true
  }

  setCustomUniforms() {
    if (!this.customPass || !this.customPass.uniforms) return
    const uniforms = this.customPass.uniforms
    uniforms.u_resolution.value.x = window.innerWidth
    uniforms.u_resolution.value.y = window.innerHeight
    uniforms.u_time.value = this.experience.time.elapsed / 1000 + this.offset
    uniforms.u_mouse.value.x = this.mouse.x
    uniforms.u_mouse.value.y = this.mouse.y
    // uniforms.u_scrollOffset.value = this.scroll

    // console.log(uniforms.u_time.value)
  }

  setFrontColor(color: Color) {
    this.customPass.uniforms.u_max.value = color
  }

  setBackgroundColor(color: Color) {
    this.customPass.uniforms.u_min.value = color
  }

  resize() {
    this.setCustomUniforms()
    this.instance.setPixelRatio(this.sizes.pixelRatio)
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.effects.setPixelRatio(this.sizes.pixelRatio)
    this.effects.setSize(this.sizes.width, this.sizes.height)
  }

  update() {
    const a = 0.01
    this.mouse.x = MathUtils.lerp(this.mouse.x, this.mouseLerp.x, a)
    this.mouse.y = MathUtils.lerp(this.mouse.y, this.mouseLerp.y, a)
    const b = 0.001
    this.scroll = MathUtils.lerp(this.scroll, this.scrollLerp, b)

    this.setCustomUniforms()
    this.effects.render()
  }
}

export default Renderer
