function buttonObject(image, position, scale){
    this.imageNum = image,
    this.image = getButton(this.imageNum);
    this.width = this.image.width;
    this.height = this.image.height;
    this.position = position;
    this.scale = scale || 1;
	this.isClicked = false;
}
buttonObject.prototype = Object.create(gameObject.prototype);
//Takes in a function to call, and its parameters
//This way we can call whatever functions we need for the specific button
buttonObject.prototype.update = function(funcToCall, para){
    funcToCall(para);
}
buttonObject.prototype.hover = function(correctPosition){
    let pos = this.position
    let scale = this.scale || 1;
    if(correctPosition){
        pos = {
            x: (this.position.x - ((this.width / 2) * scale)),
            y: (this.position.y - ((this.height / 2) * scale))
        }
    }
    let buttonRect = {
        width: this.width * scale,
        height: this.height * scale,
        pos: pos
    };
    if(pointInRect(app.main.mouse,buttonRect)) 
    {
        app.main.canvas.style.cursor = 'pointer';
        return true;
    }
    return false;
}
buttonObject.prototype.hold = function(correctPosition){
    if(!this.hover(correctPosition)){
        return false;
    }
    if(app.main.mouseDown){
        return true;
    }
    return false;
}
buttonObject.prototype.clicked = function(correctPosition){
    if(!this.hover(correctPosition)){
        return false;
    }
    if(app.main.clicked){
        return true;
    }
    return false;
}