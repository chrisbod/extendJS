(function xtendFactory() {
	function XtendPrivatePropertyFilter(filter) {
		if (filter === true || (!filter && filter !== 0)) {
			throw "Illegal filter ("+filter+") argument (xtend.js)"
		}
		this.filter = filter;
		this.filterProperty = this.resolvePropertyFilterMethod();
	}
	XtendPrivatePropertyFilter.prototype = {
		filterProperty: void Function,
		resolvePropertyFilterMethods: function () {
			switch (this.filter.constructor) {
				case String		:
				case Number		: {
					return this.filterPropertyUsingDirectComparison;
				}
				case Function	: {
					return this.filterPropertyUsingFunction;
				}
				case Array		: {
					this.filter = this.convertArrayToRegularExpression(this.filter);
					return this.filterPropertyUsingRegularExpression;
				}
				case RegExp		: {
					return this.filterPropertyUsingRegularExpression;
				}
				default			: {
					return this.filterPropertyUsingObject;
				}
			}
		},
		convertArrayToRegularExpression: function (filter) {
			if (typeof filter.join !== "function") {
				filter = this.convertNumericallyIndexedCollectionToArray(filter);
			}
			return new RegExp("^("+filter.join("|")+")$");
		},
		filterPropertyUsingDirectComparison: function (propertyName) {
			return propertyName === this.filter;
		},
		filterPropertyUsingFunction: function () {
			return this.filter.apply(null,arguments);
		},
		filterPropertyUsingRegularExpression: function (propertyName) {
			return this.filter.test(propertyName);
		},
		filterPropertyUsingObject: function (propertyName) {
			return propertyName in this.filter;
		},
		filterProperty: null
	};
	this.xtend = function xtend(targetObject, sourceObject, overwritePropertiesInSourceObject, filter) {
		for (var propertyName in sourceObject) {
			
		
		}
	}
	for (var propertyName in sourceObject) {
		if (!targetObject.hasOwnProperty(propertyName) || overwritePropertiesInSourceObject) {
			
		
		}
	
	}
})()