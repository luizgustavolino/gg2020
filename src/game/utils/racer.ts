import { b2Body, b2CircleShape, b2FixtureDef, b2BodyDef, b2BodyType, b2DistanceJointDef, b2Vec2 } from "box2d.ts";
import { GameEngine } from "../engine";
import * as k from "./../constants"
import { Bullet } from "./bullet";
import { throws } from "assert";

export class Racer {

    isPlayer:boolean
    front:b2Body
    back:b2Body
    context:CanvasRenderingContext2D
    image:HTMLImageElement
    skin:number

    constructor(s:{isPlayer:boolean, x:number, y:number, skin:number}){

        this.isPlayer = s.isPlayer
        this.front = this.addPartAt(s.x, s.y)
        this.back  = this.addPartAt(s.x - k.distanceBetweenMeBodies, s.y)
        this.skin = s.skin

        const jd = new b2DistanceJointDef()
        jd.Initialize(this.front, this.back, 
            this.front.GetWorldCenter(),
            this.back.GetWorldCenter())

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
        const x1 = this.back.GetPosition().x
        const y1 = this.back.GetPosition().y
        const x2 = this.front.GetPosition().x
        const y2 = this.front.GetPosition().y
        return new b2Vec2((x1 + x2)/2.0,(y1+y2)/2.0)
    }

    private addPartAt(x:number, y:number) : b2Body {

        const shape = new b2CircleShape();
        shape.m_radius = 20;

        const fd = new b2FixtureDef();
        fd.shape = shape;
        fd.density  = 10.0;
        fd.friction = 0.001;
  
        const bd = new b2BodyDef()
        bd.type = b2BodyType.b2_dynamicBody
        bd.position.Set(x, y)

        const world = GameEngine.shared().world.world
        const body = world.CreateBody(bd)

        body.SetFixedRotation(true)
        body.CreateFixture(fd)
        return body

    }

    angle() : number {
        const x1 = this.back.GetPosition().x
        const y1 = this.back.GetPosition().y
        const x2 = this.front.GetPosition().x
        const y2 = this.front.GetPosition().y
        return Math.atan2(y2 - y1, x2 - x1)
    }

    tick(frame:number) {

        this.clampLinear()

        let pA = this.front.GetPosition()
        let pB = this.back.GetPosition()

        if (pA.x > k.mapLimitX) {
            this.front.SetPosition({x:0, y:pA.y})
            this.back.SetPosition({x:-k.distanceBetweenMeBodies, y:pB.y})
        }

        if (!this.isPlayer){
            this.accelerate(1.1)
        }
    }

    draw(frame){

        const anmFrame = Math.ceil((frame/18))%4
        let mid = this.front.GetWorldCenter()
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
        const center = this.front.GetWorldCenter()
        this.front.ApplyLinearImpulse({x:k.baseImpulse * multiplier, y:0}, center)
    }

    clampLinear(){
        const current = this.front.GetLinearVelocity()
        if (current.x > k.maxImpulse) {
            this.front.SetLinearVelocity({x:k.maxImpulse, y:current.y})
            this.back.SetLinearVelocity({x:k.maxImpulse*0.8, y:current.y})
        }
    }

    jump() {
        const centerA = this.back.GetWorldCenter() 
        const centerB = this.front.GetWorldCenter()
        this.back.ApplyLinearImpulse({x: k.jumpImpulseX, y: k.jumpImpulseY}, centerA)
        this.front.ApplyLinearImpulse({x: k.jumpImpulseX, y: k.jumpImpulseY}, centerB)
    }

        
    break() {
        const impulseA = this.back.GetLinearVelocity()
        const impulseB = this.front.GetLinearVelocity()
        this.back.SetLinearVelocity({x:impulseB.x * 0.95, y:impulseA.y})
        this.front.SetLinearVelocity({x:impulseB.x * 0.95, y:impulseB.y})
    }

    fire() : Bullet {
        const a = this.angle()
        const x = this.front.GetPosition().x + Math.cos(a) * 30
        const y = this.front.GetPosition().y + Math.sin(a) * 30
        return new Bullet({angle:a, x:x, y:y})
    }

}