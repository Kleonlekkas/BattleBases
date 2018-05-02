"use strict";

let socket;
let updateInterval = undefined;

//initial connection to server
function joinServer(){
    socket = io.connect();

    //on joining the server, start up game
    socket.on('join', (data) => {
        app.main.host = data.host;
        if(!data.host){
            app.main.currentGameState = app.main.gameState.GAME;
            socket.emit('startGame', {});
        }
        //have host update character every 20ms
        // if (app.main.host) {
        //     console.log("HOST");
        //     setInterval(sendCharacterList, 1000);
        // }
    });
    socket.on('startGame', () => {
        app.main.currentGameState = app.main.gameState.GAME
    });
    // socket.on('updatePlayerInfo', (data) => {
    //     app.game.enemyCharacters = data.characters;
    //     //For each of these enemy characters, change their direction to -1
    //     for (var i = 0; i < data.characters.length; i++) {
    //         app.game.enemyCharacters[i].direction = -1;
    //     }
    // });
    socket.on('upgradeBase', () => {
        console.log('here');
        if(app.game.enemyBase.level < 3 && app.game.enemyCurrency - app.game.baseCost[app.game.enemyBase.level] >= 0){
            app.game.enemyCurrency -= app.game.baseCost[app.game.enemyBase.level];
            app.game.enemyBase.level++;
            var level = app.game.enemyBase.level;
            var stats = app.game.baseLevelStats;
            app.game.enemyBase.image = stats[level - 1].baseImage;
            app.game.enemyTurret.image = stats[level - 1].turretImage;
            app.game.enemyTurret.bulletType = stats[level - 1].bulletType;
            app.game.enemyTurret.range = stats[level - 1].range;
            app.game.enemyTurret.damage = stats[level - 1].damage;
            app.game.enemyTurret.fireRate = stats[level - 1].fireRate;
            app.game.enemyTurret.imageWidth = app.game.enemyTurret.image.width;
            app.game.enemyTurret.imageHeight = app.game.enemyTurret.image.height;
            app.game.enemyTurret.width = app.game.enemyTurret.imageWidth * app.game.enemyTurret.scale;
            app.game.enemyTurret.height = app.game.enemyTurret.imageHeight * app.game.enemyTurret.scale;
        }
    });
    socket.on('createNewEnemyForHost', (data) => {
        var enemyStats = app.game.characterStats[app.game.enemyBase.level - 1];
        var img = `reg?0${app.game.enemyBase.level}`;
        var health = enemyStats.reg.health;
        var damage = enemyStats.reg.damage;
        var speed = enemyStats.reg.speed;
        var value = enemyStats.reg.value;
        var cost = app.game.charRegCost;
        var ranged = false;
        var range = 0;

        //ranged
        if (data == 2) {
            img = `range?0${app.game.enemyBase.level}`;
            health = enemyStats.range.health;
            damage = enemyStats.range.damage;
            value = enemyStats.range.value;
            speed = enemyStats.range.speed;
            cost = app.game.charRangeCost;
            ranged = true;
            range = enemyStats.range.range;
        }//speed
        if (data == 3) {
            img = `speed?0${app.game.enemyBase.level}`;
            health = enemyStats.speed.health;
            damage = enemyStats.speed.damage;
            speed = enemyStats.speed.speed;
            value = enemyStats.speed.value;
            cost = app.game.charSpeedCost;
            var ranged = false;
            var range = 0;
        }//big boi
        if (data == 4) {
            img = `tank?0${app.game.enemyBase.level}`;
            health = enemyStats.tank.health;
            damage = enemyStats.tank.damage;
            speed = enemyStats.tank.speed;
            value = enemyStats.tank.value;
            cost = app.game.charTankCost;
            var ranged = false;
            var range = 0;
        }


        //negative because base needs to be flipped?
        if(app.game.enemyCurrency - cost < 0) return;
        app.game.enemyCurrency -= cost;
        var charPos = JSON.parse(JSON.stringify(app.game.enemyBase.position))
        charPos.y += 20;
        app.game.enemyCharacters.push(new characterObject(
            img,
            charPos,
            speed,
            health, //health
            damage, //damage
            value,
            ranged,
            range,
            .521,
            -1
        ));

        //console.log(app.game.enemyCharacters);
    });

    socket.on('updateNonHost', (data) => {
        //update lerp values

 //       for (var i = 0; i < app.game.myCharacters.length; i++) {
 //           app.game.myCharacters[i] = data.myCharacters[0];
 //           data.myCharacters.splice(0, 1);
 //       }
 //       //then add the new ones
 //       for (var i = 0; i < data.myCharacters.length; i++) {
 //           app.game.myCharacters.push(data.myCharacters[i]);
 //       }

        //Need to loop through each character in app
        //Compare with the same character from data
        //If they are the same, check to see if apps last update > data last update
        //assign previous positions of data characters to app characters
        //set app character alpha = 0.5

        
        //console.log("characters before:");
        //console.log(app.game.myCharacters);

        lerpData(data);

        //console.log("characters after:");
        for (var i = 0; i < app.game.myCharacters.length; i++) {
            console.log("Dest: " + app.game.myCharacters[0].destPosition.x);
            console.log("Prev: " + app.game.myCharacters[0].prevPosition.x);
            console.log("Pos: " + app.game.myCharacters[0].position.x);
        }

        

        //app.game.myCharacters = data.myCharacters;
        if(app.game.enemyBase.level != data.enemyBase.level){
            var upgradeInfo = upgradeBase(app.game.enemyBase, app.game.enemyTurret, data.enemyBase);
            app.game.enemyBase = upgradeInfo.base;
            app.game.enemyTurret = upgradeInfo.turret;
        }
        if(app.game.myBase.level != data.myBase.level){
            var newInfo = upgradeBase(app.game.myBase, app.game.myTurret, data.myBase);
            app.game.myBase = newInfo.base;
            app.game.myTurret = newInfo.turret;
            app.game.baseCostText.text = app.game.baseCost[newInfo.base.level];
            app.game.upgradeBaseButton.image = getButton(`base?0${newInfo.base.level + 1}?`);
        }
        app.game.enemyCharacters = data.enemies;
        app.game.myBase.health = data.myBase.health;
        app.game.enemyBase.health = data.enemyBase.health;
        app.game.myTurret.rotation = data.myTurretRotation;
        app.game.enemyTurret.rotation = data.enemyTurretRotation;
        app.game.myBullets = data.myBullets;
        app.game.enemyBullets = data.enemyBullets;
        app.game.myCurrency = data.myCurrency;
    });
    socket.on('gameOver', (data) => {
        app.over.win = data.win;
        app.main.currentGameState = app.main.gameState.OVER;
    })
}
function upgradeBase(base, turret, data){
    base.level = data.level
    var level = base.level;
    var stats = app.game.baseLevelStats;
    base.image = stats[level - 1].baseImage;
    turret.image = stats[level - 1].turretImage;
    turret.bulletType = stats[level - 1].bulletType;
    turret.range = stats[level - 1].range;
    turret.damage = stats[level - 1].damage;
    turret.fireRate = stats[level - 1].fireRate;
    turret.imageWidth = turret.image.width;
    turret.imageHeight = turret.image.height;
    turret.width = turret.imageWidth * turret.scale;
    turret.height = turret.imageHeight * turret.scale;

    return {base, turret};
}
function sendOver(win){
    socket.emit('gameOver', {win: win});
    app.over.win = !win;
    app.main.currentGameState = app.main.gameState.OVER;
}
function sendHostNewCharacter(data) {
    //send type of character created.
    socket.emit('createNewEnemyForHost', data);
}
function sendHostUpgradeBase() {
    //send type of character created.
    socket.emit('upgradeBase', {});
}
function sendCharacterList() {
    //Send the new list every 20 ms, flipping the characters
    //console.log(app.game.myCharacters);



    socket.emit('updateNonHost', ({
        enemies: app.game.myCharacters,
        myCharacters: app.game.enemyCharacters,
        myBase: app.game.enemyBase,
        enemyBase: app.game.myBase,
        myBullets: app.game.enemyTurret.bullets,
        myTurretRotation: app.game.enemyTurret.rotation,
        enemyBullets: app.game.myTurret.bullets,
        enemyTurretRotation: app.game.myTurret.rotation,
        myCurrency: app.game.enemyCurrency,
    }));
}

function lerpData(data) {
    for (var i = 0; i < app.game.myCharacters.length; i++) {
        const myChar = app.game.myCharacters[i];
        var alreadyExists = false;
        //check if character exists in the data array
        for (var n = 0; n < data.myCharacters.length; n++) {
            if (myChar.id == data.myCharacters[n].id) {
                //same character in both arrays
                alreadyExists = true;
                //update values

                //check if its old
                if (myChar.lastUpdate <= data.myCharacters[n].lastUpdate) {
                    //update
                    app.game.myCharacters[i].lastUpdate = data.myCharacters[n].lastUpdate;

                    //positions
                    app.game.myCharacters[i].prevPosition = data.myCharacters[n].prevPosition;
                    app.game.myCharacters[i].destPosition = data.myCharacters[n].destPosition;

                    app.game.myCharacters[i].alpha = 0.05;

                    //not lerping
                    app.game.myCharacters[i].position = data.myCharacters[n].position;


                    data.myCharacters.splice(n, 1);
                    //remove the character from the data, since we dont need them anymore
                    break;
                }

            }
        }
        //if our character isnt in the data array, then it means hes dead. remove him.
        if (!alreadyExists) {
            app.game.myCharacters.splice(i, 1);
            i--;
        }
    }

    //now loop through the rest of our data and add the new characters
    for (var i = 0; i < data.myCharacters.length; i++) {
        app.game.myCharacters.push(data.myCharacters[i]);
    }
}

function init(){
    app.main.init();
}
window.onload = init;
