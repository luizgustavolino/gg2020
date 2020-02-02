import { DebugDraw, Camera, g_camera } from "./utils/debugDraw";
import * as box2d from "box2d.ts"
import { hertz } from "./engine"
import { data } from "../assets/map";
import { Point, Layer } from "./utils/map";
import { joy } from "./utils/joypad";

class ImageAsset {
    x:number
    y:number
    source:string
    tag:HTMLImageElement

    constructor(x: number, y:number, source:string, tag:HTMLImageElement) {
        this.x = x
        this.y = y
        this.source = source
        this.tag = tag
    }
}

export class World {

    world: box2d.b2World
    debugDraw:DebugDraw
    camera:Camera
    viewport:HTMLCanvasElement
    context:CanvasRenderingContext2D
    
    ground:box2d.b2Body
    me:box2d.b2Body[]

    images:HTMLImageElement[]
    assets:{
        front: ImageAsset[],
        back:  ImageAsset[]
    }

    constructor(){

        this.debugDraw = new DebugDraw()
        const gravity = new box2d.b2Vec2(0, -10)
        this.world = new box2d.b2World(gravity)
        this.world.SetAllowSleeping(true)
        this.world.SetWarmStarting(true)
        this.world.SetDebugDraw(this.debugDraw)

        this.camera = g_camera
        this.camera.m_zoom = 10

        this.viewport = <HTMLCanvasElement> document.getElementById("viewport")
        this.context = this.viewport.getContext("2d")
        this.debugDraw.m_ctx = this.context

        this.images = []
        let imgsTags =  document.querySelectorAll('img')
        imgsTags.forEach( img => this.images.push(img))

        this.assets = {back:[], front:[]}
        this.setupBoundaries()
        data.layers.forEach( l => this.getImageAssets(l, false))

        this.addMe()
    }

    private addMePartAt(x:number, y:number) : box2d.b2Body {

        const shape = new box2d.b2CircleShape();
        shape.m_radius = 20;

        const fd = new box2d.b2FixtureDef();
        fd.shape = shape;
        fd.density  = 18.0;
        fd.friction = 0.008;
  
        const bd = new box2d.b2BodyDef()
        bd.type = box2d.b2BodyType.b2_dynamicBody
        bd.position.Set(x, y)

        const body = this.world.CreateBody(bd)
        body.SetFixedRotation(true)
        body.CreateFixture(fd)
        return body

    }

    private addMe(){

        let front = this.addMePartAt(60, 200)
        let back = this.addMePartAt(20, 200)

        const jd = new box2d.b2DistanceJointDef()
        jd.Initialize(front, back,
            front.GetWorldCenter(),
            back.GetWorldCenter())
        this.world.CreateJoint(jd);
        this.me = [back, front]
    }

    private getImageAssets(layer:Layer, back:boolean){

        var b = back
        if (layer.name == "Back") {
            b = true
        } else if (layer.name == "Front") {
            b = false
        }
        
        if (layer.image != null && layer.offsetx != null && layer.offsety != null) {
            this.images.forEach( img => {
                let imageFile = img.src.split("/").pop()
                if(layer.image.endsWith(imageFile)) {
                    
                    let asset = new ImageAsset(
                        layer.offsetx, layer.offsety,
                        layer.image, img)

                    if (b) {
                        this.assets.back.push(asset)      
                    } else {
                        this.assets.front.push(asset)      
                    }   
                }
            })
        }

        if (layer.type == "group" && layer.layers != null) {
            layer.layers.forEach( l => this.getImageAssets(l, b) )
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

            if (joy().jump.isDown()) {
                const centerA = this.me[0].GetWorldCenter()
                const centerB = this.me[1].GetWorldCenter()
                this.me[0].ApplyLinearImpulse({x:0, y:400000}, centerA)
                this.me[1].ApplyLinearImpulse({x:0, y:400000}, centerB)
            }

            if (joy().break.isDown() || joy().break.isPressed()) {
                const impulseA = this.me[0].GetLinearVelocity()
                const impulseB = this.me[1].GetLinearVelocity()
                this.me[0].SetLinearVelocity({x:impulseB.x * 0.95, y:impulseA.y})
                this.me[1].SetLinearVelocity({x:impulseB.x * 0.95, y:impulseB.y})
                
            } else if (joy().accelerate.isPressed()) {
                const center = this.me[1].GetWorldCenter()
                this.me[1].ApplyLinearImpulse({x:10000, y:0}, center)
            } else if (joy().accelerate.isDown()) {
                const center = this.me[1].GetWorldCenter()
                this.me[1].ApplyLinearImpulse({x:20000, y:0}, center)
            } 
            
            this.me.forEach( body => {
                let p = body.GetPosition()
                body.SetPosition({x: p.x % max, y: p.y})
            })
        }

        if (joy().fire.isDown()) {
            this.doFire()
        }

        this.camera.m_center = this.me[0].GetPosition()
        
    }

    doFire() {

        const x = this.me[1].GetPosition().x + 30
        const y = this.me[1].GetPosition().y

        const shape = new box2d.b2CircleShape();
        shape.m_radius = 5;

        const fd = new box2d.b2FixtureDef();
        fd.shape = shape;
        fd.density  = 5.0;
        fd.friction = 0.0001;
  
        const bd = new box2d.b2BodyDef()
        bd.type = box2d.b2BodyType.b2_dynamicBody
        bd.position.Set(x, y)

        const body = this.world.CreateBody(bd)
        body.CreateFixture(fd)
        body.SetLinearVelocity({x:200, y:0})
        body.SetFixedRotation(true)

        return body
    }

    drawBackground() {
        this.images
        .filter( image => image.src.endsWith("background.png"))
        .forEach( image => this.context
            .drawImage(image, 0, 0))
        
    }

    drawDebug() {
        this.world.DrawDebugData()
    }

    drawMe(frame:number){

        this.context.save()
        this.context.resetTransform()

        const x = 720.0/2.0 + 30
        const y = 468.0/2.0
        this.context.translate(x,y)
        
        const x1 = this.me[0].GetPosition().x
        const y1 = this.me[0].GetPosition().y

        const x2 = this.me[1].GetPosition().x
        const y2 = this.me[1].GetPosition().y

        const angle = Math.atan2(y2 - y1, x2 - x1);
        this.context.rotate(-angle)
        
        const anmFrame = Math.ceil((frame/18))%4
        this.images
        .filter( image => image.src.endsWith("drivers.png"))
        .forEach( image => this.context
            .drawImage(image, 72*anmFrame, 0, 72, 72, -36, -36, 72, 72))

        this.context.restore()
    }

    draw(layer:("front"|"back")) {

        let assets:ImageAsset[]
        switch (layer) {
            case "front": assets = this.assets.front; break;
            case "back":  assets = this.assets.back; break;
        }
        const padding = 1000
        assets.filter( asset => {
            const mex = this.me[0].GetPosition().x
            return asset.x > mex - padding && asset.x < mex + padding
        }).forEach( asset => 
            this.context.drawImage(asset.tag, asset.x, asset.y)
        )
    }
}