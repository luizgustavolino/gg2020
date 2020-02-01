
import * as _ from 'lodash'
import { boot } from './game/engine'

/*
import * as box2d from "box2d.ts";

export function main(): number {

  const gravity: box2d.b2Vec2 = new box2d.b2Vec2(0, -10);
  const world: box2d.b2World = new box2d.b2World(gravity);

  const groundBodyDef: box2d.b2BodyDef = new box2d.b2BodyDef();
  groundBodyDef.position.Set(0, -10);

  const groundBody: box2d.b2Body = world.CreateBody(groundBodyDef);
  const groundBox: box2d.b2PolygonShape = new box2d.b2PolygonShape();

  groundBox.SetAsBox(50, 10);
  groundBody.CreateFixture(groundBox, 0);

  const bodyDef: box2d.b2BodyDef = new box2d.b2BodyDef();
  bodyDef.type = box2d.b2BodyType.b2_dynamicBody;
  bodyDef.position.Set(0, 4);
  const body: box2d.b2Body = world.CreateBody(bodyDef);

  const dynamicBox: box2d.b2PolygonShape = new box2d.b2PolygonShape();
  dynamicBox.SetAsBox(1, 1);

  const fixtureDef: box2d.b2FixtureDef = new box2d.b2FixtureDef();
  fixtureDef.shape = dynamicBox;
  fixtureDef.density = 1;

  fixtureDef.friction = 0.3;
  const fixture: box2d.b2Fixture = body.CreateFixture(fixtureDef);

  const timeStep: number = 1 / 60;
  const velocityIterations: number = 6;
  const positionIterations: number = 2;

  for (let i: number = 0; i < 60; ++i) {
    world.Step(timeStep, velocityIterations, positionIterations);
    const position: box2d.b2Vec2 = body.GetPosition();
    const angle: number = body.GetAngle();
    console.log(position.x.toFixed(2), position.y.toFixed(2), angle.toFixed(2));
  }

  body.DestroyFixture(fixture);
  world.DestroyBody(body);

  return 0;

}
main()
*/

boot()