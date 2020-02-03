import { DebugDraw, g_camera } from "./utils/debugDraw";
import * as box2d from "box2d.ts";
import { hertz } from "./engine";
import { data } from "../assets/map";
import { joy } from "./utils/joypad";
import * as k from "./constants";
import { Racer } from "./utils/racer";
var ImageAsset = /** @class */ (function () {
    function ImageAsset(x, y, source, tag) {
        this.x = x;
        this.y = y;
        this.source = source;
        this.tag = tag;
    }
    return ImageAsset;
}());
var World = /** @class */ (function () {
    function World() {
        var _this = this;
        this.debugDraw = new DebugDraw();
        var gravity = new box2d.b2Vec2(0, -10);
        this.world = new box2d.b2World(gravity);
        this.world.SetAllowSleeping(true);
        this.world.SetWarmStarting(true);
        this.world.SetDebugDraw(this.debugDraw);
        this.camera = g_camera;
        this.camera.m_zoom = 10;
        this.viewport = document.getElementById("viewport");
        this.context = this.viewport.getContext("2d");
        this.debugDraw.m_ctx = this.context;
        this.bullets = [];
        this.images = [];
        var imgsTags = document.querySelectorAll('img');
        imgsTags.forEach(function (img) { return _this.images.push(img); });
        this.assets = { back: [], front: [] };
        this.setupBoundaries();
        data.layers.forEach(function (l) { return _this.getImageAssets(l, false); });
    }
    World.prototype.addRacers = function () {
        this.player = new Racer({ isPlayer: true, x: 32, y: 544, skin: 0 });
        this.enemies = [
            new Racer({ isPlayer: false, x: 32, y: 708, skin: 1 }),
            new Racer({ isPlayer: false, x: 32, y: 396, skin: 2 }),
            new Racer({ isPlayer: false, x: 32, y: 236, skin: 3 })
        ];
    };
    World.prototype.getImageAssets = function (layer, back) {
        var _this = this;
        var b = back;
        if (layer.name == "Back") {
            b = true;
        }
        else if (layer.name == "Front") {
            b = false;
        }
        if (layer.image != null && layer.offsetx != null && layer.offsety != null) {
            this.images.forEach(function (img) {
                var imageFile = img.src.split("/").pop();
                if (layer.image.endsWith(imageFile)) {
                    var asset = new ImageAsset(layer.offsetx, layer.offsety, layer.image, img);
                    if (b) {
                        _this.assets.back.push(asset);
                    }
                    else {
                        _this.assets.front.push(asset);
                    }
                }
            });
        }
        if (layer.type == "group" && layer.layers != null) {
            layer.layers.forEach(function (l) { return _this.getImageAssets(l, b); });
        }
    };
    World.prototype.setupBoundaries = function () {
        var _this = this;
        data.layers.forEach(function (layer) {
            if (layer.objects == null) {
                return;
            }
            layer.objects.forEach(function (object) {
                var a = object.polygon[0];
                var b = null;
                object.polygon.forEach(function (point) {
                    b = a;
                    a = point;
                    if (a != null && b != null) {
                        _this.addFixture(a.x + object.x, a.y + object.y, b.x + object.x, b.y + object.y);
                    }
                });
                b = object.polygon[0];
                _this.addFixture(a.x + object.x, a.y + object.y, b.x + object.x, b.y + object.y);
            });
        });
    };
    World.prototype.addFixture = function (ax, ay, bx, by) {
        var bdf = new box2d.b2BodyDef();
        var bd = this.world.CreateBody(bdf);
        var shape = new box2d.b2EdgeShape();
        shape.Set(new box2d.b2Vec2(ax, screen.height - ay), new box2d.b2Vec2(bx, screen.height - by));
        bd.CreateFixture(shape, 0.0);
    };
    World.prototype.tick = function (frame) {
        var max = k.mapLimitX;
        for (var i = 0; i < 3; i++) {
            this.world.Step(1.0 / hertz * 2, 16, 6, 6);
            if (joy().break.isDown() || joy().break.isPressed()) {
                this.player.break();
            }
            else if (joy().jump.isDown()) {
                this.player.jump();
            }
            else if (joy().accelerate.isPressed()) {
                this.player.accelerate(1.0);
            }
            else if (joy().accelerate.isDown()) {
                this.player.accelerate(k.firstAcellMultiplier);
            }
        }
        this.player.tick(frame);
        this.enemies.forEach(function (e) { return e.tick(frame); });
        this.bullets.forEach(function (bullet) { return bullet.tick(); });
        if (joy().fire.isDown()) {
            this.bullets.push(this.player.fire());
        }
        this.camera.m_center = this.player.center();
    };
    World.prototype.drawBackground = function () {
        var _this = this;
        this.images
            .filter(function (image) { return image.src.endsWith("background.png"); })
            .forEach(function (image) { return _this.context
            .drawImage(image, 0, 0); });
    };
    World.prototype.meAngle = function () {
        return this.player.angle();
    };
    World.prototype.drawDebug = function () {
        this.world.DrawDebugData();
    };
    World.prototype.drawMe = function (frame) {
        this.player.draw(frame);
        this.enemies.forEach(function (e) { return e.draw(frame); });
    };
    World.prototype.drawBullets = function (frame) {
        this.bullets.forEach(function (b) { return b.draw(); });
    };
    World.prototype.draw = function (layer) {
        var _this = this;
        var assets;
        switch (layer) {
            case "front":
                assets = this.assets.front;
                break;
            case "back":
                assets = this.assets.back;
                break;
        }
        var padding = k.screenPadding;
        var mex = this.player.center().x;
        assets.filter(function (asset) {
            return asset.x > mex - padding && asset.x < mex + padding;
        }).forEach(function (asset) {
            _this.context.drawImage(asset.tag, asset.x, asset.y);
        });
        assets.filter(function (asset) {
            return asset.x > -padding && mex < padding;
        }).forEach(function (asset) {
            _this.context.drawImage(asset.tag, asset.x - k.mapLimitX, asset.y);
        });
        assets.filter(function (asset) {
            return asset.x < padding && mex > (k.mapLimitX - padding);
        }).forEach(function (asset) {
            _this.context.drawImage(asset.tag, k.mapLimitX + asset.x, asset.y);
        });
    };
    return World;
}());
export { World };
//# sourceMappingURL=world.js.map