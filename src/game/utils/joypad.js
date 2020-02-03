import { GameEngine } from "../engine";
var Joypad = /** @class */ (function () {
    function Joypad() {
        document.onkeydown = function (event) {
            GameEngine.shared().joypad.onkeydown(event);
        };
        document.onkeyup = function (event) {
            GameEngine.shared().joypad.onkeyup(event);
        };
        this.keys = {
            fire: new Key(68),
            accelerate: new Key(65),
            jump: new Key(87),
            break: new Key(83)
        };
    }
    Joypad.prototype.tick = function () {
        this.keys.accelerate.tick();
        this.keys.fire.tick();
        this.keys.break.tick();
        this.keys.jump.tick();
    };
    Joypad.prototype.onkeydown = function (event) {
        this.keys.accelerate.handle(event, "down");
        this.keys.fire.handle(event, "down");
        this.keys.break.handle(event, "down");
        this.keys.jump.handle(event, "down");
    };
    Joypad.prototype.onkeyup = function (event) {
        this.keys.accelerate.handle(event, "up");
        this.keys.fire.handle(event, "up");
        this.keys.break.handle(event, "up");
        this.keys.jump.handle(event, "up");
    };
    return Joypad;
}());
export { Joypad };
var Key = /** @class */ (function () {
    function Key(code) {
        this.state = "idle";
        this.next = "idle";
        this.dirty = false;
        this.keyBinding = code;
    }
    Key.prototype.isPressed = function () {
        return this.state == "pressed";
    };
    Key.prototype.isDown = function () {
        return this.state == "keyDown";
    };
    Key.prototype.handle = function (event, type) {
        var code = event.keyCode;
        if (this.keyBinding == code) {
            if (!this.dirty) {
                this.dirty = true;
                switch (this.state) {
                    case "idle":
                        if (type == "down")
                            this.next = "keyDown";
                        break;
                    case "keyDown":
                        if (type == "down")
                            this.next = "pressed";
                        else if (type == "up")
                            this.next = "keyUp";
                        break;
                    case "pressed":
                        if (type == "up")
                            this.next = "keyUp";
                        break;
                }
            }
            else {
                if (type == "up")
                    this.next = "keyUp";
            }
        }
    };
    Key.prototype.tick = function () {
        if (this.state == "keyUp" && this.next == null) {
            this.state = "idle";
        }
        else if (this.state == "keyDown" && this.next == null) {
            this.state = "pressed";
        }
        else if (this.next != null) {
            this.state = this.next;
        }
        this.next = null;
        this.dirty = false;
    };
    return Key;
}());
export { Key };
export function joy() {
    return GameEngine.shared().joypad.keys;
}
//# sourceMappingURL=joypad.js.map