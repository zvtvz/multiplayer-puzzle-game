// The percentage of the screen which the selection area
// should take up
const selectionAreaPercent = 0.2;
const gameBoardSize = 0.7;

// boolean to help with screen drag
var dragging = false;
var selectionAreaDragging = false;
var touchX;
var touchY;
var spriteDrag = false;

// on screen information
var onScreen;
var timer;
var startTime = Date.now();

// Selection area
var selectionArea;

var playState = {


  create: function() {

    // Change background color to a light colour
    game.stage.backgroundColor = "#ffffcc";

    // Add the puzzle piece selection area
    selectionArea = game.add.graphics(0,0);
    selectionArea.beginFill(0xffffff);
    selectionArea.lineStyle(2, 0x0000FF, 1);
    selectionArea.drawRect(
      0,
      game.world.height*(1-selectionAreaPercent),
      game.world.width,
      game.world.height*(selectionAreaPercent)
    );
    selectionArea.endFill();
    selectionArea.fixedToCamera = true;

    // place the timer at the top of the game screen
    timer = game.add.text(80, 0,
                    'Time: '+(Date.now()-startTime),
                    {font: '25px Arial', fill: '#0x0000FF'});

    // The main layout of the game board:
    var graphics = game.add.graphics(0,0);
    graphics.beginFill(0xffffff);
    // Draw the game board with the graphics object
    gameboard.draw(graphics);
    // Fill the graphics objects
    graphics.endFill();

    this.keyboard = game.input.keyboard;

    this.player = game.add.sprite(16,16,'player');
    game.physics.enable(this.player, Phaser.Physics.ARCADE);

    this.win = game.add.sprite(256,256,'win');
    game.physics.enable(this.win, Phaser.Physics.ARCADE);

    gameboard.addPuzzle('penguin_puzzle');

    // enable touch
    game.input.mouse.capture = true;

    // increase the size of the world to let players move around the puzzle
    game.world.setBounds(0,0,2000,2000);

    // create onScreen group:
    onScreen = game.add.group();
    onScreen.add(selectionArea);
    onScreen.add(timer);
    onScreen.add(unsetPieces); // Add pieces from gameboard.js
  },

  update: function() {

    game.physics.arcade.overlap(this.player, this.win, this.Win, null, this);

    // enable horizontal movement
    if (this.keyboard.isDown(Phaser.Keyboard.A)) {
      this.player.body.velocity.x = -175;
    } else if (this.keyboard.isDown(Phaser.Keyboard.D)) {
      this.player.body.velocity.x = 175;
    } else {
      this.player.body.velocity.x = 0;
    }

    // enable vertical movement
    if (this.keyboard.isDown(Phaser.Keyboard.W)) {
      this.player.body.velocity.y = -175;
    } else if (this.keyboard.isDown(Phaser.Keyboard.S)) {
      this.player.body.velocity.y = 175;
    } else {
      this.player.body.velocity.y = 0;
    }

    // drag the screen
    this.screenDrag();

    // update timer:
    this.updateTimer();

    // update the selection area
    this.updateSelectionArea();

    // Bring onscreen graphics to the top
    game.world.bringToTop(onScreen);

  },

  // Check for the user pulling the selection area across
  updateSelectionArea: function() {
    // check that the mouse is over the selection area
    if (game.input.activePointer.position.y > game.camera.height*(1-selectionAreaPercent) && game.input.activePointer.isDown) {

      // Then check if we should drag the pieces:
      if (selectionAreaDragging) {
        var dx = game.input.activePointer.position.x - touchX;
        touchX = game.input.activePointer.position.x;

        // Drag the pieces across
        gameboard.moveUnsetPieces(dx);
      }

      else {
        touchX = game.input.activePointer.position.x;
        selectionAreaDragging = true;
      }
    }

    // Stop dragging the pieces when the mouse is up
    else {
      selectionAreaDragging = false;
    }

  },

  screenDrag: function() {
    // drag the screen
    if (game.input.activePointer.isDown){
      // if a sprite is being dragged then we ignore this touch
      if (spriteDrag) {
        dragging = false;
        return;
      }

      // if the player is dragging the selection area then
      // do not also drag the camera
      if (game.input.activePointer.position.y > game.camera.height*(1-selectionAreaPercent)) {
        return;
      }

      if (dragging) {
        var dx = game.input.activePointer.position.x - touchX;
        var dy = game.input.activePointer.position.y - touchY;
        touchX = game.input.activePointer.position.x;
        touchY = game.input.activePointer.position.y;
      }
      else {
        dragging = true;
        touchX = game.input.activePointer.position.x;
        touchY = game.input.activePointer.position.y;
        var dx = 0;
        var dy = 0;
      }
      game.camera.x -= dx;
      game.camera.y -= dy;
      gameboard.moveUnsetPieces(-dx);
    }

    // Stop dragging screen
    if (game.input.activePointer.isUp) {
      dragging = false;
    }
  },

  updateTimer: function() {
    var timerX = game.camera.position.x+80;
    var timerY = game.camera.position.y;
    timer.destroy();
    timer = game.add.text(timerX, timerY,
                    'Time: '+(Date.now()-startTime),
                    {font: '25px Arial', fill: '#0x0000FF'});
    onScreen.add(timer);
  },

  // Called when a puzzle piece is being dragged
  spriteDrag: function(dragging) {
    spriteDrag = dragging;
  },

  Win: function() {
    // game over, you win!
    game.stage.backgroundColor = "#000000";
    game.state.start('win');
  }
};
