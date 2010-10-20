canvas=ctx=ctime=tstart=tstep=0;
cw=640; ch=480;
M = Math;
dead = false;
img=null;

function timeUpdate() {
	ntime = (new Date).getTime();
	if(ctime != 0)
		tstep = ntime - ctime;
	tstart += tstep;
	ctime = ntime;
}

function line(x1, y1, x2, y2, c) {
	if(c!=undefined) ctx.strokeStyle = 'rgb(' + c[0] + ', ' + c[1] + ', ' + c[2] + ')';
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function hsl(h, s, l){
	h = ((h + 360) % 360) / 360;
	s = s / 100;
	l = l / 100;
	if(s == 0){
		r = g = b = l;
	}else{
		function hue2rgb(p, q, t){
			if(t < 0) t += 1;
			if(t > 1) t -= 1;
			if(t < 1/6) return p + (q - p) * 6 * t;
			if(t < 1/2) return q;
			if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		}

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}

	return [r * 255, g * 255, b * 255];
}

function rasterBar(y, o, s) {
	for(i = 0; i < 25; ++i)
		line(0, y+i, cw, y+i, hsl((i+o%360)*s, 100, 50));
}

function pixels(x1, y1, x2, y2, func) {
	aw = x2-x1;
	ah = y2-y1;
	idata = ctx.getImageData(x1, y1, aw, ah);
	func(
		function(x, y, c) {
			o = (x + y*aw) * 4;
			if(c == undefined)
				return idata.data.slice(o, o+4);
			else {
				idata.data[o] = c[0];
				idata.data[o+1] = c[1];
				idata.data[o+2] = c[2];
				idata.data[o+3] = 255;
			}
		}
	);
	ctx.putImageData(idata, x1, y1);
}

function distance(x1, y1, x2, y2) {
	x1 -= x2;
	y1 -= y2;
	return M.sqrt(x1*x1 + y1*y1);
}

function plasma(x, y, w, h, t) {
	pixels(x, y, x+w, y+h, function(p) {
		cx = (M.sin(t) + 1.0) / 2.0 * w;
		cy = (M.cos(t) + 1.0) / 2.0 * h;
		for(i = 0; i < w; ++i)
			for(j = 0; j < h; ++j) {
				a = M.sin((i + t) / 40.74);
				b = M.sin(distance(i, j, cx, cy) / 40.74);
				c = (a + b + 2.0) / 4.0;
				p(i, j, hsl(c * 360, 100, 50));
			}
	});
}

function rotozoom(x, y, pic, t) {
    ctx.save();
    th = 0.175 * t;
    zs = (0.1 * t) % 4;
    if (zs > 2) {
        zs = -(zs-4);
    }
    z = 0.5+zs;
    console.log(z);
    ctx.translate(x,y);
    ctx.rotate(th);
    ctx.scale(z,z);
    ctx.drawImage(pic, -(pic.width/2), -(pic.height/2));
    ctx.restore();
}

function main() {
	timeUpdate();

	ctx.clearRect(0, 0, cw, ch);
    
        rotozoom(500,300, img, tstart/100);

	plasma(100, 100, 250, 250, tstart / 100);
	rasterBar(tstart / 20 % ch, M.floor(M.sin(tstart / 100) * 2), 12);
        rasterBar(tstart / 10 % ch, 0, 12);
        
	if(!dead) setTimeout(main, 1000/60);
}

function ready() {
    canvas = document.getElementById('epicentre');
    ctx = canvas.getContext('2d');
    img = document.getElementById('pic');
    
    main();
}

function stop() {
	dead = true;
}
