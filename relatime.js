// reltime.js 0.1 - relative date display
// https://github.com/nikopol/reltime.js
// niko 2013

/*

display dates in a relative form.
eg: relatime.text('2013-11-14T13:24:43.310Z') => '2 minutes ago'.

methods:

setup(opt)      setup relatime parameters :
                  opt.locale     (by default navigator.language or en)
                  opt.tag        (by default "span")
                  opt.classname  tag.classname (by default "relatime")
                  opt.refresh    auto-updates interval in seconds (by default 60)

locale('fr')    force locale. actually en/fr/de are supported

locale()        return the current locale

start()         start the auto-update of displayed dates
                by default auto-updates are automatically started
                when html(date) is called

stop()          stop the auto-update of displayed dates

started()       return true if auto-update is started

text(date)      return a relative representation of date
                date can be a string or a Date object
                eg: "one hour ago"

html(date)      return a relative representation of date
                embedded in an auto-updated span
                date can be a string or a Date object
                eg: "<span class="relatime" data-date="2013-11-14T13:24:43.310Z" title="11/14/2013, 2:24:43 PM">one hour ago</span>"

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
			month: {s:'last month',p:'%d months ago'}
		},
		fr: {
			now: "a l'instant",
			min: {s:'il y a %d minute',p:'il y a %d minutes'},
			hour: {s:'il y a %d heure',p:'il y a %d heures'},
			day: {s:'hier',p:'il y a %d jours'},
			week: {s:'la semaine dernière',p:'il y a %d semaines'},
			month: {s:'le mois dernier',p:'il y a %d mois'}
		},
		de: {
			now: 'soeben',
			min: {s:'vor einer Minute',p:'vor %d Minuten'},
			hour: {s:'vor einer Stunde',p:'vor %d Stunden'},
			day: {s:'gestern',p:'vor %d Tagen'},
			week: {s:'vor einer Woche',p:'vor %d Wochen'},
			month: {s:'vor einem Monat',p:'vor %d Monaten'}
		}
	},
	loc = 'en',
	tag = 'span',
	classname = 'relatime',
	timer = false,
	autostart = true,
	refresh = 60*1000,
	locale = function(l) {
		if(l!=undefined && dic[l]) loc=l;
		return loc;
	},
	stop = function() {
		if(timer!==false) {
			clearInterval(timer);
			timer = false;
		}
	},
	start = function() {
		stop();
		timer = setInterval(function(){
			var i=0,e,d,nl = document.querySelectorAll(tag+'.'+classname);
			while( i<nl.length ) {
				e = nl[i];
				d = e.getAttribute('data-date');
				if(d) e.innerText = text(epoc(d));
				++i;
			}
		}, 1*1000);
	},
	started = function() {
		return timer!==false;
	},
	setup = function(opt) {
		opt.tag && (tag=opt.tag);
		opt.classname && (classname=opt.classname);
		opt.locale && locale(opt.locale);
		opt.lang && locale(opt.lang);
		if( opt.refresh ) {
			refresh=1000*opt.refresh;
			if(started()) start();
		}
		(opt.autostart!==undefined) && (autostart=opt.autostart);
	},
	epoc = function(d) {
		var
		d1 = d instanceof Date ? d : new Date(d),
		d2 = new Date();
		return Math.floor((d2.getTime() - d1.getTime()) / 1000);
	},
	fmt = function(t,n){
		n = Math.round(n);
		return dic[loc][t][n>1?'p':'s'].replace('%d',n);
	},
	text = function(e) {
		if(e<60)      return dic[loc].now;
		if(e<3600)    return fmt('min',e/60); 
		if(e<86400)   return fmt('hour',e/3600);
		if(e<604800)  return fmt('day',e/86400);
		if(e<2592000) return fmt('week',e/604800);
		return fmt('month',e/2592000);
	},
	html = function(s) {
		var
		d = s instanceof Date ? s : new Date(s),
		e = epoc(d),
		t = text(e);
		if(e>2592000) return '<'+tag+' title="'+d.toLocaleString()+'">'+t+'</'+tag+'>';
		if(autostart && !started()) start();
		return '<'+tag+' class="'+classname+'" data-date="'+d.toISOString()+'" title="'+d.toLocaleString()+'">'+t+'</'+tag+'>';
	};

	locale(navigator.language);

	return {
		setup: setup,
		start: start,
		stop: stop,
		locale: locale,
		started: started,
		text: function(d,o){ o && setup(o); return text(epoc(d)); },
		html: function(d,o){ o && setup(o); return html(d); }
	};

})();
