function foreach (array, fn) {
	var deletion = [], i, broke = false;
	for (i = 0; i < array.length; ++ i) {
		if (fn(array[i], i, deletion)) {
			broke = true;
			break;
		}
	}
	deletion.sort(function (a, b) { return a - b; });
	for (i = 0; i < deletion.length; ++ i)
		array.remove(deletion[i] - i);
	return broke;
}

function forevery (dictionary, fn, includePrototype) {
	var deletion = [], broke = false;
	for (var key in dictionary) {
		if (key === "_" && !includePrototype)
			continue;
		if (fn(dictionary[key], key)) {
			broke = true;
			break;
		}
	}
	for (var i = 0; i < deletion.length; ++ i)
		delete dictionary[deletion[i]];
	return broke;
}

function _ (_object, _path) {
	object = { object : _object };
	path = _path.trim();
	if (/^ ?[~\-=]> ?/.test(path))
		path = "object " + path;
	else
		path = "object => " + path;
	// Special cases to speed up trivial path traversals
	var checkForProperty = path.slice(-1) === "?", specialCase = path.split(/ ?[~\-=]> ?/g);
	if (specialCase.length === 2) {
		if (checkForProperty) {
			return object.object.hasOwnProperty(specialCase[1].slice(0, -1));
		} else {
			if (object.object.hasOwnProperty(specialCase[1]))
				return object.object[specialCase[1]];
			else throw "That object has no property with the path: " + path;
		}
	}
	var oSpecialCase = path.split(/ ?[~\-]> ?/g);
	if (oSpecialCase.length === 1) {
		var property = object.object;
		while ((specialCase = specialCase.slice(1)).notEmpty()) {
			if (checkForProperty && specialCase.length === 1) {
				property = property.hasOwnProperty(specialCase.first().slice(0, -1));
			} else {
				if (property.hasOwnProperty(specialCase.first()))
					property = property[specialCase.first()];
				else throw "That object has no property with the path: " + path;
			}
		}
		return property;
	}
	// End of special cases
	var subpaths = path.split(/ ?=> ?/g), routes = [];
	for (var index = 0, subpath, keys; index < subpaths.length; ++ index) {
		subpath = subpaths[index];
		routes.unshift([]);
		keys = subpath.split(/ ?-> ?/g);
		for (var length = keys.length; length > 0; -- length) {
			routes[0].push(keys.slice(0, length).join(" => "));
		}
	}
	var paths = [], burrow = function (index, current) {
		for (var route = 0, next; route < routes[index].length; ++ route) {
			next = (current ? current + " => " : "") + routes[index][route];
			if (index > 0) {
				burrow(index - 1, next);
			} else
				paths.push(next);
		}

	};
	burrow(routes.length - 1, "");
	var error = {};
	var follow = function (object, path) {
		var keys = path.replace(/ ?~> ?/g, " => ").split(/ ?=> ?/g), value = object, key;
		while (keys.length) {
			key = keys.shift();
			if (keys.length || key.substr(-1) !== "?") {
				if (value.hasOwnProperty(key))
					value = value[key];
				else if (value.hasOwnProperty(key = key.replace(/ ?\(.*\)/, "")))
					value = value[key];
				else {
					error.message = "That object has no property with the path: " + path;
					return error;
				}
			} else
				return value.hasOwnProperty(key.slice(0, -1));
		}
		return value;
	}
	for (var take = 0, returned; take < paths.length; ++ take) {
		returned = follow(object, paths[take]);
		if (returned !== error) {
			return returned;
		}
	}
	throw "That object has no property with the path: " + path;
}

function _method (object) {
	return object._ = function (path) {
		return _(object, path);
	}
}

function random (x, y) {
	if (arguments.length === 0)
		return Math.random();
	if (arguments.length === 1)
		return Math.random() * x;
	else if (arguments.length === 2)
		return Math.min(x, y) + Math.random() * Math.abs(x - y);
}

function randomInt (x, y) {
	if (arguments.length === 1)
		return Math.round(random(x));
	else if (arguments.length === 2)
		return Math.round(random(x, y));
}

function roundTo (x, y) {
	return Math.round(x / y) * y;
}

function chance (x) {
	return randomInt(x - 1) === 0;
}

function choose () {
	return arguments[randomInt(arguments.length - 1)];
}

function chooseWeighted () {
	var r = random(0, 1), accumulator = 0;
	for (var i = 0, choice; i < arguments.length; ++ i) {
		choice = arguments[i];
		if (r <= (accumulator += choice.probability)) {
			return choice.value;
		}
	}
}

function range (from, to, step) {
	if (arguments.length < 3)
		step = 1;
	var array = [];
	for (var i = from; i <= to; i += step) {
		array.push(i);
	}
	return array;
}

function inRange(x, a, b, exclusive) {
	return (x >= Math.min(a, b) + (exclusive ? 1 : 0) && x <= Math.max(a, b) - (exclusive ? 1 : 0));
}

Math.sign = function (x) {
	return x > 0 ? 1 : x === 0 ? 0 : -1;
};

Math.clamp = function (lowest, value, highest) {
	return Math.min(highest, Math.max(lowest, value));
};

Math.mod = function (x, y) {
	return ((x % y) + y) % y;
};

function commaSeparatedList (list, ampersand) {
	if (list.length === 0)
		return "";
	if (list.length === 1)
		return "" + list[0];
	return list.slice(0, -1).join(", ") + " " + (ampersand ? "&" : "and") + " " + list[list.length - 1];
}

function capitalise (word) {
	return word.substr(0, 1).toUpperCase() + word.substr(1);
}

function wrapArray (wrap) {
	return Array.isArray(wrap) ? wrap : [wrap];
}

function sum (array, partial) {
	var result = 0, partialAmount = partial;
	if (arguments.length < 2)
		partialAmount = array.length;
	foreach(array, function (number) {
		result += number * Math.min(1, partialAmount --);
		if (partialAmount <= 0)
			return true;
	});
	return result;
}

function product (array) {
	var result = 1;
	foreach(array, function (number) {
		result *= number;
	});
	return result;
}

Array.prototype.insert = function (index, elements) {
	var self = this;
	if (!Array.isArray(elements))
		elements = [elements];
	foreach(elements, function (element, i) {
		self.splice(index + i, 0, element);
	});
};

Array.prototype.isSimilarTo = function (other) {
	if (this.length !== other.length)
		return false;
	var self = this.slice(0), other = other.slice(0), numerically = function (a, b) { return a - b; };
	self.sort(numerically);
	other.sort(numerically);
	var length = self.length
	for (var i = 0; i < length; ++ i)
		if (JSON.stringify(self.shift()) !== JSON.stringify(other.shift()))
			return false;
	return true;
};

Array.prototype.removeDuplicates = function () {
	var unique = {}, filtered = [];
	foreach(this, function (element) {
		unique[JSON.stringify(element)] = element;
	});
	forevery(unique, function (element) {
		filtered.push(element);
	});
	return filtered;
};

Array.prototype.remove = function (index, number) {
	if (index >= 0 && index < this.length) {
		var numberOfElements = number;
		if (arguments.length < 2)
			numberOfElements = 1;
		this.splice(index, numberOfElements);
	}
};

Array.prototype.removeElementsOfValue = function (element) {
	while (this.contains(element))
		this.remove(this.indexOf(element));
};

Array.prototype.choose = function () {
	return this[randomInt(this.length - 1)];
};

Array.prototype.empty = function () {
	return this.length === 0;
};

Array.prototype.notEmpty = function () {
	return this.length !== 0;
};

Array.prototype.first = function () {
	return this[0];
};

Array.prototype.last = function () {
	return this[this.length - 1];
};

function JSONCopy (object, copyFunctionsToo) {
	var data = JSON.parse(JSON.stringify(object));
	if (copyFunctionsToo) {
		function dig (obj, datum) {
			forevery(obj, function (value, key) {
				if (typeof value === "function")
					datum[key] = value;
				else if (typeof value === "object")
					dig(value, data[key]);
			});
		}
		dig(object, data);
	}
	return data;
}


Array.prototype.contains = function (element) {
	return this.indexOf(element) > -1;
};

Array.prototype.pushIfNotAlreadyContained = function (element) {
	if (!this.contains(element)) {
		this.push(element);
		return true;
	}
	return false;
};

CanvasRenderingContext2D.prototype.fillCircle = function (x, y, radius, _arcAngle) {
	var arcAngle = (arguments.length < 4 ? 2 * Math.PI : _arcAngle);
	this.beginPath();
	this.arc(x, y, radius, 0, arcAngle, false);
	this.fill();
};

function article (word) {
	return (["a", "e", "i", "o", "u"].contains(word.charAt(0).toLowerCase()) ? "an" : "a");
}

function numberword (number) {
	switch (number) {
		case 0:
			return "no";
		case 1:
			return "one";
		case 2:
			return "two";
		case 3:
			return "three";
		case 4:
			return "four";
		case 5:
			return "five";
		case 6:
			return "six";
		case 7:
			return "seven";
		case 8:
			return "eight";
		case 9:
			return "nine";
	}
	// Otherwise
	return "" + number;
}

function quantityWord (times) {
	switch (times) {
		case 1:
			return "once";
		case 2:
			return "twice";
		case 3:
			return "thrice";
	}
	return numberword(times) + " times";
}

Matrix = function (matrix) {
	var self = this;
	if (arguments.length)
		self.matrix = matrix;
	else
		self.matrix = Matrix.identity();
	self.multiply = function (by) {
		if (Array.isArray(by))
			return new Matrix([by[0] * self.matrix[0] + by[2] * self.matrix[1], by[1] * self.matrix[0] + by[3] * self.matrix[1], by[0] * self.matrix[2] + by[2] * self.matrix[3], by[1] * self.matrix[2] + by[3] * self.matrix[3], by[0] * self.matrix[4] + by[2] * self.matrix[5], by[1] * self.matrix[4] + by[3] * self.matrix[5] + by[5]]);
		else
			return new Matrix([self.matrix[0] * by, self.matrix[1] * by, self.matrix[2] * by, self.matrix[3] * by, self.matrix[4] * by, self.matrix[5] * by]);
	};
	self.scale = function (amount) {
		return self.multiply(amount);
	};
	self.rotate = function (radians, anticlockwise) {
		if (anticlockwise)
			radians = - radians;
		var c = Math.cos(radians), s = Math.sin(radians);
		return self.multiply([c, s, - s, c, 0, 0]);
	};
	self.applyToContext = function (context) {
		context.transform(self.matrix[0], self.matrix[1], self.matrix[2], self.matrix[3], self.matrix[4], self.matrix[5]);
	}
};
Matrix.identity = function () {
	return [1, 0, 0, 1, 0, 0];
};