// relatime.js 0.2 - relative date time display and update
// https://github.com/nikopol/reltime.js
// niko 2013

/*
display dates in a relative form and automatically update them every minutes.

methods:

setup(opt)      setup relatime parameters :
                  opt.locale     (by default navigator.language or en)
                  opt.tag        (by default "time")
                  opt.classname  tag.classname (by default "relatime")
                  opt.refresh    auto-updates interval in seconds (by default 60)

locale('fr')    force locale. actually en/fr/de are supported

locale()        return the current locale

start()         start the auto-update of displayed dates
                by default auto-updates are automatically started
                when html(date) is called

start(opt)      same shit but with setup option provided

stop()          stop the auto-update of displayed dates

started()       return true if auto-update is started

text(date)      return a relative representation of date
                date can be a string or a Date object
                eg: "one hour ago"

html(date)      return a relative representation of date
                embedded in an auto-updated span
                date can be a string or a Date object
                eg: "<time class="relatime" datetime="2013-11-14T13:24:43.310Z" title="11/14/2013, 2:24:43 PM">one hour ago</span>"

*/

var relatime = (function(){
	"use strict";
	var
	dic = {
		en: {
			now: 'now',
			min: {s:'one minute ago',p:'%d minutes ago'},
			hour: {s:'one hour ago',p:'%d hours ago'},
			day: {s:'yesterday',p:'%d days ago'},
			week: {s:'last week',p:'%d weeks ago'},
			month: {s:'last month',p:'%d months ago'},
			year: {s:'one year ago',p:'%d years ago'}
		},
		fr: {
			now: "a l'instant",
			min: {s:'il y a %d minute',p:'il y a %d minutes'},
			hour: {s:'il y a %d heure',p:'il y a %d heures'},
			day: {s:'hier',p:'il y a %d jours'},
			week: {s:'la semaine dernière',p:'il y a %d semaines'},
			month: {s:'le mois dernier',p:'il y a %d mois'},
			year: {s:'il y a un an',p:'il y a %d ans'}
		},
		de: {
			now: 'soeben',
			min: {s:'vor einer Minute',p:'vor %d Minuten'},
			hour: {s:'vor einer Stunde',p:'vor %d Stunden'},
			day: {s:'gestern',p:'vor %d Tagen'},
			week: {s:'vor einer Woche',p:'vor %d Wochen'},
			month: {s:'vor einem Monat',p:'vor %d Monaten'},
			year: {s:'vor einem Jahr',p:'vor %d Jahren'}
		}
	},
	loc = 'en',
	tag = 'time',
	classname = 'relatime',
	timer = false,
	autostart = true,
	interval = 60*1000,
	datobj = function(d) {
		return d instanceof Date ? d : new Date(d);
	},
	delta = function(d) {
		var
		d1 = datobj(d),
		d2 = new Date();
		return Math.floor((d2.getTime() - d1.getTime()) / 1000);
	},
	fmt = function(t,n){
		n = Math.round(n);
		return dic[loc][t][n>1?'p':'s'].replace('%d',n);
	},
	text = function(d,_){
		var e = _?_:delta(d);
		if(e<60)       return dic[loc].now;
		if(e<3600)     return fmt('min',e/60); 
		if(e<86400)    return fmt('hour',e/3600);
		if(e<604800)   return fmt('day',e/86400);
		if(e<2592000)  return fmt('week',e/604800);
		if(e<31536000) return fmt('month',e/2592000);
		return fmt('year',e/31536000);
	},
	refresh = function(){
		var e, d, i=0, nl = document.querySelectorAll(tag+'.'+classname);
		console.log('[relatime] refreshing',nl.length,'date');
		while( i<nl.length ) {
			e = nl[i];
			d = e.getAttribute('datetime');
			if(d) e.innerText = text(d);
			++i;
		}
	},
	locale = function(l){
		if(l!=undefined && l!=loc && dic[l]) {
			loc=l;
			setTimeout(refresh,9);
		}
		return loc;
	};

	locale(navigator.language);

	return {
		setup: function(opt){
			opt.tag && (tag=opt.tag);
			opt.classname && (classname=opt.classname);
			opt.locale && locale(opt.locale);
			if( opt.interval ) {
				interval=1000*opt.interval;
				if(this.started()) this.start();
			}
			(opt.autostart!==undefined) && (autostart=opt.autostart);
			return this;
		},
		locale: locale,
		start: function(opt){
			if(opt) this.setup(opt);
			this.stop();
			if(interval>500) refresh();
			timer = setInterval(refresh,interval);
			return this;
		},
		started: function(){
			return timer!==false;
		},
		stop: function(){
			if(timer!==false) {
				clearInterval(timer);
				timer = false;
			}
			return this;
		},
		text: text,
		html: function(s) {
			var
			d = datobj(s),
			e = delta(d),
			t = text(d,e);
			if(e>2592000) return '<'+tag+' title="'+d.toLocaleString()+'">'+t+'</'+tag+'>';
			if(autostart && !this.started()) this.start();
			return '<'+tag+' class="'+classname+'" datetime="'+d.toISOString()+'" title="'+d.toLocaleString()+'">'+t+'</'+tag+'>';
		}
	};

})();
