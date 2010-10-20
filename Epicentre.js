var canvas, ctx, ctime = 0, time;

function timeUpdate() {
	ntime = (new Date).getTime();
	if(ctime != 0)
		time = ntime - ctime;
	ctime = ntime;
}

function rasterBars() {
}

function main() {
	timeUpdate();
	
	rasterBars();
}

function ready() {
	canvas = document.getElementById('epicentre');
	ctx = canvas.getContext('2d');
	
	timeUpdate();
	setInterval(main, 1000/60);
}
