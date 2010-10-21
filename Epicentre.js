cb=pcanvas=pctx=canvas=ctx=ctime=tstart=tstep=0;
cw=640; ch=480;
M = Math;
dead = false;

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

var chsl;

function hsl(h, s, l, t) {
	h = M.floor((h + 360) % 360);
	
	if(t === undefined && s == 100 && l == 50) {
		if(chsl == undefined) {
			chsl = [];
			for(var i = 0; i < 360; ++i)
				chsl[i] = hsl(i, s, l, 0);
		}
		return chsl[h];
	}
	
	h = h / 360;
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

function plasma(x, y, w, h, t, g) {
	pixels(x, y, x+w, y+h, function(p) {
		cx = M.sin(t) * t;
		cy = t;
		for(i = 0; i < w; i += g)
			for(j = 0; j < h; j += g) {
				a = (M.sin((i + t) / 40.74) + 1.0) / 2.0;
				b = (M.sin(distance(i, j, cx, cy) / 40.74) + 1.0) / 2.0;
				c = (a + b) / 2;
				c = hsl(c * 360, 100, 50);
				for(gi = 0; gi < g; ++gi)
					for(gj = 0; gj < g; ++gj)
						p(i+gi, j+gj, c);
			}
	});
}

function circle(x, y, d, c) {
	if(c!=undefined) ctx.strokeStyle = 'rgb(' + c[0] + ', ' + c[1] + ', ' + c[2] + ')';
	ctx.beginPath();
	ctx.arc(x, y, d, 0, M.PI*2, false);
	ctx.stroke();
}

function concircle(x, y, c) {
	for(var i = 1; i < 50; i += 1)
		circle(x, y, i*2, c);
}

function moire(x, y, t, s) {
	var xo = M.sin(t / 250) * 75;
	var yo = M.cos(t / 250) * 75;
	for(var i = 0; i < 6; ++i) {
		var a = t * i / 1000;
		var c = M.cos(a);
		var s = M.sin(a);
		concircle(x + xo * c - yo * s, y + yo * c + xo * s, [255, 255, 255]);
	}
}

function sineScreen(push, t) {
	idata = ctx.createImageData(cw, ch);
	id = idata.data;
	od = ctx.getImageData(0, 0, cw, ch).data;
	
	for(o = 0, y = 0; y < ch; ++y) {
		po = M.floor(M.sin(y * t) * push);
		for(x = 0; x < cw; ++x, o += 4) {
			tx = (x + po + cw) % cw;
			oo = (tx + y * cw) * 4;
			id[o] = od[oo];
			id[o+1] = od[oo+1];
			id[o+2] = od[oo+2];
			id[o+3] = od[oo+3];
		}
	}
	ctx.putImageData(idata, 0, 0);
}

function main() {
	timeUpdate();
	
	cb ^= 1;
	ctx = pctx[cb];
	
	ctx.clearRect(0, 0, cw, ch);
	
	g = M.floor(M.sin(tstart / 1000) * 10 + 10);
	plasma(100, 100, 250, 250, tstart, g == 0 ? 1 : g);
	//rasterBar(tstart / 20 % ch, M.floor(M.sin(tstart / 100) * 2), 12);
	//rasterBar(tstart / 10 % ch, 0, 12);
	//moire(250, 250, tstart);
	
	sineScreen((g - 10) / 2, tstart / 10);
	
	pcanvas[0].style.visibility = (cb == 0) ? 'visible' : 'hidden';
	pcanvas[1].style.visibility = (cb == 1) ? 'visible' : 'hidden';
	
	if(!dead) setTimeout(main, 1000/60);
}

function ready() {
	pcanvas = [document.getElementById('a'), document.getElementById('b')];
	pctx = [pcanvas[0].getContext('2d'), pcanvas[1].getContext('2d')];
	
	main();
}

function stop() {
	dead = true;
}
