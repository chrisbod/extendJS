if (typeof this.extend !== "undefined") {
	//a property called extend has already been declared in global scope!
	//store it and we will reassign later
	this.extend_placeholder = this.extend;
}

//core function
this.extend = function extend(targetObject, sourceObject, filter) {
	//default is false when not passed
	//convert the filter into a PropertyFilter if it is not already
	if (!filter || typeof filter.filterProperty !== "function") {
		filter = new arguments.callee.PropertyFilter(filter);
	} 
	for (var propertyName in sourceObject) {
		if (filter.filterProperty(propertyName, targetObject, sourceObject)) {
			targetObject[propertyName] = sourceObject[propertyName];
		}
	}
};
this.extend(
	this.extend, {
		//housekeeping method to remove any references the named functions leave in global scope;
		cleanReferences: function xtend_cleanReferences(scope) {
			//cleans up any pollution caused by naming our functions by iterating and deleting the member
			for (var propertyName in this.PropertyFilter.prototype) {
				delete scope["extend_PropertyFilter_" + propertyName];
			}
			//if we have used a placeholder property, clean up
			if (scope.extend_placeholder) {
				scope.extend = extend_placeholder
				delete scope.extend_placeholder;
			}
			//delete the constructor for the PropertyFilter from global scope
			delete scope.extend_PropertyFilter;
			//voila should be clean now!!!! (apart from xtend that is!)
		},
		//extends core PropertyFilter object
		PropertyFilter: function extend_PropertyFilter(filter) {
			this.filter = filter||false;
			//decide the strategy for filtering
			this.filterProperty = this.resolvePropertyFilterMethod();
		}
};
this.extend(
	//extend the prototype of PropertyFilter type
	this.extend.PropertyFilter.prototype, {
	//Core implementation for PropertyInterface Implementation//	
		//the only method 'required' to fulfill a FilterProperty 'implementation'
		filterProperty: function extend_PropertyFilter_filterProperty() {
			//defaut behaviour (occurs when no filter has been explicitly set in the object or the filter is set to false)
			return this.filterPropertyAllowingNewNullOrUndefined.apply(this,arguments)
		},
		
		//Properties
		//default behaviour is to only copy new properties or those in the target set to null or undefined
		filter: false,
		
		
		//this is the core 'logic' of the type - basically it decides which filterProperty method the instance should use
		resolvePropertyFilterMethod: function extend_PropertyFilter_resolvePropertyFilterMethods() {
			switch (this.filter.constructor) {
				case Boolean	: return this.filter ? this.filterPropertyAllowingAll : this.filterExistingPropertyAllowingNewNullOrUndefined;
				case Number		: //do the same as number
				case String		: return this.filterPropertyUsingString;
				case Function	: return this.filterPropertyUsingFunction;
				case RegExp		: return this.filterPropertyUsingRegExp;
				case Array		: return this.filterPropertyUsingArray;
				default			: return this.filterPropertyUsingObject;
			}
		},

		filterPropertyAllowingNewNullOrUndefined: function extend_PropertyFilter_filterPropertyAllowingNewNullOrUndefined(propertyName, targetObject) {
			//we disallow overwriting any existing properties unless they are null or undefined
			return !targetObject.hasOwnProperty(propertyName) || targetObject[propertyName] === null || targetObject[propertyName] === undefined;
		},

		filterPropertyAllowingAll: function extend_PropertyFilter_filterPropertyAllowingAll() {
			return true;
		},
		
		filterPropertyUsingString: function extend_PropertyFilter_filterPropertyUsingString(propertyName) {
			return propertyName === this.filter;
		},
		
		filterPropertyUsingNumber: function extend_PropertyFilter_filterPropertyUsingNumber(propertyName) {
			//enumeration returns indices as strings
			return propertyName === ""+this.filter;
		},

		filterPropertyUsingFunction: function extend_PropertyFilter_filterPropertyUsingFunction() {
			//passes all three arguments straight through to the filterMethod
			return this.filter.apply(null, arguments);
		},
		filterPropertyUsingRegExp: function extend_PropertyFilter_filterPropertyUsingRegExp(propertyName) {
			return this.filter.test(propertyName);
		},
		filterPropertyUsingArray: function extend_PropertyFilter_filterPropertyUsingRegExp(propertyName)
			return RegExp("^(" + this.filter.join("|") + ")$").test(propertyName);
		},
		filterPropertyUsingObject: function extend_PropertyFilter_filterPropertyUsingObject(propertyName) {
			return typeof this.filter[propertyName] !== "undefined";
		}
	}
);
if (this.require && this.define) {//
	


}
//clean up any polluting global objects we've made
this.extend.cleanReferences(this);

