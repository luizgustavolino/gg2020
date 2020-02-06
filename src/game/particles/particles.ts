
import { GameEngine } from "../engine"
import { Particle } from "./particle"
import { Bubble } from "./bubble"
import { Smoke } from "./smoke"
import { Explosion } from "./explosion"

export class Particles {

    particles:Particle[]

    constructor (){
        this.particles = []
    }

    addBubble(position:{x:number, y:number}) {
        this.particles.push(new Bubble(position))
    }

    addSmoke(position:{x:number, y:number}) {
        this.particles.push(new Smoke(position))
    }

    addExplosion(position:{x:number, y:number}) {
        this.particles.push(new Explosion(position))
    }

    tick(frame:number) {
        for (const particle of this.particles) {
            particle.tick(frame)
        }

        this.particles = this.particles.filter( p => p.live())
    }

    draw(frame:number, kind:{even:boolean, odd:boolean}){
        let count = 0
        for (const particle of this.particles) {
            const even = (count++)%2 == 0
            if(even && kind.even) particle.draw(frame)
            if(!even && kind.odd) particle.draw(frame)
        }
    }


}