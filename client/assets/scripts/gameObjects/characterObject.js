function characterObject(name, position, speed, health, damage, value, ranged, range, scale, direction){
    this.imageNum = name;
    this.image = getCharacter(this.imageNum);
    this.imageWidth = this.image.width;
    this.imageHeight = this.image.height;
    this.width = this.imageWidth * scale;
    this.height = this.imageHeight * scale;
    //Lerp
    this.position = position;
    this.prevPosition = position;
    this.destPosition = position;
    this.alpha = 0;
    this.lastUpdate = new Date().getTime();

    this.rotation = 0;
    this.speed = speed || 0;
    this.direction = direction || 1;   
    this.scale = scale || 1;
    this.id = `${Date.now()}`;
    this.isColliding = false;
    this.damage = damage || 10;
    this.health = health;
    this.value = value || 10;
    this.ranged = ranged;
    this.range = 200;
    this.fireRate = 1;
    this.fireTimer = 0;
    this.bullets = [];
    this.inRange = false;
}
characterObject.prototype = Object.create(gameObject.prototype);
characterObject.prototype.update = function (dt) {
    //lerp
    this.lastUpdate = new Date().getTime();  
    if (this.alpha < 1) {
        this.alpha += 0.05;
    }
    if(this.ranged){
        for(var i = this.bullets.length - 1; i >= 0; i--){
            this.bullets[i].update(dt);
            if(this.bullets[i].lifeTime > 5)
            this.bullets.splice(i, 1);
        }
        this.fireTimer += dt;
        if(this.fireTimer > (1 / this.fireRate) && this.inRange){
            this.bullets.push(new bulletObject(
                'char', 
                this.damage, 
                this.rotation, 
                {x: 1, y: 0}, //normalized velocity vector 
                {
                    x: this.position.x,
                    y: this.position.y - 20
                }, 
                400,    //bullet speed
                .521,     //scale
                this.direction));
            this.fireTimer = 0;
        }
    }
    


    //this.position.y = lerp(this.prevPosition.y, this.destPosition.y, this.alpha);

	//If the character is colliding with another character, he shouldnt move.
    if (!dt || dt === undefined || this.isColliding || this.inRange) return;
    this.position.x += (this.speed * this.direction) * dt;

    //this.position.x = lerp(this.prevPosition.x, this.destPosition.x, this.alpha);
    //console.log(this.position.x);
}
characterObject.prototype.drawBullets = function (ctx) {
    this.bullets.forEach(bullet => {
        bullet.draw(ctx);
    })
}


