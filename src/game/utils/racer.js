import { b2CircleShape, b2FixtureDef, b2BodyDef, b2BodyType, b2DistanceJointDef, b2Vec2 } from "box2d.ts";
import { GameEngine } from "../engine";
import * as k from "./../constants";
import { Bullet } from "./bullet";
var Racer = /** @class */ (function () {
    function Racer(s) {
        var _this = this;
        this.isPlayer = s.isPlayer;
        this.front = this.addPartAt(s.x, s.y);
        this.back = this.addPartAt(s.x - k.distanceBetweenMeBodies, s.y);
        this.skin = s.skin;
        var jd = new b2DistanceJointDef();
        jd.Initialize(this.front, this.back, this.front.GetWorldCenter(), this.back.GetWorldCenter());
        var world = GameEngine.shared().world.world;
        world.CreateJoint(jd);
        this.context = GameEngine.shared().world.context;
        GameEngine.shared().world.images.forEach(function (img) {
            if (img.src.endsWith("drivers.png")) {
                _this.image = img;
            }
        });
    }
    Racer.prototype.center = function () {
        var x1 = this.back.GetPosition().x;
        var y1 = this.back.GetPosition().y;
        var x2 = this.front.GetPosition().x;
        var y2 = this.front.GetPosition().y;
        return new b2Vec2((x1 + x2) / 2.0, (y1 + y2) / 2.0);
    };
    Racer.prototype.addPartAt = function (x, y) {
        var shape = new b2CircleShape();
        shape.m_radius = 20;
        var fd = new b2FixtureDef();
        fd.shape = shape;
        fd.density = 10.0;
        fd.friction = 0.001;
        var bd = new b2BodyDef();
        bd.type = b2BodyType.b2_dynamicBody;
        bd.position.Set(x, y);
        var world = GameEngine.shared().world.world;
        var body = world.CreateBody(bd);
        body.SetFixedRotation(true);
        body.CreateFixture(fd);
        return body;
    };
    Racer.prototype.angle = function () {
        var x1 = this.back.GetPosition().x;
        var y1 = this.back.GetPosition().y;
        var x2 = this.front.GetPosition().x;
        var y2 = this.front.GetPosition().y;
        return Math.atan2(y2 - y1, x2 - x1);
    };
    Racer.prototype.tick = function (frame) {
        this.clampLinear();
        var pA = this.front.GetPosition();
        var pB = this.back.GetPosition();
        if (pA.x > k.mapLimitX) {
            this.front.SetPosition({ x: 0, y: pA.y });
            this.back.SetPosition({ x: -k.distanceBetweenMeBodies, y: pB.y });
        }
        if (!this.isPlayer) {
            this.accelerate(1.1);
        }
    };
    Racer.prototype.draw = function (frame) {
        var anmFrame = Math.ceil((frame / 18)) % 4;
        var mid = this.front.GetWorldCenter();
        var midX = mid.x - 20;
        this.context.save();
        this.context.translate(mid.x, mid.y);
        this.context.rotate(this.angle());
        var fs = 40;
        this.context.scale(1, -1);
        this.context.translate(0, -fs);
        this.context.drawImage(this.image, 72 * anmFrame, 72 * this.skin, 72, 72, -(fs / 2), fs / 2, fs, fs);
        this.context.restore();
    };
    Racer.prototype.accelerate = function (multiplier) {
        var center = this.front.GetWorldCenter();
        this.front.ApplyLinearImpulse({ x: k.baseImpulse * multiplier, y: 0 }, center);
    };
    Racer.prototype.clampLinear = function () {
        var current = this.front.GetLinearVelocity();
        if (current.x > k.maxImpulse) {
            this.front.SetLinearVelocity({ x: k.maxImpulse, y: current.y });
            this.back.SetLinearVelocity({ x: k.maxImpulse * 0.8, y: current.y });
        }
    };
    Racer.prototype.jump = function () {
        var centerA = this.back.GetWorldCenter();
        var centerB = this.front.GetWorldCenter();
        this.back.ApplyLinearImpulse({ x: k.jumpImpulseX, y: k.jumpImpulseY }, centerA);
        this.front.ApplyLinearImpulse({ x: k.jumpImpulseX, y: k.jumpImpulseY }, centerB);
    };
    Racer.prototype.break = function () {
        var impulseA = this.back.GetLinearVelocity();
        var impulseB = this.front.GetLinearVelocity();
        this.back.SetLinearVelocity({ x: impulseB.x * 0.95, y: impulseA.y });
        this.front.SetLinearVelocity({ x: impulseB.x * 0.95, y: impulseB.y });
    };
    Racer.prototype.fire = function () {
        var a = this.angle();
        var x = this.front.GetPosition().x + Math.cos(a) * 30;
        var y = this.front.GetPosition().y + Math.sin(a) * 30;
        return new Bullet({ angle: a, x: x, y: y });
    };
    return Racer;
}());
export { Racer };
//# sourceMappingURL=racer.js.map