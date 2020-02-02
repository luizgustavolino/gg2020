import { b2Body, b2CircleShape, b2FixtureDef, b2BodyDef, b2BodyType } from "box2d.ts";
import { GameEngine } from "../engine";
import * as k from "./../constants";

export class Bullet {

    body:b2Body
    bulletImage:HTMLImageElement

    constructor(position:{x: number, y: number, angle:number}){

        const shape = new b2CircleShape();
        shape.m_radius = 4;

        const fd = new b2FixtureDef();
        fd.shape = shape;
        fd.density  = 5.0;
        fd.friction = 0.0001;
  
        const bd = new b2BodyDef()
        bd.type = b2BodyType.b2_dynamicBody
        bd.position.Set(position.x, position.y)

        const world = GameEngine.shared().world.world

        this.body = world.CreateBody(bd)
        this.body.CreateFixture(fd)
        this.body.SetAngle(position.angle)
        this.body.SetFixedRotation(true)
        let linearX = Math.cos(position.angle) * 4000
        let linearY = Math.cos(position.angle) * 4000
        this.body.SetLinearVelocity({x:linearX, y:linearY})
        
        GameEngine.shared().world.images.forEach( img => {
            if(img.src.endsWith("bullet.png")) {
                this.bulletImage = img
            }
        })
        
    }

    tick(){
        const a = this.body.GetAngle()
        const c = this.body.GetWorldCenter()
        this.body.ApplyLinearImpulse({
            x: Math.cos(a) * k.bulletSpeed,
            y: Math.sin(a) * k.bulletSpeed} , c )
    }

    draw(){
        const ctx = GameEngine.shared().world.context
        const p  = this.body.GetWorldCenter()
        const s  = 12
        const ms = s/2
        ctx.drawImage(this.bulletImage, 0, 0, s, s, 
            p.x - ms, p.y -ms, s, s)
    }
}