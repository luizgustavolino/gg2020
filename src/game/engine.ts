
import { World } from "./world";
import { Camera, g_camera } from "./utils/debugDraw";
import { Joypad } from "./utils/joypad";

export const hertz:number = 60.0
export const gamescreen = {width:720, height: 480}

export class GameEngine {

    private static instance: GameEngine = null;

    world:World
    camera:Camera
    joypad:Joypad

    private constructor() {
        
    }
    
    public static shared(): GameEngine {
        if (!GameEngine.instance) {
            GameEngine.instance = new GameEngine();
        }

        return GameEngine.instance;
    }

    private fps_frames: number  = 0
    private frame_count: number = 0
    private time_last: number   = null
    private fps_time: number    = 0
    private fps: number         = 0

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

    boot(){
        console.log("booting engine from singleton")
        this.world = new World()
        this.world.addRacers()
        this.camera = g_camera
        this.joypad = new Joypad()
    }

    canvasScale() : number {
        return window.devicePixelRatio
    }

    tick(){
        this.frame_count++
        this.world.tick(this.frame_count)
        this.joypad.tick()
    }

    draw() {

        // clear canvas
        const ctx = this.world.context
        this.world.drawBackground()

        // apply camera transforms
        ctx.save()

        ctx.translate(0.5 * ctx.canvas.width, 0.5 * ctx.canvas.height)
        ctx.scale(1, -1);

        const cam = this.world.camera
        const s = 0.5 * cam.m_height / cam.m_extent
        ctx.scale(s, s)
        ctx.scale(1 / cam.m_zoom, 1 / cam.m_zoom)
        ctx.translate(-cam.m_center.x, -cam.m_center.y)

        // draw background
        ctx.scale(1, -1)
        ctx.translate(0, -cam.m_height)

        ctx.globalAlpha = 0.8
        this.world.draw("back")
        ctx.globalAlpha = 1.0
        
        // draw world, char & bullets
        ctx.scale(1, -1)
        ctx.translate(0, -cam.m_height)
 
        //this.world.drawDebug() 
        this.world.drawBullets(this.frame_count)
        this.world.drawParticles(this.frame_count, {even:true, odd:false})
        this.world.drawRacers(this.frame_count)
        this.world.drawParticles(this.frame_count, {even:false, odd:true})

        // draw foreground
        ctx.scale(1, -1)
        ctx.translate(0, -cam.m_height)
        this.world.draw("front")

        ctx.restore()
    }
}