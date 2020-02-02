
export class Point {
    x: number;
    y: number;
}

export class Object {
    name: string;
    polygon: Point[];
    x: number;
    y: number;
    width: number;
    height: number;
}

export class ObjectLayer {
    objects: Object[];
    type:"objectgroup"
}

export class ImageLayer {
    type:"imagelayer"
    image:string
    offsetx:number
    offsety:number
}

export class Layer {
    type:string
    layers?: Layer[];
    objects?: Object[];
    image?:string
    offsetx?:number
    offsety?:number
}

export class MapFile {
    layers: Layer[];
}
