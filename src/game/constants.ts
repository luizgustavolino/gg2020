
export const engineMaxImpulse = 60

export const racerBodySize = 16
export const distanceBetweenMeBodies = 12
export const baseImpulse = 8_000
export const maxImpulse = engineMaxImpulse * 0.4
export const firstAcellMultiplier = 2
export const bulletSpeed = baseImpulse
export const angleDecreaseRate = 9.5

export const pit_location = {x:6560, y:0}

export const jumpImpulseY = 130_000
export const jumpImpulseX = jumpImpulseY * 0.2
export const mapLimitX = 14_080
export const screenPadding = 1_000

export const pi = Math.PI

export const colide = {
    racers:  0x0004,
    bullets: 0x0002,
    scenery: 0x0008
}