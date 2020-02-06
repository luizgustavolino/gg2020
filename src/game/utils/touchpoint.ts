import { b2ContactListener, b2Contact, b2Body } from "box2d.ts";
import * as k from "./../constants"
import { Bullet } from "./bullet";
import { GameEngine } from "../engine";

export class Touch extends b2ContactListener {
    public BeginContact(contact: b2Contact): void {
        

        this.between(contact, k.colide.bullets, k.colide.racers, (a,b) => {
            const bullet = this.bulletFromBody(a)
            if(bullet != null) bullet.explode(true)
        })

        this.between(contact, k.colide.bullets, k.colide.scenery, (a,b) => {
            const bullet = this.bulletFromBody(a)
            if(bullet != null) bullet.explode(false)
        })
    }

    private between(contact:b2Contact, a:number, b:number, callback:(a:b2Body, b:b2Body) => void) {
        
        const fixA = contact.GetFixtureA()
        const fixB = contact.GetFixtureB()
        const catA = fixA.GetFilterData().categoryBits
        const catB = fixB.GetFilterData().categoryBits


        if(catA == a && catB == b)
            callback(fixA.GetBody(), fixB.GetBody())
        else if(catA == b && catB == a)
            callback(fixB.GetBody(), fixA.GetBody())
    }

    private bulletFromBody(body:b2Body) : Bullet {
        let world = GameEngine.shared().world
        for (const bullet of world.bullets) {
            if (bullet.body == body) return bullet
        }
        return null
    }
}