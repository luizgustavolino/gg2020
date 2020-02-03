import { GameEngine } from "../engine"


export class Particle {
    
    image:HTMLImageElement
    position:{x:number, y: number}
    canvas:CanvasRenderingContext2D
    ttl:number
    skin:number
    seed:number
    
    constructor(position:{x:number, y: number}, ttl:number, skin:number) {

        const world = GameEngine.shared().world
        this.canvas = world.context
        this.position = position
        this.ttl = ttl
        this.skin = skin
        this.seed = Math.random()

        for (const image of world.images) {
            if(image.src.endsWith("particles.png")){
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
    }

    draw(frame:number) {
        const s = this.scale()
        this.canvas.drawImage(this.image, 0, 10 * this.skin, 10, 10,
            this.position.x - (5 * s), this.position.y - (5 * s),
            10 * s, 10 * s)
    }
}