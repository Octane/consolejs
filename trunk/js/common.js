//взято из https://github.com/Octane/jsCore

//Object
//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
	Object.keys = function () {
		var buggedKeys = [
				"constructor", "toString", "toLocaleString", "valueOf",
				"hasOwnProperty", "propertyIsEnumerable", "isPrototypeOf"
			],
			hasOwnProp = Object.prototype.hasOwnProperty,
			enumBug = function () {
				for (var key in {toString: 1}) {
					if (key == "toString") {
						return false;
					}
				}
				return true;
			}();
		function getBuggedKeys(obj) {
			var i = buggedKeys.length, key, keys = [];
			while (i--) {
				key = buggedKeys[i];
				if (hasOwnProp.call(obj, key)) {
					keys.push(key);
				}
			}
			return keys;
		}
		return function (obj) {
			if (obj !== Object(obj)) {
				throw new TypeError("Object.keys called on non-object");
			}
			var key, keys = [];
			for (key in obj) {
				if (hasOwnProp.call(obj, key)) {
					keys.push(key);
				}
			}
			if (enumBug) {
				keys = keys.concat(getBuggedKeys(obj));
			}
			return keys;
		};
	}();
}

//Array
if (!Array.isArray) {
	//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
	Array.isArray = function (obj) {
		return Object.prototype.toString.call(obj) == "[object Array]";
	};
}
if (!Array.prototype.forEach) {
	//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
	Array.prototype.forEach = function(func, boundThis) {
		var i = 0, len = this.length;
		while (i < len) {
			if (i in this) {
				func.call(boundThis, this[i], i, this);
			}
			i++;
		}
	};
}

//Bound Function
//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
	Function.prototype.bind = function () {

		function newApply(Constructor, args) {
			var i = 0, len = args.length, argNames = [];
			while (i < len) {
				argNames.push("arg" + i);
				i++;
			}
			argNames = argNames.join(",");
			return Function("Constructor", argNames, "return new Constructor(" + argNames + ")").apply(window, [Constructor].concat(args));
		}

		return function (boundThis) {
			if (typeof this != "function") {
				throw new TypeError("Function.prototype.bind called on non-function");
			}
			var targetFunc = this, boundArgs = Array.prototype.slice.call(arguments, 1);
			function boundFunc() {
				var allArgs, len;
				function NOP() {}
				if (boundFunc._protoMagic) {
					boundFunc._protoMagic = false;
					NOP.prototype = this;
					NOP.prototype.constructor = targetFunc;
					return new NOP;
				}
				else {
					allArgs = boundArgs.concat(Array.prototype.slice.call(arguments));
					len = allArgs.length;
				}
				if (this && this.constructor == boundFunc) {
					boundFunc._protoMagic = true;
					NOP.prototype = len > 1 ? newApply(targetFunc, allArgs) : (len ? new targetFunc(allArgs[0]) : new targetFunc);
					boundFunc.prototype = new NOP;
					boundFunc.prototype.constructor = boundFunc;
					return new boundFunc;
				}
				return len > 1 ? targetFunc.apply(boundThis, allArgs) : (len ? targetFunc.call(boundThis, allArgs[0]) : targetFunc.call(boundThis));
			}
			boundFunc._protoMagic = false;
			return boundFunc;
		};
	}();
}
