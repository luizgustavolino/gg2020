
import * as box2d from "box2d.ts";
import { World } from "./world";
import { Camera, g_camera } from "./b2dUtils/debugDraw";

export const hertz:number = 60.0

export class GameEngine {

    fps_frames: number  = 0
    time_last: number   = null
    fps_time: number    = 0
    fps: number         = 0

    loop(time: number) {
        
        this.time_last = this.time_last || time;
        let time_elapsed = time - this.time_last;
        this.time_last = time;

        if (time_elapsed > 1000) {
            time_elapsed = 1000;
        }
        
        this.fps_time += time_elapsed;
        this.fps_frames++;

        if (this.fps_time >= 500) {
            this.fps = (this.fps_frames * 1000) / this.fps_time;
            this.fps_frames = 0;
            this.fps_time = 0;
            document.title = this.fps.toFixed(1).toString();
        }

        if (time_elapsed > 0) {
            GameEngine.shared().tick()
            GameEngine.shared().draw()
        }
        
    }

    private static instance: GameEngine = null;
    world:World
    camera:Camera
    screen = {width:720, height: 480}

    private constructor() {
        this.world = new World()
        this.camera = g_camera
    }
    
    public static shared(): GameEngine {
        if (!GameEngine.instance) {
            GameEngine.instance = new GameEngine();
        }

        return GameEngine.instance;
    }

    boot(){
        console.log("booting engine from singleton")
    }

    tick(){
        this.world.tick()
    }

    draw() {
        // clear canvas
        const ctx = this.world.context
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        // apply camera transforms
        ctx.save()
        ctx.translate(0.5 * ctx.canvas.width, 0.5 * ctx.canvas.height)
        ctx.scale(1, -1);
        const cam = this.world.camera
        const s = 0.5 * cam.m_height / cam.m_extent
        ctx.scale(s, s)
        ctx.scale(1 / cam.m_zoom, 1 / cam.m_zoom)
        ctx.translate(-cam.m_center.x, -cam.m_center.y)

        // draw world
        this.world.draw()
        ctx.restore()

        
    }
}