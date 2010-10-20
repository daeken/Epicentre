canvas=ctx=ctime=tstart=tstep=0;
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
	if(c!=undefined) ctx.strokeStyle = c;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function rasterBar(y, o, s) {
	for(i = 0; i < 25; ++i)
		line(0, y+i, cw, y+i, 'hsl(' + (i+o%360)*s + ', 100%, 50%)');
}

function main() {
	timeUpdate();
	
	ctx.clearRect(0, 0, cw, ch);
	rasterBar(tstart/10 % ch, 0, 10);
	
	if(!dead) setTimeout(main, 1000/60);
}

function ready() {
	canvas = document.getElementById('epicentre');
	ctx = canvas.getContext('2d');
	
	main();
}

function stop() {
	dead = true;
}
