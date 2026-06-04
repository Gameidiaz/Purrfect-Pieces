new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "catformer",
    physics: {
        default: "arcade",
        arcade: {
            gravity: {y: 980}
        }
    }
})