function textObject(text, position, color, align, font, size){
    this.text = text;
    this.position = position;
    this.font = font || 'serif';
    this.size = size || '12';
    this.align = align || 'center';
    this.color = color || '#000';
}
textObject.prototype = Object.create(gameObject.prototype);
textObject.prototype.draw = function(ctx){
    ctx.save();

    //not all objects will have rotation, if not then set rotation to 0
    var rot = this.rotation || 0;        
    var scale = this.scale || 1;   
    rot = (this.rotation * Math.PI) / 180;  //convert rotation to radians

    ctx.rotate(rot);
    ctx.scale(scale,scale);
    ctx.translate(this.position.x / scale, this.position.y / scale );
    ctx.fillStyle = this.color;

    ctx.textAlign = this.align;
    ctx.font = `${this.size}px ${this.font}`;
    ctx.fillText(`${this.text}`, 0, 0);

    ctx.restore();
}
textObject.prototype.update = function(dt){
    if(!dt || dt === undefined) return;
    this.position.x += this.speed * dt;
}