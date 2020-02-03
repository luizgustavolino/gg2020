/*
* Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as box2d from "box2d.ts";
var Camera = /** @class */ (function () {
    function Camera() {
        this.m_center = new box2d.b2Vec2(0, 20);
        this.m_extent = 25;
        this.m_zoom = 1;
        this.m_width = 1280;
        this.m_height = 800;
    }
    Camera.prototype.ConvertScreenToWorld = function (screenPoint, out) {
        return this.ConvertElementToWorld(screenPoint, out);
    };
    Camera.prototype.ConvertWorldToScreen = function (worldPoint, out) {
        return this.ConvertWorldToElement(worldPoint, out);
    };
    Camera.prototype.ConvertViewportToElement = function (viewport, out) {
        // 0,0 at center of canvas, x right and y up
        var element_x = viewport.x + (0.5 * this.m_width);
        var element_y = (0.5 * this.m_height) - viewport.y;
        return out.Set(element_x, element_y);
    };
    Camera.prototype.ConvertElementToViewport = function (element, out) {
        // 0,0 at center of canvas, x right and y up
        var viewport_x = element.x - (0.5 * this.m_width);
        var viewport_y = (0.5 * this.m_height) - element.y;
        return out.Set(viewport_x, viewport_y);
    };
    Camera.prototype.ConvertProjectionToViewport = function (projection, out) {
        var viewport = out.Copy(projection);
        box2d.b2Vec2.MulSV(1 / this.m_zoom, viewport, viewport);
        ///box2d.b2Vec2.MulSV(this.m_extent, viewport, viewport);
        box2d.b2Vec2.MulSV(0.5 * this.m_height / this.m_extent, projection, projection);
        return viewport;
    };
    Camera.prototype.ConvertViewportToProjection = function (viewport, out) {
        var projection = out.Copy(viewport);
        ///box2d.b2Vec2.MulSV(1 / this.m_extent, projection, projection);
        box2d.b2Vec2.MulSV(2 * this.m_extent / this.m_height, projection, projection);
        box2d.b2Vec2.MulSV(this.m_zoom, projection, projection);
        return projection;
    };
    Camera.prototype.ConvertWorldToProjection = function (world, out) {
        var projection = out.Copy(world);
        box2d.b2Vec2.SubVV(projection, this.m_center, projection);
        ///box2d.b2Rot.MulTRV(this.m_roll, projection, projection);
        return projection;
    };
    Camera.prototype.ConvertProjectionToWorld = function (projection, out) {
        var world = out.Copy(projection);
        ///box2d.b2Rot.MulRV(this.m_roll, world, world);
        box2d.b2Vec2.AddVV(this.m_center, world, world);
        return world;
    };
    Camera.prototype.ConvertElementToWorld = function (element, out) {
        var viewport = this.ConvertElementToViewport(element, out);
        var projection = this.ConvertViewportToProjection(viewport, out);
        return this.ConvertProjectionToWorld(projection, out);
    };
    Camera.prototype.ConvertWorldToElement = function (world, out) {
        var projection = this.ConvertWorldToProjection(world, out);
        var viewport = this.ConvertProjectionToViewport(projection, out);
        return this.ConvertViewportToElement(viewport, out);
    };
    Camera.prototype.ConvertElementToProjection = function (element, out) {
        var viewport = this.ConvertElementToViewport(element, out);
        return this.ConvertViewportToProjection(viewport, out);
    };
    return Camera;
}());
export { Camera };
// This class implements debug drawing callbacks that are invoked
// inside b2World::Step.
var DebugDraw = /** @class */ (function (_super) {
    __extends(DebugDraw, _super);
    function DebugDraw() {
        var _this = _super.call(this) || this;
        _this.m_ctx = null;
        var flags = box2d.b2DrawFlags.e_none;
        flags |= box2d.b2DrawFlags.e_shapeBit;
        flags |= box2d.b2DrawFlags.e_jointBit;
        _this.SetFlags(flags);
        console.log("debug draw is enabled");
        return _this;
    }
    DebugDraw.prototype.PushTransform = function (xf) {
        var ctx = this.m_ctx;
        if (ctx) {
            ctx.save();
            ctx.translate(xf.p.x, xf.p.y);
            ctx.rotate(xf.q.GetAngle());
        }
    };
    DebugDraw.prototype.PopTransform = function (xf) {
        var ctx = this.m_ctx;
        if (ctx) {
            ctx.restore();
        }
    };
    DebugDraw.prototype.DrawPolygon = function (vertices, vertexCount, color) {
        var ctx = this.m_ctx;
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (var i = 1; i < vertexCount; i++) {
                ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            ctx.closePath();
            ctx.strokeStyle = color.MakeStyleString(1);
            ctx.stroke();
        }
    };
    DebugDraw.prototype.DrawSolidPolygon = function (vertices, vertexCount, color) {
        var ctx = this.m_ctx;
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (var i = 1; i < vertexCount; i++) {
                ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            ctx.closePath();
            ctx.fillStyle = color.MakeStyleString(0.5);
            ctx.fill();
            ctx.strokeStyle = color.MakeStyleString(1);
            ctx.stroke();
        }
    };
    DebugDraw.prototype.DrawCircle = function (center, radius, color) {
        var ctx = this.m_ctx;
        if (ctx) {
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, 0, box2d.b2_pi * 2, true);
            ctx.strokeStyle = color.MakeStyleString(1);
            ctx.stroke();
        }
    };
    DebugDraw.prototype.DrawSolidCircle = function (center, radius, axis, color) {
        var ctx = this.m_ctx;
        if (ctx) {
            var cx = center.x;
            var cy = center.y;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, box2d.b2_pi * 2, true);
            ctx.moveTo(cx, cy);
            ctx.lineTo((cx + axis.x * radius), (cy + axis.y * radius));
            ctx.fillStyle = color.MakeStyleString(0.5);
            ctx.fill();
            ctx.strokeStyle = color.MakeStyleString(1);
            ctx.stroke();
        }
    };
    // #if B2_ENABLE_PARTICLE
    DebugDraw.prototype.DrawParticles = function (centers, radius, colors, count) {
        var ctx = this.m_ctx;
        if (ctx) {
            if (colors !== null) {
                for (var i = 0; i < count; ++i) {
                    var center = centers[i];
                    var color = colors[i];
                    ctx.fillStyle = color.MakeStyleString();
                    // ctx.fillRect(center.x - radius, center.y - radius, 2 * radius, 2 * radius);
                    ctx.beginPath();
                    ctx.arc(center.x, center.y, radius, 0, box2d.b2_pi * 2, true);
                    ctx.fill();
                }
            }
            else {
                ctx.fillStyle = "rgba(255,255,255,0.5)";
                // ctx.beginPath();
                for (var i = 0; i < count; ++i) {
                    var center = centers[i];
                    // ctx.rect(center.x - radius, center.y - radius, 2 * radius, 2 * radius);
                    ctx.beginPath();
                    ctx.arc(center.x, center.y, radius, 0, box2d.b2_pi * 2, true);
                    ctx.fill();
                }
                // ctx.fill();
            }
        }
    };
    // #endif
    DebugDraw.prototype.DrawSegment = function (p1, p2, color) {
        var ctx = this.m_ctx;
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = color.MakeStyleString(1);
            ctx.stroke();
        }
    };
    DebugDraw.prototype.DrawTransform = function (xf) {
        var ctx = this.m_ctx;
        if (ctx) {
            this.PushTransform(xf);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(1, 0);
            ctx.strokeStyle = box2d.b2Color.RED.MakeStyleString(1);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 1);
            ctx.strokeStyle = box2d.b2Color.GREEN.MakeStyleString(1);
            ctx.stroke();
            this.PopTransform(xf);
        }
    };
    DebugDraw.prototype.DrawPoint = function (p, size, color) {
        var ctx = this.m_ctx;
        if (ctx) {
            ctx.fillStyle = color.MakeStyleString();
            size *= g_camera.m_zoom;
            size /= g_camera.m_extent;
            var hsize = size / 2;
            ctx.fillRect(p.x - hsize, p.y - hsize, size, size);
        }
    };
    DebugDraw.prototype.DrawString = function (x, y, message) {
        var ctx = this.m_ctx;
        if (ctx) {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.font = "15px DroidSans";
            var color = DebugDraw.DrawString_s_color;
            ctx.fillStyle = color.MakeStyleString();
            ctx.fillText(message, x, y);
            ctx.restore();
        }
    };
    DebugDraw.prototype.DrawStringWorld = function (x, y, message) {
        var ctx = this.m_ctx;
        if (ctx) {
            var p = DebugDraw.DrawStringWorld_s_p.Set(x, y);
            // world -> viewport
            var vt = g_camera.m_center;
            box2d.b2Vec2.SubVV(p, vt, p);
            ///const vr = g_camera.m_roll;
            ///box2d.b2Rot.MulTRV(vr, p, p);
            var vs = g_camera.m_zoom;
            box2d.b2Vec2.MulSV(1 / vs, p, p);
            // viewport -> canvas
            var cs = 0.5 * g_camera.m_height / g_camera.m_extent;
            box2d.b2Vec2.MulSV(cs, p, p);
            p.y *= -1;
            var cc = DebugDraw.DrawStringWorld_s_cc.Set(0.5 * ctx.canvas.width, 0.5 * ctx.canvas.height);
            box2d.b2Vec2.AddVV(p, cc, p);
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.font = "15px DroidSans";
            var color = DebugDraw.DrawStringWorld_s_color;
            ctx.fillStyle = color.MakeStyleString();
            ctx.fillText(message, p.x, p.y);
            ctx.restore();
        }
    };
    DebugDraw.prototype.DrawAABB = function (aabb, color) {
        var ctx = this.m_ctx;
        if (ctx) {
            ctx.strokeStyle = color.MakeStyleString();
            var x = aabb.lowerBound.x;
            var y = aabb.lowerBound.y;
            var w = aabb.upperBound.x - aabb.lowerBound.x;
            var h = aabb.upperBound.y - aabb.lowerBound.y;
            ctx.strokeRect(x, y, w, h);
        }
    };
    DebugDraw.DrawString_s_color = new box2d.b2Color(0.9, 0.6, 0.6);
    DebugDraw.DrawStringWorld_s_p = new box2d.b2Vec2();
    DebugDraw.DrawStringWorld_s_cc = new box2d.b2Vec2();
    DebugDraw.DrawStringWorld_s_color = new box2d.b2Color(0.5, 0.9, 0.5);
    return DebugDraw;
}(box2d.b2Draw));
export { DebugDraw };
export var g_camera = new Camera();
//# sourceMappingURL=debugDraw.js.map