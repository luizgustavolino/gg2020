import { b2CircleShape, b2FixtureDef, b2BodyDef, b2BodyType } from "box2d.ts";
import { GameEngine } from "../engine";
import * as k from "./../constants";
var Bullet = /** @class */ (function () {
    function Bullet(position) {
        var _this = this;
        var shape = new b2CircleShape();
        shape.m_radius = 4;
        var fd = new b2FixtureDef();
        fd.shape = shape;
        fd.density = 5.0;
        fd.friction = 0.0001;
        var bd = new b2BodyDef();
        bd.type = b2BodyType.b2_dynamicBody;
        bd.position.Set(position.x, position.y);
        var world = GameEngine.shared().world.world;
        this.body = world.CreateBody(bd);
        this.body.CreateFixture(fd);
        this.body.SetAngle(position.angle);
        this.body.SetFixedRotation(true);
        var linearX = Math.cos(position.angle) * 4000;
        var linearY = Math.cos(position.angle) * 4000;
        this.body.SetLinearVelocity({ x: linearX, y: linearY });
        GameEngine.shared().world.images.forEach(function (img) {
            if (img.src.endsWith("bullet.png")) {
                _this.bulletImage = img;
            }
        });
    }
    Bullet.prototype.tick = function () {
        var a = this.body.GetAngle();
        var c = this.body.GetWorldCenter();
        this.body.ApplyLinearImpulse({
            x: Math.cos(a) * k.bulletSpeed,
            y: Math.sin(a) * k.bulletSpeed
        }, c);
    };
    Bullet.prototype.draw = function () {
        var ctx = GameEngine.shared().world.context;
        var p = this.body.GetWorldCenter();
        var s = 12;
        var ms = s / 2;
        ctx.drawImage(this.bulletImage, 0, 0, s, s, p.x - ms, p.y - ms, s, s);
    };
    return Bullet;
}());
export { Bullet };
//# sourceMappingURL=bullet.js.map