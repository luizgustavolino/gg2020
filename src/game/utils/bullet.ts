import { b2Body, b2CircleShape, b2FixtureDef, b2BodyDef, b2BodyType } from "box2d.ts";
import { GameEngine } from "../engine";
import * as k from "./../constants";
import { prts } from "../world";

export class Bullet {

    body:b2Body
    bulletImage:HTMLImageElement
    seed:number
    frames:number
    alreadyHit:boolean

    constructor(position:{x: number, y: number, angle:number}){

        this.seed = 0.5 + Math.random()* 0.5
        this.frames = 0
        this.alreadyHit = false
        const shape = new b2CircleShape();
        shape.m_radius = 4;

        const fd = new b2FixtureDef();
        fd.shape = shape;
        fd.density  = 5.0;
        fd.friction = 0.001;
        fd.filter.categoryBits = k.colide.bullets
        fd.filter.maskBits = k.colide.racers | k.colide.scenery
        
        const bd = new b2BodyDef()
        bd.type = b2BodyType.b2_dynamicBody
        bd.position.Set(position.x, position.y)
        
        const world = GameEngine.shared().world.world

        this.body = world.CreateBody(bd)
        this.body.CreateFixture(fd)
        this.body.SetAngle(position.angle)
        this.body.SetFixedRotation(true)
        this.body.SetGravityScale(0)
                
        GameEngine.shared().world.images.forEach( img => {
            if(img.src.endsWith("bullet.png")) {
                this.bulletImage = img
            }
        })
        
    }

    tick(){

        this.frames++;

        if(this.alreadyHit) {
            
            if (this.body == null) return
            let bullets = GameEngine.shared().world.bullets
            bullets = bullets.filter(b => b != this)
            GameEngine.shared().world.world.DestroyBody(this.body)
            this.body = null

        } else {

            const a = this.body.GetAngle()
            const c = this.body.GetWorldCenter()

            if(Math.random() < 0.6) {
                prts.addBubble({x:c.x, y:c.y})
            }

            this.body.ApplyLinearImpulse({
                x: Math.cos(a) * k.bulletSpeed * this.seed,
                y: Math.sin(a) * k.bulletSpeed * this.seed} , c )
        }
    }

    draw(){
        if(!this.alreadyHit) {
            const ctx = GameEngine.shared().world.context
            const p  = this.body.GetWorldCenter()
            
            let s  = 8 
            if (this.frames < 8) s *= 0.5 + (this.frames/8) * 0.5
            const ms = s/2

            ctx.drawImage(this.bulletImage,
                0, 0, 12, 12, 
                p.x - ms, p.y -ms, s, s)
        }
    }

    explode(){
        this.alreadyHit = true
    }
}