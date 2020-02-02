
import * as _ from 'lodash'
import { GameEngine } from './game/engine'

function loop(time) {
    window.requestAnimationFrame(loop);
    GameEngine.shared().loop(time);
}

GameEngine.shared().boot()
window.requestAnimationFrame(loop);