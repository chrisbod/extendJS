//core function
this.xtend = function xtend(targetObject, sourceObject, filter) {
	//default is false when not passed
	if (typeof filter === "undefined" || typeof filter === "null") {
		filter = false; 
	}
	//convert the filter into a PropertyFilter if it is not already
	if (filter.hasOwnProperty("filterProperty")) {
		filter = new this.PropertyFilter(filter);
	}
	for (var propertyName in sourceObject) {
		if (filter.filterProperty(propertyName, targetObject, sourceObject)
	}
};		
//housekeeping method
this.xtend.clean = function xtend_clean(scope) {

	//cleans up any pollution caused by naming our functions by iterating and deleting the member
	for (var propertyName in this.PropertyFilter.prototype) {
		delete scope["xtend_PropertyFilter_" + propertyName];
	}
	
	//delete the constructor for the PropertyFilter global scope
	delete scope.xtend_PropertyFilter;

	//voila should be clean now!!!! (apart from xtend that is!)
};
this.xtend.PropertyFilter = function xtend_PropertyFilter(filter) {
	//actually passing a null value will perform a 'reset'
	if (typeof filter !== "null") {
		this.filter = filter;
		this.filterProperty = this.resolvePropertyFilterMethod();
	} else {//reset the object
		this.reset();
	}
	if (this.constructor === Object) {
	/*	
		if we've been created from an object literal prototype (as we have done here)
		fix the constructor property (without messing with the prototype, which is, of course, an Object)
	*/
		this.constructor = xtend_PropertyFilter || arguments.callee; //Sorry DC but it's not deprecated and you can't trust browsers (IE mostly) to handle scope correctly
	}
};
this.xtend.PropertyFilter.prototype = {//assign our prototype here and use xtend to xtend its own helper class!
	//sets the filter and reassigns the filterProperty method appropriately
	setFilter: function xtend_PropertyFilter_setFilter(filter) {
		this.constructor.call(this, filter);
	},
	//just a getter to match the setter!
	getFilter: function xtend_PropertyFilter_getFilter() {
		return this.filter;
	},
	//removes instance properties (effectively disposing the object)
	reset: function xtend_PropertyFilter_reset() {
		delete this.filter;
		delete this.filterProperty;
	},
	//default filterProperty method - note it simply throws an exception - it should never be used
	filterProperty: function xtend_PropertyFilter_filterProperty() {
		throw "Illegal call to filterProperty on reset or misconfigured PropertyFilter (xtend.js)";
	},
	//this is the core 'logic' of the type - basically it decides which filterProperty method the instance should use
	resolvePropertyFilterMethods: function xtend_PropertyFilter_resolvePropertyFilterMethods() {
		switch (this.filter.constructor) {
			case Boolean	: return this.filter ? this.allowAllPropertiesPassed : this.filterExistingProperties;
			case Number		: //do the same as number
			case String		: return this.filterPropertyUsingDirectComparison;
			case Function	: return this.filterPropertyUsingFunction;
			case RegExp		: return this.filterPropertyUsingRegularExpression;
			case Array		: return this.convertFilterFromArrayToRegularExpression();//we call this function to change our filter to a regexp and return us an appropriate method
			default			: return this.filterPropertyUsingObject;
		}
	},

	filterExistingProperties: function xtend_PropertyFilter_filterExistingProperties(propertyName, targetObject) {
		//we disallow overwriting any existing properties unless they are null or undefined
		return !targetObject.hasOwnProperty(propertyName) || targetObject[propertyName] === null || targetObject[propertyName] === undefined;
	},

	allowAllPropertiesPassed: function xtend_PropertyFilter_allowAllPropertiesPassed() {
		return true;
	},

	convertFilterFromArrayToRegularExpression: function xtend_PropertyFilter_convertFilterFromArrayToRegularExpression() {
		this.filter = new RegExp("^(" + this.filter.join("|") + ")$");
		return this.filterPropertyUsingRegularExpression;//returns the method we want to use now
	},

	filterPropertyUsingDirectComparison: function xtend_PropertyFilter_filterPropertyUsingDirectComparison(propertyName) {
		return propertyName === this.filter;
	},

	filterPropertyUsingFunction: function xtend_PropertyFilter_filterPropertyUsingFunction() {
		//passes all three arguments straight through to the filterMethod
		return this.filter.apply(null, arguments);
	},
	filterPropertyUsingRegularExpression: function xtend_PropertyFilter_filterPropertyUsingRegularExpression(propertyName) {
		return this.filter.test(propertyName);
	},

	filterPropertyUsingObject: function xtend_PropertyFilter_filterPropertyUsingObject(propertyName) {
		return typeof this.filter[propertyName] !== "undefined";
	}
};
//clean up any polluting global objects we've made
this.xtend.clean(this);
