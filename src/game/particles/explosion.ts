import { Particle } from "./particle"

export class Explosion extends Particle {

    scale() : number {
        return 1
    }

    constructor(p:{x:number, y:number}){
        super(p, 12, 0, "explosion.png", {count:6, repeat:2}, {w:72, h:72})
    }

    tick(frame:number){
        super.tick(frame)
        this.position.x += Math.sin(frame * this.seed) * 0.5
        this.position.y += Math.random() * 3 * this.scale()
    }
}
