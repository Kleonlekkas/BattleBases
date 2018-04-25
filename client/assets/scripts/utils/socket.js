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
    socket.on('createNewEnemyForHost', () => {
        //negative because base needs to be flipped?
        var charPos = JSON.parse(JSON.stringify(app.game.enemyBase.position))
        charPos.y += 20;
        app.game.enemyCharacters.push(new characterObject(
            '01',
            charPos,
            100,
            .15,
            -1
        ));

        //console.log(app.game.enemyCharacters);
    });

    socket.on('updateNonHost', (data) => {
        console.dir(data);
        app.game.myCharacters = data.myCharacters;
        app.game.enemyCharacters = data.enemies;
        app.game.myBase.health = data.myHealth;
        app.game.enemyBase.health = data.enemyHealth;
    });
}
function sendHostNewCharacter(){
    socket.emit('createNewEnemyForHost');
}
function sendCharacterList() {
    //Send the new list every 20 ms, flipping the characters
    //console.log(app.game.myCharacters);
    socket.emit('updateNonHost', ({
        enemies: app.game.myCharacters,
        myCharacters: app.game.enemyCharacters,
        myHealth: app.game.enemyBase.health,
        enemyHealth: app.game.myBase.health
    }));
}

function init(){
    app.main.init();
}
window.onload = init;