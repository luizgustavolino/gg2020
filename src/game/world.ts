import { DebugDraw, Camera, g_camera } from "./b2dUtils/debugDraw";
import * as box2d from "box2d.ts"
import { hertz } from "./engine"
import { data } from "../assets/map";
import { ObjectLayer, Point, Layer } from "./map";

export class World {

    world: box2d.b2World
    debugDraw:DebugDraw
    camera:Camera
    viewport:HTMLCanvasElement
    context:CanvasRenderingContext2D

    ground:box2d.b2Body
    me:box2d.b2Body[]

    constructor(){

        this.debugDraw = new DebugDraw()
        const gravity = new box2d.b2Vec2(0, -10)
        this.world = new box2d.b2World(gravity)
        this.world.SetAllowSleeping(true)
        this.world.SetWarmStarting(true)
        this.world.SetDebugDraw(this.debugDraw)
        this.camera = g_camera

        this.camera.m_zoom = 12

        this.viewport = <HTMLCanvasElement> document.getElementById("viewport")
        this.context = this.viewport.getContext("2d")
        this.debugDraw.m_ctx = this.context

        this.setupBoundaries()
        data.layers.forEach( l => this.getImageAssets(l))
        this.addMe()
    }

    private addMePartAt(x:number, y:number) : box2d.b2Body {

        const shape = new box2d.b2CircleShape();
        shape.m_radius = 20;

        const fd = new box2d.b2FixtureDef();
        fd.shape = shape;
        fd.density  = 1.0;
        fd.friction = 0.001;
  
        const bd = new box2d.b2BodyDef()
        bd.type = box2d.b2BodyType.b2_dynamicBody
        bd.position.Set(x, y)

        const body = this.world.CreateBody(bd)
        body.CreateFixture(fd)
        return body

    }

    private addMe(){

        let front = this.addMePartAt(100,200)
        let back = this.addMePartAt(70,200)

        const jd = new box2d.b2DistanceJointDef()
        jd.Initialize(front, back,
            front.GetWorldCenter(),
            back.GetWorldCenter())
        this.world.CreateJoint(jd);
        this.me = [back, front]
    }

    private getImageAssets(layer:Layer){
        if (layer.image != null) {
            console.log("name: " + layer.image)
        }

        if (layer.type == "group" && layer.layers != null) {
            layer.layers.forEach( l => this.getImageAssets(l) )
        }
    }

    private setupBoundaries(){

        data.layers.forEach( layer => {

            if (layer.objects == null) {
                return
            }

            layer.objects.forEach( object => {
                
                let a:Point = object.polygon[0]
                let b:Point = null

                object.polygon.forEach( point => {
                    b = a
                    a = point
                    if (a != null && b != null) {
                        this.addFixture(
                            a.x + object.x, a.y + object.y,
                            b.x + object.x, b.y + object.y)
                    }
                })

                b = object.polygon[0]
                this.addFixture(
                    a.x + object.x, a.y + object.y,
                    b.x + object.x, b.y + object.y)
            })
        })
    }

    private addFixture(ax:number, ay:number, bx:number, by:number) {
        const bdf = new box2d.b2BodyDef()
        let bd = this.world.CreateBody(bdf)
        const shape = new box2d.b2EdgeShape()
        shape.Set(
            new box2d.b2Vec2(ax, screen.height - ay),
            new box2d.b2Vec2(bx, screen.height - by))
        bd.CreateFixture(shape, 0.0)
    }

    public tick(){
        let max = 14080
        
        for(var i = 0 ; i < 3; i++) {

            this.world.Step( 1.0/hertz*2, 16, 6, 6)
            this.me[1].ApplyLinearImpulse({x:3000, y:0}, this.me[1].GetWorldCenter())

            this.me.forEach( body => {
                let p = body.GetPosition()
                body.SetPosition({x: p.x % max, y: p.y})
            })
        }

        this.camera.m_center = this.me[0].GetPosition()
        
    }

    draw() {
        this.context.clearRect(0,0,720,480)
        this.world.DrawDebugData()
    }
}