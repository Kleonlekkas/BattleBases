"use strict"

var app = app || {};

app.game = {
    myCharacters: [],
    enemyCharacters: [],

    myBase: undefined,
    enemyBase: undefined,

    myTurret: undefined,
    enemyTurret: undefined,

    myBullets: [],
    enemyBullets: [],

    makeCharacterButton: undefined,

    init: function(){
        //make base
        var base = getGeneralObject('base');
        var basePos = {
            x: ((base.width / 2) * .5) - (app.main.worldSize.width / 2),
            y: 100
        };
        var enemyBasePos = {
            x: ((base.width / 2) * .5) - (app.main.worldSize.width / 2),
            y: 100}; 
        enemyBasePos.x *= -1;
        this.myBase = new baseObject(
            'base',
            basePos,
            .5
        );
        this.enemyBase = new baseObject(
            'base',
            enemyBasePos,
            .5
        )

        //make turret
        this.myTurret = new turretObject(
            '01',   //turret
            '01',   //bullet
            500,    //range
            10,     //damage
            1,      //rounds per second
            {   x: this.myBase.position.x,
                y: this.myBase.position.y - 100},   //position
            0,      //rotation
            .5,     //scale
            1);     //flip direction
        this.enemyTurret = new turretObject(
            '01',   //turret
            '01',   //bullet
            500,    //range
            10,     //damage
            1,      //rounds per second
            {   x: this.enemyBase.position.x,
                y: this.enemyBase.position.y - 100},   //position
            0,      //rotation
            .5,     //scale
            -1);     //flip direction

        //button stuff
        var button = getButton("01");
        //adjusting position for scale I'll be doing to this object
        var charButtonPos = {
            x: (button.width / 2) * .1,
            y: (button.height / 2) * .1}; 

		this.makeCharacterButton = new buttonObject (
			'01',		//image
            charButtonPos,
            .1);	    //position

    },
    update: function(dt, ctx){
        this.updateButtons();
        if(app.main.host){
            this.myTurret.update(dt, this.enemyCharacters);
            this.enemyTurret.update(dt, this.myCharacters);
            this.updateCharacters(dt);
            this.updateCollisions(dt);
            sendCharacterList();
        }
        this.draw(ctx);
    },
    updateCharacters: function(dt){
        for(var i = 0; i < this.myCharacters.length; i++){
            this.myCharacters[i].update(dt);
        }

        for (var i = 0; i < this.enemyCharacters.length; i++) {
            this.enemyCharacters[i].update(dt);
        }

        //console.log(this.enemyCharacters);
    },
    updateButtons: function(){
        if (this.makeCharacterButton.clicked(true)) {
            if (app.main.host) {
                var charPos = JSON.parse(JSON.stringify(this.myBase.position))
                charPos.y += 20;
                this.myCharacters.push(new characterObject(
                    '01',
                    charPos,
                    100,
                    20, //health
                    10, //damage
                    .15,
                    1
                ));
            } else {
                //theyre the other player, 
                //emit an enemy created to the host
                sendHostNewCharacter();
            }

        }
    },
    updateCollisions: function(dt){
        //my players vs enemy players
        //my players vs enmey base
        //enemy players vs my base
        /********************* */
        //my turret bullets vs enemy players
        //enemy turret bullets vs my players
        this.checkPlayerCollisions(dt);
        this.checkBaseCollisions(dt);
        this.checkPlayerBullets();
        this.managePlayers();
        //emit new list to other client
    },
    checkPlayerBullets: function(){
        for (var i = this.enemyCharacters.length - 1; i >= 0; i--) {
            for (var j = this.myTurret.bullets.length - 1; j >= 0; j--) {
                var box = {
                    pos: this.enemyCharacters[i].position,
                    width: this.enemyCharacters[i].width,
                    height: this.enemyCharacters[i].height
                };
                var ball = {
                    pos: this.myTurret.bullets[j].position,
                    rad: 10
                }
                if(RectCircleCollision(box,ball)){
                    this.enemyCharacters[i].health -= this.myTurret.bullets[j].damage;
                    this.myTurret.bullets.splice(j, 1);
                    if(this.enemyCharacters[i].health <= 0){
                        this.enemyCharacters.splice(i, 1);
                    }
                    break;
                }
            }
        }
        for (var i = this.myCharacters.length - 1; i >= 0; i--) {
            for (var j = this.enemyTurret.bullets.length - 1; j >= 0; j--) {
                var box = {
                    pos: this.myCharacters[i].position,
                    width: this.myCharacters[i].width,
                    height: this.myCharacters[i].height
                };
                var ball = {
                    pos: this.enemyTurret.bullets[j].position,
                    rad: 10
                }
                if(RectCircleCollision(box,ball)){
                    this.myCharacters[i].health -= this.enemyTurret.bullets[j].damage;
                    this.enemyTurret.bullets.splice(j, 1);
                    if(this.myCharacters[i].health <= 0){
                        this.myCharacters.splice(i, 1);
                    }
                    break;
                }
            }
        }
    },
	checkPlayerCollisions: function(dt) {
        //reset collisions
        for (var i = this.myCharacters.length - 1; i >= 0; i--) {
            this.myCharacters[i].isColliding = false;
            if(i > 0){
                if(HorizontalCollision(this.myCharacters[i],this.myCharacters[i-1]))
                this.myCharacters[i].isColliding = true;
            }
        }
        for (var n = this.enemyCharacters.length - 1; n >= 0; n--) {
            this.enemyCharacters[n].isColliding = false;
            if(n > 0){
                if(HorizontalCollision(this.enemyCharacters[n],this.enemyCharacters[n-1]))
                this.enemyCharacters[n].isColliding = true;
            }
        }
		for (var i = this.myCharacters.length - 1; i >= 0; i--) {
			for (var n = this.enemyCharacters.length - 1; n >= 0; n--) {
                //myCharacters Colliding with Enemy Charcters
				if (HorizontalCollision(this.myCharacters[i],this.enemyCharacters[n])) {
                    this.myCharacters[i].isColliding = true;
                    this.enemyCharacters[n].isColliding = true;

                    this.myCharacters[i].health -= this.enemyCharacters[i].damage * dt;
                    this.enemyCharacters[i].health -= this.myCharacters[i].damage * dt;
                    //Kill them for now.
                    if(this.myCharacters[i].health <= 0){
                        this.myCharacters.splice(i, 1);
                    }
                    //Kill them for now.
                    if(this.enemyCharacters[i].health <= 0){
                        this.enemyCharacters.splice(i, 1);
                    }
                    break;
                }
			}
		}
    },
    checkBaseCollisions: function(dt) {
        for (var i = 0; i < this.myCharacters.length; i++) {
            //Players colliding with enemy Base
            if (HorizontalCollision(this.myCharacters[i], this.enemyBase)) {
                console.log("Hey, we're killing their base");
                //for now, just kill the character and do some damage to the base
                this.enemyBase.takeDamage(this.myCharacters[i].damage * dt);
                this.myCharacters[i].isColliding = true;

                //End game if players health drops below 0
                if (this.enemyBase.health <= 0) {
                    sendOver(false);
                }
            }
        }
        for (var n = 0; n < this.enemyCharacters.length; n++) {
            //Enemies colliding with my Base
            if (HorizontalCollision(this.enemyCharacters[n], this.myBase)) {
                console.log("My base is under attack!");
                this.myBase.takeDamage(this.enemyCharacters[i].damage * dt);
                this.enemyCharacters[i].isColliding = true;

                //End game if players health drops below 0
                if (this.myBase.health <= 0) {
                    sendOver(true);
                }
            }
        }
    },
    // checkPlayersInTurretRange: function() {
    //     for (var i = 0; i < this.myCharacters.length; i++) {
    //         //My players in range of enemy turrets, and does not already exist in the Target array
    //         if (this.myCharacters[i].position.x > (this.enemyBase.position.x - 300)) {
    //             console.log("Friendly in enemy turret range");
    //         }
    //     }
    //     for (var n = 0; n < this.enemyCharacters.length; n++) {
    //         if (this.enemyCharacters[n].position.x < (this.myBase.position.x + 300)) {
    //             console.log("Enemy in friendly turret range");
    //         }
    //     }
    // },
	// checkTurretCollisions: function() {
		
    // },
    //currently delete characters when they get off screen
    //will be used to handle deaths
    managePlayers: function() {
        for (var i = 0; i < this.myCharacters.length; i++) {
            if (this.myCharacters[i].position.x > 800) {
                console.log("character off screen");
                this.myCharacters.splice(i, 1);
                i--;
            }
        }
        for (var n = 0; n < this.enemyCharacters.length; n++) {
            if (-this.enemyCharacters[n].position.x < -800) {
                //console.log("Enemy off screen");
                this.enemyCharacters.splice(n, 1);
                n--;
                //doesnt work because enemies are updated from other client
            }
        }
    },
    draw: function(ctx){
        if(!app.main.host){
            this.drawHostCharacters(ctx);
        }else{
            this.drawCharacters(ctx);
        }

        this.myBase.draw(ctx);
        this.enemyBase.draw(ctx, true);

        this.myBase.drawHealth(ctx);
        this.enemyBase.drawHealth(ctx, true);

        if(app.main.host){
            this.myTurret.drawBullets(ctx);
            this.enemyTurret.drawBullets(ctx, true);
        }else{
            for(var i = 0; i < this.myBullets.length; i++){
                this.doNonHostDraw(ctx, this.myBullets[i], getBullet(this.myBullets[i].imageNum), false, true);
            }
            for (var i = 0; i < this.enemyBullets.length; i++){
                this.doNonHostDraw(ctx, this.enemyBullets[i], getBullet(this.enemyBullets[i].imageNum), true, true);
            }
        }

        this.myTurret.draw(ctx);
        this.enemyTurret.draw(ctx, true);
    },
    drawCharacters: function(ctx){
        for(var i = 0; i < this.myCharacters.length; i++){
            this.myCharacters[i].draw(ctx);
        }
        for (var i = 0; i < this.enemyCharacters.length; i++){
            this.enemyCharacters[i].draw(ctx, true);
        }
    },
    //draw the characters the host has
    drawHostCharacters: function(ctx){
        for(var i = 0; i < this.myCharacters.length; i++){
            this.doNonHostDraw(ctx, this.myCharacters[i], getCharacter(this.myCharacters[i].imageNum));
        }
        for (var i = 0; i < this.enemyCharacters.length; i++){
            this.doNonHostDraw(ctx, this.enemyCharacters[i], getCharacter(this.enemyCharacters[i].imageNum), true);
        }
    },
    doNonHostDraw(ctx, obj, image, flip, vertFlip){
        ctx.save();

        var rot = obj.rotation || 0;        
        var scale = obj.scale || 1;   
        var swap = 1;
        var vertSwap = 1;
        if(flip) swap = -1;
        if(vertFlip) vertSwap = -1;

        rot = (obj.rotation * Math.PI) / 180;  //convert rotation to radians

        ctx.scale(scale * swap, scale);
        ctx.translate(obj.position.x / (scale * -swap), obj.position.y / (scale));
        ctx.rotate(rot);

        ctx.drawImage(
            image,
            -(obj.imageWidth / 2),
            -(obj.imageHeight / 2)
        );

        ctx.restore();
    },
	drawUI: function(ctx) {
		this.makeCharacterButton.draw(ctx); //draw the button used to make our character
	}
}