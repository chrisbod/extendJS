if (typeof this.extend !== "undefined") {
	/*	a property called extend has already been declared in global scope!
		store it and we will reassign later */
	this.extend_placeholder = this.extend;
}

//core function
this.extend = function extend(targetObject, sourceObject, filter) {
	var propertyName,
		filterProperty;
	if (filter === undefined) {
		//default filter type is used if argument not passed
		filter = true;
	} else {//check to see if filter argument has been passed if not set to true
		if (filter === null) {
			//null set so direct copy without filter immediately
			for (propertyName in sourceObject) {
				targetObject[propertyName] = sourceObject[propertyName];
			}
			//our work is done here
			return;
		}
	}
	//check if we've been passed a PropertyFilter compliant object and if not create a new one
	//
	if (typeof filter.filterProperty !== "function") {
		filterProperty = new arguments.callee.PropertyFilter(filter);
	}
	//enumerate, filter and assign
	for (var propertyName in sourceObject) {
		if (filterProperty.filterProperty(propertyName, targetObject, sourceObject)) {
			targetObject[propertyName] = sourceObject[propertyName];
		}
	}
};
this.extend(
	//self test 1 - passing null
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
	},
	//direct copy
	null
);
this.extend(
	//extend the prototype of PropertyFilter type
	this.extend.PropertyFilter.prototype, {
	
	//Core implementation for PropertyInterface Implementation//	
		
		//the only method 'required' to fulfill a FilterProperty 'implementation'
		filterProperty: function extend_PropertyFilter_filterProperty() {
			//defaut behaviour (occurs when no filter has been explicitly set in the object or the filter is set to false)
			return this.filterPropertyInstanceOnlyAllowingNewNullOrUndefined.apply(this,arguments)
		},
		
		//default behaviour is to only copy new properties or those in the target set to null or undefined
		filter: true,
				
		//this is the core 'logic' of the type - basically it decides which filterProperty method the instance should use
		resolvePropertyFilterMethod: function extend_PropertyFilter_resolvePropertyFilterMethods() {
			switch (this.filter.constructor) {
				case Boolean	: return this.filter ? this.filterPropertyInstanceOnlyAllowingNewNullOrUndefined : this.filterPropertyAllPropertiesAllowingNewNullOrUndefined ;
				case Number		: //do the same as number
				case String		: return this.filterPropertyUsingString;
				case Function	: return this.filterPropertyUsingFunction;
				case RegExp		: return this.filterPropertyUsingRegExp;
				case Array		: return this.filterPropertyUsingArray;
				default			: return this.filterPropertyUsingObject;
			}
		},

		filterPropertyInstanceOnlyAllowingNewNullOrUndefined: function extend_PropertyFilter_filterPropertyInstanceOnlyAllowingNewNullOrUndefined(propertyName, targetObject, sourceObject) {
			//accept only instance properties but disallow overwriting any existing properties unless they are null or undefined
			return sourceObject.hasOwnProperty(propertyName) && (!targetObject.hasOwnProperty(propertyName) || targetObject[propertyName] === null || targetObject[propertyName] === undefined);
		},

		filterPropertyAllowingAll: function extend_PropertyFilter_filterPropertyAllPropertiesAllowingNewNullOrUndefined() {
			//accept all properties (including inherited ones) but disallow overwriting any existing properties unless they are null or undefined
			return !targetObject.hasOwnProperty(propertyName) || targetObject[propertyName] === null || targetObject[propertyName] === undefined;
	
		},
		
		filterPropertyUsingString: function extend_PropertyFilter_filterPropertyUsingString(propertyName) {
			//simple identity check
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
		
		filterPropertyUsingArray: function extend_PropertyFilter_filterPropertyUsingRegExp(propertyName) {
			return RegExp("^(" + this.filter.join("|") + ")$").test(propertyName);
		},
		
		filterPropertyUsingObject: function extend_PropertyFilter_filterPropertyUsingObject(propertyName) {
			return typeof this.filter[propertyName] !== "undefined";
		}
	},
	null
);

if (this.require) {
	//register with requirejs if it's present
	if (this.define) {
		this.define(this.extend);
	}
	else if (this.require.def) {
		this.require.def(this.extend);
	}
}

//clean up any polluting global objects we've made
this.extend.cleanReferences(this);

