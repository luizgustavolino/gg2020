import { stat } from "fs"
import { throws } from "assert"
import { GameEngine } from "../engine"


export class Joypad {

    keys:KeyMap

    constructor(){
        
        document.onkeydown = function(event){
            GameEngine.shared().joypad.onkeydown(event)
        }

        document.onkeyup = function(event){
            GameEngine.shared().joypad.onkeyup(event)
        } 

        this.keys = {
            fire: new Key(68),
            accelerate: new Key(65),
            jump: new Key(87),
            break: new Key(83)
        }
    }

    tick() {
        this.keys.accelerate.tick()
        this.keys.fire.tick()
        this.keys.break.tick()
        this.keys.jump.tick()
    }

    onkeydown(event:KeyboardEvent){
        this.keys.accelerate.handle(event, "down")
        this.keys.fire.handle(event, "down")
        this.keys.break.handle(event, "down")
        this.keys.jump.handle(event, "down")
    }

    onkeyup(event:KeyboardEvent){
        this.keys.accelerate.handle(event, "up")
        this.keys.fire.handle(event, "up")
        this.keys.break.handle(event, "up")
        this.keys.jump.handle(event, "up")
    }

}

type KeyState = ("idle" | "keyDown" | "pressed" | "keyUp")

export class Key {

    state:KeyState
    next:KeyState
    dirty:boolean
    keyBinding:number

    isPressed() : boolean {
        return this.state == "pressed"
    }

    isDown() : boolean {
        return this.state == "keyDown"
    }

    constructor(code:number) {
        this.state = "idle"
        this.next = "idle"
        this.dirty = false 
        this.keyBinding = code
    }

    handle(event:KeyboardEvent, type:("down"|"up")) {

        const code = event.keyCode
        if (this.keyBinding == code){
            if (!this.dirty) {
                this.dirty = true 
                switch (this.state) {
                    case "idle":
                        if (type == "down") this.next = "keyDown"
                        break
                    case "keyDown":
                        if (type == "down") this.next = "pressed"
                        else if (type == "up") this.next = "keyUp"
                        break
                    case "pressed":
                        if (type == "up") this.next = "keyUp"
                        break
                }
            } else {
                if (type == "up") this.next = "keyUp"
            }
        }
    }

    public tick(){

        if (this.state == "keyUp" && this.next == null) {
            this.state = "idle"
        } else if (this.state == "keyDown" && this.next == null) {
            this.state = "pressed"
        } else if (this.next != null){
            this.state = this.next
        }

        this.next = null
        this.dirty = false 
    }
}

type KeyMap = {
    fire:Key,
    accelerate:Key,
    jump:Key,
    break:Key
}

export function joy(){
    return GameEngine.shared().joypad.keys
}