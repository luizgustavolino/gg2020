import { GameEngine } from "../engine"


export class Particle {
    
    image:HTMLImageElement
    position:{x:number, y: number}
    canvas:CanvasRenderingContext2D
    ttl:number
    skin:number
    seed:number
    frames:number
    repeatFrames:number

    size:{w:number, h:number}
    localFrame = 0

    constructor(position:{x:number, y: number}, ttl:number,
        skin:number, imageSrc:string = "particles.png",
        frames:{count:number, repeat:number} = {count:1, repeat:1},
        size:{w:number, h:number} = {w:10,h:10}) {

        const world = GameEngine.shared().world
        this.canvas = world.context
        this.position = position
        this.ttl = ttl
        this.skin = skin
        this.seed = Math.random()
        this.frames = frames.count
        this.repeatFrames = frames.repeat
        this.size = size

        for (const image of world.images) {
            if(image.src.endsWith(imageSrc)){
                this.image = image
            }
        }
    }

    scale() : number {
        return 1.0
    }

    live(){
        return this.ttl > 0
    }

    tick(frame:number) {
        this.ttl -= 1
        this.localFrame++
    }

    draw(frame:number) {
        const s = this.scale()
        const w = this.size.w
        const h = this.size.h
        const f = (Math.floor(this.localFrame/this.repeatFrames) % this.frames)
        
        this.canvas.drawImage(this.image, w * f, h * this.skin, w, h,
            this.position.x - (w/2 * s), this.position.y - (h/2 * s), w * s, h * s)
    }
}