//create a pointer to the global scope (this.self already in IE)
if (!this.self) {
	this.self = this;
}
//core function
this.self.extend = function extend(targetObject, sourceObject, filter) {
	if (targetObject.constructor === this.RequireRequest || sourceObject.constructor === this.RequireRequest || (filter && filter.constructor === this.RequireRequest) {
		//We are in async land now baby
		this.buildRequireRequest(targetObject, sourceObject, filter);
		return;
	}
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
	//Arrays should only be passed the length if we have specified null or false as a filter
	if (typeof targetObject === Array && filter === false) {
		for (propertyName in sourceObject) {
			if (propertyName !== "length" && filterProperty.filterProperty(propertyName, targetObject, sourceObject)) {
				targetObject[propertyName] = sourceObject[propertyName];	
			}
		}
	} else {
		for (propertyName in sourceObject) {
			if (filterProperty.filterProperty(propertyName, targetObject, sourceObject)) {
				targetObject[propertyName] = sourceObject[propertyName];
			}
		}
	}
};
this.self.extend(
	//self test 1 - passing null
	this.self.extend, 
	{
		//extends core PropertyFilter object
		PropertyFilter: function extend_PropertyFilter(filter) {
			this.filter = filter || false;
			//decide the strategy for filtering
			this.filterProperty = this.resolvePropertyFilterMethod();
		},
		require: function (moduleName,targetObjectGetter) {
			return new this.RequireRequest(moduleName,targetObjectGetter);
		},
		RequireRequest: function (moduleName,targetObjectGetter) {
			this.moduleName = moduleName,
			this.targetObjectGetter = targetObjectGetter; //need to handler defaults for this
		},
		buildRequireRequest: function (targetObject, sourceObject, filter) {
			//find out which arguments require requiring and build a custom require request.
			
		}
	},
	//direct copy
	null
);
this.self.extend(
	//extend the prototype of PropertyFilter type
	this.extend.PropertyFilter.prototype, 
	{
	
	//Core implementation for PropertyInterface Implementation//	
		
		//the only method 'required' to fulfill a FilterProperty 'implementation'
		filterProperty: function extend_PropertyFilter_filterProperty() {
			//defaut behaviour (occurs when no filter has been explicitly set in the object or the filter is set to false)
			return this.filterPropertyInstanceOnlyAllowingNewNullOrUndefined.apply(this, arguments);
		},
		
		//default behaviour is to only copy new properties or those in the target set to null or undefined
		filter: true,
				
		//this is the core 'logic' of the type - basically it decides which filterProperty method the instance should use
		resolvePropertyFilterMethod: function extend_PropertyFilter_resolvePropertyFilterMethods() {
			switch (this.filter.constructor) {
				case Boolean	: return this.filter ? this.filterPropertyInstanceOnlyAllowingNewNullOrUndefined : this.filterPropertyInstanceAndInheritedAllowingNewNullOrUndefined ;
				case Number		: return this.filterPropertyUsingNumber;
				case String		: return this.filterPropertyUsingString;
				case Function	: return this.filterPropertyUsingFunction;
				case RegExp		: return this.filterPropertyUsingRegExp;
				case Array		: return this.filterPropertyUsingArray;
				default			: return this.filterPropertyUsingObject;
			}
		},

		filterPropertyInstanceOnlyAllowingNewNullOrUndefined: function extend_PropertyFilter_filterPropertyInstanceOnlyAllowingNewNullOrUndefined(propertyName, targetObject, sourceObject) {
			//accept only instance properties but disallow overwriting any existing properties unless they are null or undefined
			return Object.prototype.hasOwnProperty.call(sourceObject,propertyName) && (!Object.prototype.hasOwnProperty.call(targetProperty,propertyName) || targetObject[propertyName] === null || targetObject[propertyName] === undefined);
		},

		filterPropertyInstanceAndInheritedAllowingNewNullOrUndefined: function extend_PropertyFilter_filterPropertyInstanceAndInheritedAllowingNewNullOrUndefined(propertyName, targetObject, sourceObject) {
			//accept all properties (including inherited ones) but disallow overwriting any existing properties unless they are null or undefined
			return !Object.prototype.hasOwnProperty.call(targetObject,propertyName) || targetObject[propertyName] === null || targetObject[propertyName] === undefined;
	
		},
		
		filterPropertyUsingString: function extend_PropertyFilter_filterPropertyUsingString(propertyName) {
			//simple identity check
			return propertyName === this.filter;
		},
		
		filterPropertyUsingNumber: function extend_PropertyFilter_filterPropertyUsingNumber(propertyName) {
			//enumeration returns indices as strings
			return propertyName === String(parseFloat(this.filter));
		},

		filterPropertyUsingFunction: function extend_PropertyFilter_filterPropertyUsingFunction() {
			//passes all three arguments straight through to the filterMethod
			return this.filter.apply(null, arguments);
		},
		
		filterPropertyUsingRegExp: function extend_PropertyFilter_filterPropertyUsingRegExp(propertyName) {
			return this.filter.test(propertyName);
		},
		
		filterPropertyUsingArray: function extend_PropertyFilter_filterPropertyUsingRegExp(propertyName) {
			return new RegExp("^(" + this.filter.join("|") + ")$").test(propertyName);
		},
		
		filterPropertyUsingObject: function extend_PropertyFilter_filterPropertyUsingObject(propertyName) {
			return this.filter[propertyName] !== undefined;
		}
	},
	null
);

if (this.self.require) {
	//register with requirejs if it's present
	if (this.self.define) {
		this.self.define(this.self.extend);
	} else if (this.self.require.def) {
		this.self.require.def(this.self.extend);
	}
}
//clean up
if (this.self === this) {
	delete this.self;
} 
