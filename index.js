const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 500
canvas.height = 500

const collisionsMap = []
for (let i = 0; i < collisions.length; i+= 60) {
    collisionsMap.push(collisions.slice(i, i + 60))
}

// Boundary Class
class Boundary {
    static width = 48
    static height = 48
    constructor({position}) {
        this.position = position
        this.width = 48
        this.height = 48
    }

    draw() {
        c.fillStyle = 'rgba(225, 0, 0, 0.0'
        c.fillRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height
        )
    }
}

// Custom Boundary Class
class CustomBoundary {
    constructor({position, dimensions}) {
        this.position = position
        this.width = dimensions.width
        this.height = dimensions.height
    }

    draw() {
        c.fillStyle = 'rgba(225, 0, 0, 0.0'
        c.fillRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height
        )
    }
}

const boundaries = []

const offset = {
    x: -973,
    y: -640
}

//Collision Mapping
// This is the generic code for collision set up
// collisionsMap.forEach((row, i) => {
//     row.forEach((symbol, j) => {
//         if(symbol === 401) {boundaries.push(
//             new Boundary({
//                 position: {
//                     x: j * Boundary.width + offset.x,
//                     y: i * Boundary.height + offset.y,
//                 }
//             })
//         )}
//     })
// })


// customised collision code
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if(i === 16 && j === 23 && symbol === 401) {boundaries.push( // Move barrel to right
            new CustomBoundary({
                position: {
                    x: j * Boundary.width + offset.x + 10,
                    y: i * Boundary.height + offset.y + 2,
                },
                dimensions: {
                    width: 50,
                    height: 30
                }
            })
        )}
        else if(i === 14 && symbol === 401) {boundaries.push( // Move top ocean boundaries up
            new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y - 22,
                }
            })
        )}
        else if((i === 15 ||
            i === 16 ||
            i === 17)
            && j !== 38
            && j !== 21
            && symbol === 401) {boundaries.push( // Move tree boundaries up and customise width
            new CustomBoundary({
                position: {
                    x: j * Boundary.width + offset.x + 8,
                    y: i * Boundary.height + offset.y - 22,
                },
                dimensions: {
                    width: 30,
                    height: 48
                }
            })
        )}
        else if(i === 21 && symbol === 401) {boundaries.push( // Move near water down
            new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y + 22,
                }
            })
        )}
        else if(i === 22 && symbol === 401) {boundaries.push( // Move near water up
            new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y - 17,
                }
            })
        )}
        else if(i === 25 && symbol === 401) {boundaries.push( // Move near ocean up
            new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y - 20,
                }
            })
        )}
        else if(symbol === 401) {boundaries.push(
            new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y,
                }
            })
        )}
    })
})

const image = new Image()
image.src = './img/Summer-Map.png'

const foregroundImage = new Image()
foregroundImage.src = './img/Summer-Foreground.png'

const playerDownImage = new Image()
playerDownImage.src = './img/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './img/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './img/playerRight.png'

// Sprite Class
class Sprite {
    constructor({ position, image, frames = { max: 1}, sprites}) {
        this.position = position
        this.image = image
        this.frames = {...frames, val: 0, elapsed: 0}

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }

        this.moving = false
        this.sprites = sprites
    }

    draw() {
        c.drawImage(
            this.image,
            // 0,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height,
        )

        if(!this.moving) return

        if (this.frames.max > 1) {
            this.frames.elapsed++
        }

        if (this.frames.elapsed % 8 === 0) {
            if(this.frames.val < this.frames.max - 1){
                this.frames.val++
            } else {
                this.frames.val = 0
            }
        }
    }
}

const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 3 / 2,
        y: canvas.height / 2 - 48 / 2
    },
    image: playerDownImage,
    frames: {
        max: 4
    },
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        left: playerLeftImage,
        right: playerRightImage,
    }
})

const background = new Sprite({
    position:{
        x: offset.x,
        y: offset.y
    },
    image: image,
})

const foreground = new Sprite({
    position:{
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage,
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

const moveables = [background, ...boundaries, foreground]

function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.position.x + rectangle1.width -4 >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width -4 &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height -4 &&
        rectangle1.position.y + rectangle1.height -4 >= rectangle2.position.y
    )
}

// animation
function animate() {
    window.requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach((boundary) => {
        boundary.draw()
    })
    player.draw()
    foreground.draw()

    let moving = true
    player.moving = false

    // moving movables
    if(keys.w.pressed && lastKey === 'w') {
        player.moving = true
        player.image = player.sprites.up
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            // collision detection
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y + 2
                }}
            })) {
                moving = false
                break
            }
        }
        if (moving) {
            moveables.forEach((moveable) => {
                moveable.position.y +=2
            })
        }
    }

    else if(keys.a.pressed && lastKey === 'a') {
        player.moving = true
        player.image = player.sprites.left
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            // collision detection
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x + 2,
                    y: boundary.position.y
                }}
            })) {
                moving = false
                break
            }
        }
        if (moving) {
            moveables.forEach((moveable) => {
                moveable.position.x +=2
            })
        }
    }

    else if(keys.d.pressed && lastKey === 'd') {
        player.moving = true
        player.image = player.sprites.right
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            // collision detection
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x -2,
                    y: boundary.position.y
                }}
            })) {
                moving = false
                break
            }
        }
        if (moving) {
            moveables.forEach((moveable) => {
                moveable.position.x -=2
            })
        }
    }

    else if(keys.s.pressed && lastKey === 's') {
        player.moving = true
        player.image = player.sprites.down
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            // collision detection
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y - 2
                }}
            })) {
                moving = false
                break
            }
        }
        if (moving) {
            moveables.forEach((moveable) => {
                moveable.position.y -=2
            })
        }
    }
}

animate()

let lastKey = ''
window.addEventListener('keydown',(e) => {
    switch (e.key) {
        case 'w': // move up
            keys.w.pressed = true
            lastKey = 'w'
            break;
        case 'a': // move left
            keys.a.pressed = true
            lastKey = 'a'
            break;
        case 's': // move right
            keys.s.pressed = true
            lastKey = 's'
            break;
        case 'd': // move down
            keys.d.pressed = true
            lastKey = 'd'
            break;
    
        default:
            break;
    }
})

window.addEventListener('keyup',(e) => {
    switch (e.key) {
        case 'w': // move up
            keys.w.pressed = false
            break;
        case 'a': // move left
            keys.a.pressed = false
            break;
        case 's': // move right
            keys.s.pressed = false
            break;
        case 'd': // move down
            keys.d.pressed = false
            break;
    
        default:
            break;
    }
})
