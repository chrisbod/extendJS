/**
* Utility method for extending any object based on another object
* With requireJS support
**
	@author Christian Bodart
	@version 0.1
**/

(function () {
	//create a pointer to the global scope (this.self already in IE)
	var global = this;
	if (
		this.self && //in a browser
		this !== this.self //in a microsoft browser
		) {
			//in a microsoft instance NOT the true global
		global = this.;		}
	}
	/**
	* Core extend function
	**
		@param targetObject[Object]
		@param sourceObject[Object]
		@param filter (optional)
	**/
	global.extend = function extend(targetObject, sourceObject, filter) {
		var RequireRequest = extend.RequireRequest,
			filterProperty;
		if (requireRequestPassed(targetObject, sourceObject, filter)){//We are in async land now baby (this 'factory' method is 'public')
			return this.buildRequireRequest(targetObject, sourceObject, filter);//build a require request 'chain' and exit
		}
		if (filter === undefined) {//default filter property is true (i.e. use a 'guarded' copy) is used if filter argument not passed
			filter = true;//okay I know it's slightly counterintuitive to have an argument that is not passed equivalent to passing true but it's really because I want the 'basic' behaviour to be as safe as possible
		} else {//check to see if filter argument has been passed if not set to true
			if (filter === null) {//null set so direct copy without filter immediately
				return extendAllProperties(targetObject, sourceObject);
			}
		}
		if ( needToFilterLengthFromArray(targetObject, filter)) {//Arrays should only be passed the length if we have specified null or false as a filter
			return extendArrayWithoutCopyingLength(targetObject, sourceObject);
		}
		if (objectTypeIsFilterProperty(filter)) {//check if we've been passed a PropertyFilter compliant object and if not create a new one based on the filter property
			filterProperty = new extend.PropertyFilter(filter);
		}
			return extendUsingFilterProperty(targetObject, sourceObject, filterProperty);//enumerate, filter and assign
		}
	};
	//'Fluent'ly! named and extracted logic functions (you know, to make the code fluent and self documenting :-))
	function requireRequestPassed(targetObject, sourceObject, filter) {
		return targetObject instanceof RequireRequest || sourceObject instanceof RequireRequest || filter instanceof RequireRequest
	}
	function needToFilterLengthFromArray(targetObject, filter) {
		return targetObject instanceof Array && filter === false
	}
	function objectTypeIsFilterProperty(object) {
		return !(filter.filterProperty instanceof Function)
	}
	/**
	* Direct copy of ALL properties regardless
	**/
	function extendAllProperties(targetObject, sourceObject) {
		for (propertyName in sourceObject) {
			targetObject[propertyName] = sourceObject[propertyName];
		}
	};
	
	/** 
	* Copy to an array without the length property so the target arrays length is unchanged
	* function extendArrayWithoutLengthProperty(targetArray, sourceObject) {
	**/
	function extendArrayWithoutCopyingLength(targetArray, sourceObject) {
		for (propertyName in sourceObject) {
			if (
				propertyName !== "length" &&
				filterProperty.filterProperty(
					propertyName,
					targetObject,
					sourceObject,
					sourceObject[propertyName],
					targetObject[propertyName]
				)
			) {
				targetObject[propertyName] = sourceObject[propertyName];	
			}
		}		
	};
	
	function extendUsingFilterProperty(targetObject, sourceObject, filterProperty) {
		for (propertyName in sourceObject) {
			if (filterProperty.filterProperty(propertyName, targetObject, sourceObject, sourceObject[propertyName], targetObject[propertyName])) {
				targetObject[propertyName] = sourceObject[propertyName];
			}
		}
	}
})();


//extending the extend function itself
this.self.extend(
	this.self.extend, 
	{
		/**
		* Utility type used to create property filters (rules for whether to copy a particular property)
		* PropertyFilters can actually manipulate the target object (i.e if the incoming property 
		* is an object instance it might set that property as a new instance of the same type.
		* ProperyFilters have a number of default behaviours (depending on the filter object passed to the constructor)
		* in order to simplify usage.
		* extend() itself also provides a number of static/constant filters to allow fluent calls to extend
		**
			@constructor
			@param filter An argument of any type to define the behaviour of the filter
		**/
		PropertyFilter: function extend_PropertyFilter(filter) {
			this.filter = filter || false;
			//decide the strategy for filtering
			this.filterProperty = this.resolvePropertyFilterMethod();
		},		
		/**
		* Factory method for creating a required object reference
		* i.e. the object desired as a source, target, or even filter is being asynchronously loaded using requireJS
		**
			@param moduleName[String] The name/filename of the required module
			@param targetObjectGetter[String] If passed a string then the property with name targetObject value in the return value of the required module will be used
			@param targetObjectGetter[Function] If passed a function the function will be passed a reference to the required module return value and the result of that function will be used
			
		**/
		
		require: function (moduleName, targetObjectGetter) {
			return new this.RequireRequest(moduleName,targetObjectGetter);
		},
		RequireRequest: function (moduleName, targetObjectGetter) {
			this.moduleName = moduleName;
			this.targetObjectGetter = targetObjectGetter; //need to handler defaults for this
		},
		buildRequireRequest: function (targetObject, sourceObject, filter) {
			//find out which arguments require requiring and build a custom require request.
			
			var RequireRequest = this.RequireRequest,
				require = this.global.require,
				checkComplete = function extend_buildRequest_checkComplete_closure() {
					if (
						!(targetObject instanceof RequireRequest) &&
						!(sourceObject instanceof RequireRequest) &&
						!(filter instanceof RequireRequest)
					) {
						//all our arguments are in!
						extend(targetObject, sourceObject, filter);
					}
				};
			//I should probably be using promises but heck this wouldn't be a javascript file without some nasty closures!
			if (targetObject instanceof RequireRequest) {
				require(
					targetObject.moduleName,
					function extend_buildRequest_targetObject_closure(targetResponse) {
						targetObject = targetResponse;
						checkComplete();
					}
				);
			}
			if (sourceObject instanceof RequireRequest) {
				require(
					sourceObject.moduleName, 
					function extend_buildRequest_sourceObject_closure(sourceResponse) {
						sourceObject = sourceResponse;
						checkComplete();
					}
				);
			}
			if (filter instanceof RequireRequest) {
				require(
					filter.moduleName,
					function extend_buildRequest_filter_closure(filterResponse) {
						filter = filterResponse;
						checkComplete();
					}
				);
			}
		},
		//static utility filter arguments
		INSTANCE_ONLY: true,
		INCLUDE_INHERITED: false,
		ALL: null,
		METHODS_ONLY: function extend_METHODS_ONLY(propertyName, targetObject, sourceObject, sourceValue) {
			return sourceValue instanceof Function;
		},
		EXCLUDE_ALL_OBJECTS: function extend_EXCLUDE_OBJECTS(propertyName, targetObject, sourceObject, sourceValue) {
			return !(
				typeof sourceValue === "object" ||
				typeof sourceValue === "unknown")
				);
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
			var hasOwnProperty = Object.prototype.hasOwnProperty,
				propertyValue = targetObject[propertyName];
			return (
				hasOwnProperty.call(sourceObject,propertyName) &&
				!hasOwnProperty.call(targetProperty,propertyName) ||
				propertyValue === null ||
				propertyValue === undefined
			);
		},

		filterPropertyInstanceAndInheritedAllowingNewNullOrUndefined: function extend_PropertyFilter_filterPropertyInstanceAndInheritedAllowingNewNullOrUndefined(propertyName, targetObject, sourceObject, sourceValue, targetValue) {
			//accept all properties (including inherited ones) but disallow overwriting any existing properties unless they are null or undefined
			return (
				!Object.prototype.hasOwnProperty.call(targetObject, propertyName) ||
				targetValue === null ||
				targetValue === undefined;
			);
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
//clean up
if (this.self === this) {
	delete this.self;
} 
