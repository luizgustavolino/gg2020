
import { GameEngine } from "../engine"
import { Particle } from "./particle"
import { Bubble } from "./bubble"
import { Smoke } from "./smoke"

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

    tick(frame:number) {
        for (const particle of this.particles) {
            particle.tick(frame)
        }

        this.particles = this.particles.filter( p => p.live())
    }

    draw(frame:number){
        for (const particle of this.particles) {
            particle.draw(frame)
        }
    }


}