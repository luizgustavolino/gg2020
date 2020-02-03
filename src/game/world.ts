import { DebugDraw, Camera, g_camera } from "./utils/debugDraw";
import * as box2d from "box2d.ts"
import { hertz } from "./engine"
import { data } from "../assets/map";
import { Point, Layer } from "./utils/map";
import { joy } from "./utils/joypad";
import { Bullet } from "./utils/bullet";
import * as k from "./constants"
import { Racer } from "./utils/racer";
import { Touch } from "./utils/touchpoint";
import { b2FixtureDef } from "box2d.ts";
import { Particles } from "./particles/particles";

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

export let prts:Particles = null

export class World {

    world: box2d.b2World
    debugDraw:DebugDraw
    camera:Camera
    viewport:HTMLCanvasElement
    context:CanvasRenderingContext2D
    touch:Touch
    partiles:Particles

    ground:box2d.b2Body
    player:Racer
    enemies:Racer[]
    bullets:Bullet[]

    images:HTMLImageElement[]
    assets:{
        front: ImageAsset[],
        back:  ImageAsset[]
    }

    constructor(){

        this.debugDraw = new DebugDraw()
        const gravity = new box2d.b2Vec2(0.0, -8.0)
        this.world = new box2d.b2World(gravity)
        this.world.SetAllowSleeping(true)
        this.world.SetWarmStarting(true)
        this.world.SetDebugDraw(this.debugDraw)

        this.touch = new Touch()
        this.world.SetContactListener(this.touch)

        this.partiles = new Particles()
        prts = this.partiles

        this.camera = g_camera
        this.camera.m_zoom = 10

        this.viewport = <HTMLCanvasElement> document.getElementById("viewport")
        this.context = this.viewport.getContext("2d")
        this.debugDraw.m_ctx = this.context

        this.bullets = []
        this.images = []
        
        let imgsTags =  document.querySelectorAll('img')
        imgsTags.forEach( img => this.images.push(img))

        this.assets = {back:[], front:[]}

        this.setupBoundaries()
        data.layers.forEach( l => this.getImageAssets(l, false))
    }

    addRacers(){
        this.player = new Racer({isPlayer: true, x: 32, y: 544, skin: 0})

        this.enemies =[
            new Racer({isPlayer: false, x: 32, y: 708, skin: 1}),
            new Racer({isPlayer: false, x: 32, y: 396, skin: 2}),
            new Racer({isPlayer: false, x: 32, y: 236, skin: 3})
        ]
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

        const fd = new b2FixtureDef();
        fd.shape = shape;
        fd.friction = 0.0;

        fd.filter.categoryBits  = k.colide.scenery
        fd.filter.maskBits      = k.colide.racers | k.colide.bullets

        bd.CreateFixture(fd)
    }

    public tick(frame){

        let max = k.mapLimitX
        
        for(var i = 0 ; i < 3; i++) {

            this.world.Step( 1.0/hertz*3, 8, 3, 3)

            if (joy().jump.isDown()) {
                this.player.jump()
            } 

            if (joy().break.isDown() || joy().break.isPressed()) {
                this.player.break()
            } else if (joy().accelerate.isPressed()) {
                this.player.accelerate(1.0)
            } else if (joy().accelerate.isDown()) {
                this.player.accelerate(k.firstAcellMultiplier)
            } 
        }

        this.player.tick(frame)
        this.enemies.forEach( e => e.tick(frame))
        this.partiles.tick(frame)

        this.bullets.forEach(bullet => bullet.tick())
        if (joy().fire.isDown()) {
            this.bullets.push(this.player.fire())
        }

        this.camera.m_center = this.player.center()
        
    }

    drawBackground() {
        this.images
        .filter( image => image.src.endsWith("background.png"))
        .forEach( image => this.context
            .drawImage(image, 0, 0))
        
    }

    meAngle():number {
        return this.player.angle()
    }

    drawDebug() {
        this.world.DrawDebugData()
    }

    drawRacers(frame:number){
        this.enemies.forEach(e => e.draw(frame))
        this.player.draw(frame)
    }

    drawBullets(frame:number){
        this.bullets.forEach( b => b.draw())
        this.partiles.draw(frame)
    }

    draw(layer:("front"|"back")) {

        let assets:ImageAsset[]
        switch (layer) {
            case "front": assets = this.assets.front; break;
            case "back":  assets = this.assets.back; break;
        }

        assets = assets.sort( (a,b) => a.x - b.x )
        
        const padding = k.screenPadding
        const mex = this.player.center().x

        assets.filter( asset => {    
            return asset.x > mex - padding && asset.x < mex + padding
        }).forEach( asset => {
            this.context.drawImage(asset.tag, asset.x, asset.y)
        })

        assets.filter( asset => {
            return asset.x > - padding &&  mex < padding
        }).forEach( asset => {
            this.context.drawImage(asset.tag, asset.x - k.mapLimitX, asset.y)
        })

        assets.filter( asset => {
            return asset.x < padding && mex > (k.mapLimitX - padding)
        }).forEach( asset => {
            this.context.drawImage(asset.tag, k.mapLimitX + asset.x, asset.y)
        })
    }
}

