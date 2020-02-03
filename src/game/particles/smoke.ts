import { Particle } from "./particle"

export class Smoke extends Particle {

    scale() : number {
        return 0.5 + (1 - this.ttl/20)
    }

    constructor(p:{x:number, y:number}){
        super(p, 10 + Math.random() * 20, 1)
    }

    tick(frame:number){
        super.tick(frame)
        this.position.x += Math.sin(frame * this.seed) * 0.5
        this.position.y += Math.random() * 3 * this.scale()
    }
}
