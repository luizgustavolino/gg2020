import { b2Body, b2CircleShape, b2FixtureDef, b2BodyDef, b2BodyType, b2DistanceJointDef, b2Vec2 } from "box2d.ts";
import { GameEngine } from "../engine";
import * as k from "./../constants"
import { Bullet } from "./bullet";
import { throws } from "assert";

export class Racer {

    isPlayer:boolean
    bA:b2Body
    bB:b2Body

    bodies() : {back:b2Body, front:b2Body} {
        return this.bA.GetPosition().x > this.bB.GetPosition().x
            ? {back:this.bB, front:this.bA} :
            {back:this.bA, front:this.bB}
    }

    context:CanvasRenderingContext2D
    image:HTMLImageElement
    skin:number

    constructor(s:{isPlayer:boolean, x:number, y:number, skin:number}){

        this.isPlayer = s.isPlayer
        this.bA = this.addPartAt(s.x, s.y)
        this.bB = this.addPartAt(s.x - k.distanceBetweenMeBodies, s.y)
        this.skin = s.skin

        const jd = new b2DistanceJointDef()
        jd.Initialize(this.bA, this.bB, 
            this.bA.GetWorldCenter(),
            this.bB.GetWorldCenter())

        const world = GameEngine.shared().world.world
        world.CreateJoint(jd);

        this.context = GameEngine.shared().world.context
        GameEngine.shared().world.images.forEach( img => {
            if (img.src.endsWith("drivers.png")) {
                this.image = img
            }
        })
    }

    center() : b2Vec2 {
        const bf = this.bodies()
        const x1 = bf.back.GetWorldCenter().x
        const y1 = bf.back.GetWorldCenter().y
        const x2 = bf.front.GetWorldCenter().x
        const y2 = bf.front.GetWorldCenter().y
        return new b2Vec2((x1 + x2)/2.0,(y1+y2)/2.0)
    }

    private addPartAt(x:number, y:number) : b2Body {

        const shape = new b2CircleShape();
        shape.m_radius = k.racerBodySize;

        const fd = new b2FixtureDef();
        fd.shape = shape;
        
        fd.filter.categoryBits  = k.colide.racers
        fd.filter.maskBits      = k.colide.scenery | k.colide.bullets

        fd.density      = 0.95
        fd.friction     = 0.02
        fd.restitution  = 0.32
  
        const bd = new b2BodyDef()
        bd.type = b2BodyType.b2_dynamicBody
        bd.position.Set(x, y)

        const world = GameEngine.shared().world.world

        const body = world.CreateBody(bd)
        body.SetFixedRotation(true)
        body.CreateFixture(fd)

        return body

    }

    private lastAngle:number
    angle() : number {

        const bf = this.bodies()
        const x1 = bf.back.GetPosition().x
        const y1 = bf.back.GetPosition().y
        const x2 = bf.front.GetPosition().x
        const y2 = bf.front.GetPosition().y

        const atan = Math.atan2(y2 - y1, x2 - x1)
        const last = this.lastAngle || 0

        let newest:number
        if (last > atan) newest = last + (atan - last)/k.angleDecreaseRate
        else newest = last - (last - atan)/k.angleDecreaseRate
         
        if (newest > 0.72) newest = 0.72
        else if (newest < -0.72) newest = -0.72
        this.lastAngle = newest
        return newest
    }

    tick(frame:number) {

        this.clampLinear()

        let pA = this.bA.GetPosition()
        let pB = this.bB.GetPosition()

        if (pA.x > k.mapLimitX) {
            this.bA.SetPosition({x:0, y:pA.y})
            this.bB.SetPosition({x:-k.distanceBetweenMeBodies, y:pB.y})
        }

        if (!this.isPlayer){
            const iaAcel = 1.0 + Math.sin(frame/200.0) * 1.0
            this.accelerate(iaAcel)
        }
    }

    draw(frame){

        const linearX   = Math.abs(this.bodies().front.GetLinearVelocity().x)
        const speed     = 1 - linearX/k.engineMaxImpulse
        const anmFrame  = Math.ceil(Math.abs((frame / 5 + (20 * speed)))) % 4

        if(this.isPlayer) console.log(speed)
        
        let mid = this.center()
        let midX = mid.x - 20
        
        this.context.save()
        this.context.translate(mid.x, mid.y)
        this.context.rotate(this.angle())

        const fs = 40

        this.context.scale(1,-1)
        this.context.translate(0, -fs)

        this.context.drawImage(
            this.image, 72*anmFrame, 72 * this.skin, 72, 72, 
            -(fs/2), fs/2, fs, fs)

        this.context.restore()

    }

    accelerate(multiplier:number) {
        const bf = this.bodies()
        let speed = k.baseImpulse * multiplier
        bf.back.ApplyLinearImpulse({x:speed, y:0}, bf.back.GetWorldCenter())
        bf.front.ApplyLinearImpulse({x:speed, y:0}, bf.front.GetWorldCenter())
    }

    clampLinear(){
        let bf = this.bodies()
        const current = bf.front.GetLinearVelocity()
        if (current.x > k.maxImpulse) {
            bf.front.SetLinearVelocity({x:k.maxImpulse, y:current.y})
            bf.back.SetLinearVelocity({x:k.maxImpulse, y:current.y})
        }
    }

    jump() {
        let bf = this.bodies()
        const centerA = bf.back.GetWorldCenter() 
        const centerB = bf.front.GetWorldCenter()
        bf.back.ApplyLinearImpulse({x: k.jumpImpulseX, y: k.jumpImpulseY}, centerA)
        bf.front.ApplyLinearImpulse({x: k.jumpImpulseX, y: k.jumpImpulseY}, centerB)
    }

        
    break() {
        let bf = this.bodies()
        const impulseA = bf.back.GetLinearVelocity()
        const impulseB = bf.front.GetLinearVelocity()
        bf.back.SetLinearVelocity({x:impulseB.x * 0.98, y:impulseB.y})
        bf.front.SetLinearVelocity({x:impulseB.x * 0.98, y:impulseB.y})
    }

    fire() : Bullet {
        const a = this.angle()
        let front = this.bodies().front
        const x = front.GetPosition().x + Math.cos(a) * 30
        const y = front.GetPosition().y + Math.sin(a) * 30
        return new Bullet({angle:a, x:x, y:y})
    }

}