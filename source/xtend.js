(
	function xtend_factory() {
		
		//core function
		function xtend(targetObject, sourceObject, filter) {
			//default is false when not passed
			if (typeof filter === "undefined" || typeof filter === "null") {
				filter = false; 
			}
			//convert the filter into a PropertyFilter if it is not already
			if (filter.hasOwnProperty("filterProperty")) {
				filter = new this.PropertyFilter(filter)
			}
		}
		
		//declare and expose PropertyFilter type;
		xtend.PropertyFilter = function xtend_PropertyFilter(filter) {
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
		
		//assign the factory property of the extender to allow it to be reapplied on other objects if necessary!!
		xtend.factory = xtend_factory || arguments.callee;
		
		//publish xtend in the current scope (e.g the browser window...)
		this.xtend = xtend;
		
		//housekeeping method
		xtend.clean = function xtend_clean(scope) {
			
			//cleans up any pollution caused by naming our functions by iterating and deleting the member
			for (var propertyNameToCleanUp in xtend.PropertyFilter.prototype) {
				delete scope["xtend_PropertyFilter_" + propertyNameToCleanUp];
			}
			//remove the xtend_factory property of the 'global' object
			delete scope.xtend_factory;
			delete this.clean;//clean up our clean method!
			//voila should be clean now!!!! (apart from xtend that is!)
		}
		
		//nullify any variables inside this scope - boy aren't we being tidy now - but heck the idea here is to reduce closure memory overhead and performance hits
		
		//we can do this because we've already assigned xtend to the "global" scope
		xtend = null;
		
		//and let's get those pesky function references too!
		xtend_PropertyFilter = null;
		xtend_xtend_clean = null;
		
		return this.xtend;
	}()//watch out don't put a semicolon here!
).//don't delete this dot!
PropertyFilter.prototype = {//assign our prototype here and use xtend to xtend its own helper class!

	setFilter: function xtend_PropertyFilter_setFilter(filter) {
		this.constructor.call(this, filter);
	},

	getFilter: function xtend_PropertyFilter_() {
		return this.filter;
	},

	reset: function xtend_PropertyFilter_reset() {
		delete this.filter;
		delete this.filterProperty;
	},

	filterProperty: function xtend_PropertyFilter_filterProperty() {
		throw "Illegal call to filterProperty on reset or misconfigured PropertyFilter (xtend.js)";
	},

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

	filterExistingProperties: function xtend_PropertyFilter_filterExistingProperties(propertyName, sourceObject, targetObject) {
		//we disallow overwriting any existing properties unless they are null or undefined
		return targetObject.hasOwnProperty(propertyName) && targetObject[propertyName] !== null && targetObject[propertyName] !== undefined;
	},

	allowAllPropertiesPassed: function xtend_PropertyFilter_allowAllPropertiesPassed() {
		return true;
	},

	convertFilterFromArrayToRegularExpression: function xtend_PropertyFilter_convertFilterFromArrayToRegularExpression() {
		this.filter = new RegExp("^(" + this.filter.join("|") + ")$");
		return this.filterPropertyUsingRegularExpression;//return the method we want to use now
	},

	filterPropertyUsingDirectComparison: function xtend_PropertyFilter_filterPropertyUsingDirectComparison(propertyName) {
		return propertyName === this.filter;
	},

	filterPropertyUsingFunction: function xtend_PropertyFilter_filterPropertyUsingFunction() {
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
xtend.clean(this);
