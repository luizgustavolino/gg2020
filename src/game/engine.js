import { World } from "./world";
import { g_camera } from "./utils/debugDraw";
import { Joypad } from "./utils/joypad";
export var hertz = 60.0;
export var screen = { width: 720, height: 480 };
var GameEngine = /** @class */ (function () {
    function GameEngine() {
        this.fps_frames = 0;
        this.frame_count = 0;
        this.time_last = null;
        this.fps_time = 0;
        this.fps = 0;
    }
    GameEngine.shared = function () {
        if (!GameEngine.instance) {
            GameEngine.instance = new GameEngine();
        }
        return GameEngine.instance;
    };
    GameEngine.prototype.loop = function (time) {
        this.time_last = this.time_last || time;
        var time_elapsed = time - this.time_last;
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
            GameEngine.shared().tick();
            GameEngine.shared().draw();
        }
    };
    GameEngine.prototype.boot = function () {
        console.log("booting engine from singleton");
        this.world = new World();
        this.world.addRacers();
        this.camera = g_camera;
        this.joypad = new Joypad();
    };
    GameEngine.prototype.tick = function () {
        this.fps_frames++;
        this.world.tick(this.fps_frames);
        this.joypad.tick();
    };
    GameEngine.prototype.draw = function () {
        // clear canvas
        var ctx = this.world.context;
        this.world.drawBackground();
        // apply camera transforms
        ctx.save();
        ctx.translate(0.5 * ctx.canvas.width, 0.5 * ctx.canvas.height);
        ctx.scale(1, -1);
        var cam = this.world.camera;
        var s = 0.5 * cam.m_height / cam.m_extent;
        ctx.scale(s, s);
        ctx.scale(1 / cam.m_zoom, 1 / cam.m_zoom);
        ctx.translate(-cam.m_center.x, -cam.m_center.y);
        // draw background
        ctx.scale(1, -1);
        ctx.translate(0, -cam.m_height);
        ctx.globalAlpha = 0.8;
        this.world.draw("back");
        ctx.globalAlpha = 1.0;
        // draw world, char & bullets
        ctx.scale(1, -1);
        ctx.translate(0, -cam.m_height);
        //this.world.drawDebug()
        this.world.drawMe(this.fps_frames);
        this.world.drawBullets(this.fps_frames);
        // draw foreground
        ctx.scale(1, -1);
        ctx.translate(0, -cam.m_height);
        this.world.draw("front");
        ctx.restore();
    };
    GameEngine.instance = null;
    return GameEngine;
}());
export { GameEngine };
//# sourceMappingURL=engine.js.map