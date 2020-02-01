import { DebugDraw, Camera, g_camera } from "./b2dUtils/debugDraw";
import * as box2d from "box2d.ts"
import { GameEngine, hertz } from "./engine";
import { runInThisContext } from "vm";
import { throws } from "assert";

export class World {

    world: box2d.b2World
    debugDraw:DebugDraw
    camera:Camera
    viewport:HTMLCanvasElement
    context:CanvasRenderingContext2D

    ground:box2d.b2Body
    me:box2d.b2Body

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

        this.setupBoundaries()
    }

    public setupBoundaries(){
        {
            const bd = new box2d.b2BodyDef()
            this.ground = this.world.CreateBody(bd)
            
            const shape = new box2d.b2EdgeShape()
            shape.Set(new box2d.b2Vec2(-40.0, 0.0), new box2d.b2Vec2(10000.0, 0.0))
            this.ground.CreateFixture(shape, 0.0)
        }


        const shape = new box2d.b2CircleShape();
        shape.m_radius = 5.0;

        const fd = new box2d.b2FixtureDef();
        fd.shape = shape;
        fd.density = 5.0;
        fd.friction = 0.1;
  
        for (let i = 0; i < 10; ++i) {
          const bd = new box2d.b2BodyDef()
          bd.type = box2d.b2BodyType.b2_dynamicBody
          bd.position.Set(10.0 + 1.0 * i, 20.25 * i)
          const body = this.world.CreateBody(bd)
          body.CreateFixture(fd)
          this.me = body
        }
    }

    public tick(){
        this.world.Step( 1.0/hertz*2, 8*2, 3*2, 3*2)
        this.camera.m_center = this.me.GetPosition()
    }

    draw() {
        this.context.clearRect(0,0,720,480)
        this.world.DrawDebugData()
    }
}