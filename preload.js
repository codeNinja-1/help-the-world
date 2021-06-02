var os = require('os');
var fs = require('fs');

var boughtItems = [];

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
	getScore(function (json) {
		score = json.score;
		boughtItems = json.bought;
		level = getLevel();
		loadStats();
		loadList();
	});
	addBtn.onclick = function () {
		setScreen('add');
	};
	addCancelBtn.onclick = function () {
		setScreen('home');
	};
	shopBtn.onclick = function () {
		loadShop();
		setScreen('shop');
	};
	shopCloseBtn.onclick = function () {
		setScreen('home');
	}
});

function timeoutShop() {
	for (var i = 0; i < boughtItems.length; i++) {
		if (Date.now() > boughtItems[i].time + shopItems[boughtItems[i].type].time * 1000) {
			boughtItems = boughtItems.splice(i, 1);
			i--;
		}
	}
}

setInterval(function () {
	timeoutShop();
	save();
}, 10000);

//sets the level

const levels = [
	0,
	25,
	50,
	100,
	150,
	200,
	450,
	700,
	1050
];

const ranks = [
	'Coal',
	'Oil',
	'Hydro',
	'Geothermal',
	'Wind',
	'Solar'
];

const activities = {
	'recycle3Things':{
		'title':'Recycle 3 different things (1 point)',
		'body':'Recycle 3 different things that you normally wouldn\'t. This could be a food package, plasic item, or another recyclable item.',
		'points':1
	},
	'lights2Hours':{
		'title':'Lights for less than 2 hours (5 points)',
		'body':'Have the lights on for less then 2 hours total in a day.',
		'points':5
	},
	'lights1Hour':{
		'title':'Lights for less than 1 hour (10 points)',
		'body':'Have the lights on for less then 1 hours total in a day.',
		'points':10
	},
	'plantAPlant':{
		'title':'Plant a plant (20 points)',
		'body':'Plant a plant in your yard or a community garden.',
		'points':20
	},
	'voteRenewable':{
		'title':'Vote for renewable energy sources (50 points)',
		'body':'Vote to create new renewable energy power plants or remove stop old ones',
		'points':50
	},
	'plantATree':{
		'title':'Plant a tree (100 points)',
		'body':'Plant a tree that helps the enviroment.',
		'points':100
	},
	'pureFriendly1Day':{
		'title':'Go pure enviromental friendly energy for one day (100 points)',
		'body':'Use pure and enviromental friendly energy for 24 hours.',
		'points':100
	},
	'share10People':{
		'title':'Share this with 10 other people (150 points)',
		'body':'Contact 10 other friends, relatives, and even just random people and tell them about the game.',
		'points':150
	},
	'25%Renewable':{
		'title':'Go 25% renewable energy for 1 day (200 points)',
		'body':'Make your house electricity work at least 25% on renewable energy produced at your home. (solar panels, windmill, etc.)',
		'points':200
	},
	'75%Renewable':{
		'title':'Go 75% renewable energy for 1 day (500 points)',
		'body':'Make your house electricity work at least 75% on renewable energy produced at your home. (solar panels, windmill, etc.)',
		'points':500
	},
	'100%Renewable':{
		'title':'Have your house on only renewable energy produced at your home for 1 day (750 points)',
		'body':'Make your house electricity work on only renewable energy produced at your home. (solar panels, watermill, etc.)',
		'points':750
	},
	'electricCar':{
		'title':'Get an electric car (5000 points)',
		'body':'Get an electric car and use it 75% more than a normal car for a week.',
		'points':5000
	}
};

const shopItems = {
	'2x':{
		'title':'Double points for the next 15 minutes (500 points)',
		'body':'You get twice the amount of points when in usage. This will be active for the next 15 minutes after purchase.',
		'cost':500,
		'time':900,
		'multiplier':2
	},
	'2xhour':{
		'title':'Double points for the next hour (2000 points)',
		'body':'This is similar to the earlier one, but it lasts an hour.',
		'cost':2000,
	  'time':3600,
		'multiplier':2
	},
	'3x':{
		'title':'Triple points for the next 30 minutes (5000 points)',
		'body':'For the next 30 minutes after purchasing this item, your points are tripled.',
		'cost':5000,
		'time':1800,
		'multiplier':3
	}
};

let score = 0;

let level = getLevel();

function loadStats() {
	document.getElementById('score').textContent = score;
	document.getElementById('level').textContent = 'Level ' + (level + 1) + ' (' + (getLevelPoints(level + 1) - score) + ' more points to next level)';
}

function getLevel() {
	var index = 0;
	while (true && index < 10000) {
		if (getLevelPoints(index) > score) {
			return index - 1;
		}
		index++;
	}
	return 10000;
}

function getAppFolderPath() {
	if (process.platform === 'darwin') {
		return os.homedir() + '/Library/Application Support/Global Warming Game/';
	} else {
		return os.homedir() + '/';
	}
}

function getScore(callback) {
	fs.access(getAppFolderPath(), function(error) {
	  if (error) {
			fs.mkdir(getAppFolderPath(), function (error) {
				if (error) {
					throw error;
					return;
				}
				fs.writeFile(getAppFolderPath() + 'save.json', '{"score":0, "bought":[]}', function (error) {
					read();
				});
			});
	  } else {
			read();
	  }
	});
	function read() {
		fs.readFile(getAppFolderPath() + 'save.json', function (error, data) {
			if (error) {
				throw error;
				return;
			}
			var json;
			try {
				json = JSON.parse(data);
			} catch (err) {
				throw err;
				return;
			}
			callback(json);
		});
	}
}

function loadList() {
	document.getElementById('list').innerHTML = '';
	for (var i = 0; i < Object.keys(activities).length; i++) {
		loadElement(Object.keys(activities)[i]);
	}
	function loadElement(key) {
		var card = document.createElement('div');
		card.classList.add('card');
		card.setAttribute('option-id', key);
		var title = document.createElement('div');
		title.classList.add('title');
		title.textContent = activities[key].title;
		card.appendChild(title);
		var body = document.createElement('div');
		body.classList.add('body');
		body.textContent = activities[key].body;
		card.appendChild(body);
		var button = document.createElement('button');
		button.textContent = 'Done';
		button.onclick = function () {
			increaseScore(activities[this.parentElement.getAttribute('option-id')].points);
			level = getLevel();
			loadStats();
			loadList();
			setScreen('home');
		};
		card.appendChild(button);
		document.getElementById('list').appendChild(card);
	}
}
function loadShop() {
	document.getElementById('shopList').innerHTML = '';
	for (var i = 0; i < Object.keys(shopItems).length; i++) {
		loadElement(Object.keys(shopItems)[i]);
	}
	function loadElement(key) {
		var card = document.createElement('div');
		card.classList.add('card');
		card.setAttribute('option-id', key);
		var title = document.createElement('div');
		title.classList.add('title');
		title.textContent = shopItems[key].title;
		card.appendChild(title);
		var body = document.createElement('div');
		body.classList.add('body');
		body.textContent = shopItems[key].body;
		card.appendChild(body);
		var button = document.createElement('button');
		button.textContent = 'Buy';
		button.onclick = function () {
			if (score < shopItems[this.parentElement.getAttribute('option-id')].cost) {
				alert("You do not have enough points to purchase this item");
				return;
			}
			score -= shopItems[this.parentElement.getAttribute('option-id')].cost;
			boughtItems.push({id:this.parentElement.getAttribute('option-id'), time:Date.now()});
			level = getLevel();
			loadStats();
			loadList();
			setScreen('home');
		};
		card.appendChild(button);
		document.getElementById('shopList').appendChild(card);
	}
}
function setScreen(name) {
	for (var index = 0; index < document.getElementsByClassName('section').length; index++) {
		document.getElementsByClassName('section')[index].classList.remove('active');
	}
	document.getElementById(name).classList.add('active');
}
function increaseScore(amount) {
	var multiplier = 1;
	for (var i = 0; i < boughtItems.length; i++) {
		multiplier *= shopItems[boughtItems[i].id].multiplier;
	}
	score += Math.round(amount * multiplier);
	level = getLevel();
	loadStats();
	loadList();
}

function save() {
	fs.writeFile(getAppFolderPath() + 'save.json', JSON.stringify({score:score, bought:boughtItems}), function () {
		console.log("Saved progress.");
	});
}

function getLevelPoints(number) {
	return Math.round(((number * 8.5) ** 1.5) / 5) * 5;
}
