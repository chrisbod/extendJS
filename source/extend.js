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
		global = this.self;
	}
	/**
	* Core extend function
	**
		@param targetObject[Object]
		@param sourceObject[Object]
		@param filter (optional)
	**/
	function extend(targetObject, sourceObject, filter) {
		var filterProperty;
		if (targetObject === null) {//we've been given a null so try to create a new instance of the source - or failing that create an object literal
			targetObject = extend.getSourceObjectFromNull(targetObject)
		} else if (requireRequestPassed(targetObject, sourceObject, filter)){//We are in async land now baby (this 'factory' method is 'public')
			return extend.buildRequireRequest(targetObject, sourceObject, filter);//build a require request 'chain' and exit
		}
		if (filter === undefined) {//default filter property is true (i.e. use a 'guarded' copy) is used if filter argument not passed
			filter = true;//okay I know it's slightly counterintuitive to have an argument that is not passed equivalent to passing true but it's really because I want the 'basic' behaviour to be as safe as possible
		} else {//check to see if filter argument has been passed if not set to true
			if (filter === null) {//null set so direct copy without filter immediately
				if (sourceObject.constructor === Array) {//we've passed null on an array copy so synchronise length property
					return extendAllPropertiesIncludingLengthIfPresent(targetObject, sourceObject)
				}
				return extendAllProperties(targetObject, sourceObject);
			}
		}
		if (needToFilterLengthFromArray(targetObject, filter)) {//Arrays should only be passed the length if we have specified null or false as a filter
			return extendArrayWithoutCopyingLength(targetObject, sourceObject);
		}
		if (objectTypeIsFilterProperty(filter)) {//check if we've been passed a PropertyFilter compliant object and if not create a new one based on the filter property
			filterProperty = new extend.PropertyFilter(filter);
		}
		else {
			filterProperty = filter;
		}
		return extendUsingFilterProperty(targetObject, sourceObject, filterProperty);//enumerate, filter and assign
	}
	extend.global = global;
	//'Fluent'ly! named and extracted logic functions (you know, to make the code fluent and self documenting :-))
	function requireRequestPassed(targetObject, sourceObject, filter) {
		var RequireRequest = extend.RequireRequest;
		if (!RequireRequest) {//extend has not currently been extended!
			return false;
		}
		return targetObject instanceof RequireRequest || sourceObject instanceof RequireRequest || filter instanceof RequireRequest
	}
	function needToFilterLengthFromArray(targetObject, filter) {
		return targetObject instanceof Array && filter === false
	}
	function objectTypeIsFilterProperty(filter) {
		return !(filter.filterProperty instanceof Function)
	}
	/**
	* Direct copy of ALL properties regardless
	**/
	function extendAllProperties(targetObject, sourceObject) {
		for (propertyName in sourceObject) {
			targetObject[propertyName] = sourceObject[propertyName];
		}
		return targetObject;
	};
	function extendAllPropertiesIncludingLengthIfPresent(targetObject,sourceObject) {
		for (propertyName in sourceObject) {
			targetObject[propertyName] = sourceObject[propertyName];
		}
		//length (despite being an instance property) is not enumerated
		if (length in sourceObject) {
			targetObject.length = sourceObject.length
		}
		return targetObject;
	}
	
	/** 
	* Copy to an array without the length property so the target arrays length is unchanged
	* function extendArrayWithoutLengthProperty(targetArray, sourceObject) {
	**/
	
	//this may be totally unnecessary it looks like for in doesn't look at length in an array anyway!
	function extendArrayWithoutCopyingLength(targetArray, sourceObject) {
		for (propertyName in sourceObject) {
			if (
				propertyName !== "length" &&
				filterProperty.filterProperty(
					propertyName,
					targetObject,
					sourceObject,
					targetObject[propertyName],
					sourceObject[propertyName]
				)
			) {
				targetObject[propertyName] = sourceObject[propertyName];	
			}
		}		
	};
	
	function extendUsingFilterProperty(targetObject, sourceObject, filterProperty) {
		for (propertyName in sourceObject) {
			if (filterProperty.filterProperty(propertyName, targetObject, sourceObject, targetObject[propertyName], sourceObject[propertyName])) {
				targetObject[propertyName] = sourceObject[propertyName];
			}
		}
	}
	global.extend = extend;
	return extend;
	
})();


//extending the extend function itself
extend(
	extend, 
	{
		getSourceObjectFromNull: function extend_getSourceObjectFromNull(sourceObject) {
			var Constructor;
			if (sourceObject.type && sourceObject instanceof type) {//the object has a specific 'type' property set
				Constructor = sourceObject.type;
			} else if (sourceObject.getType && sourceObject instanceof sourceObject.getType()) {
				Constructor = sourceObject.getType();
			}
			//TODO look at common libraries (MSAJAX (uses __type I think) etc) for how they specify object types
			else {
				Constructor = sourceObject.constructor;
			
			}
			try {
				targetObject = new Constructor();//of course the constructor property may not point to the real constructor - 
			}
			catch (e) {
				targetObject = {};
			}
			return targetObject;
		},
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
			this.filterProperty = this.resolvePropertyFilterMethod();//decide the strategy for filtering
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
		RequireRequest: function extend_RequireRequest(moduleName, targetObjectGetter) {
			this.moduleName = moduleName;
			this.targetObjectGetter = targetObjectGetter; //need to handler defaults for this
		},
		/**
		* Determines which arguments need to be loaded asynch (using requirejs) 
		* 
		**
			@param targetObject
			@param sourceObject
			@param filter
			
		**/
		buildRequireRequest: function (targetObject, sourceObject, filter) {	//I should probably be using promises but heck this wouldn't be a javascript file without some nasty closures!		
			var RequireRequest = this.RequireRequest,
				require = this.global.require,
				checkComplete = function extend_buildRequest_checkComplete_closure() {
					if ( 	
						!(targetObject instanceof RequireRequest) &&
						!(sourceObject instanceof RequireRequest) &&
						!(filter instanceof RequireRequest)			//if none of our objects are RequireRequests then off we go
					) {
						
						extend(targetObject, sourceObject, filter);
					}
				};
			
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
		METHODS_ONLY: function extend_METHODS_ONLY(propertyName, targetObject, sourceObject, targetValue, sourceValue) {
			return sourceValue instanceof Function;
		},
		EXCLUDE_ALL_OBJECTS: function extend_EXCLUDE_ALL_OBJECTS(propertyName, targetObject, sourceObject, targetValue, sourceValue) {
			return !(
				typeof sourceValue === "object" ||
				typeof sourceValue === "unknown"
				);
		}
	},
	//direct copy
	null
);
extend(
	//extend the prototype of PropertyFilter type
	extend.PropertyFilter.prototype, 
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

		filterPropertyInstanceOnlyAllowingNewNullOrUndefined: function extend_PropertyFilter_filterPropertyInstanceOnlyAllowingNewNullOrUndefined(propertyName, targetObject, sourceObject, targetValue, sourceValue) {
			//accept only instance properties/ not overwriting instance properties unless they are null or undefined
			var hasOwnProperty = Object.prototype.hasOwnProperty
			if (!hasOwnProperty.call(sourceObject, propertyName)) {
				return false;
			}
			if (hasOwnProperty.call(targetObject, propertyName)) {
				return targetValue === null || targetValue === undefined;
			}
			return true
		},

		filterPropertyInstanceAndInheritedAllowingNewNullOrUndefined: function extend_PropertyFilter_filterPropertyInstanceAndInheritedAllowingNewNullOrUndefined(propertyName, targetObject, sourceObject, targetValue, sourceValue) {
			//accept all properties (including inherited ones) but disallow overwriting any existing properties unless they are null or undefined
			return (
				!Object.prototype.hasOwnProperty.call(targetObject, propertyName) ||
				targetValue === null ||
				targetValue === undefined
			);
		},
		
		filterPropertyUsingString: function extend_PropertyFilter_filterPropertyUsingString(propertyName) {
			//simple identity check
			return propertyName.toString() === this.filter;
		},
		
		filterPropertyUsingNumber: function extend_PropertyFilter_filterPropertyUsingNumber(propertyName) {
			//enumeration returns indices as strings
			return propertyName === String(parseFloat(this.filter));
		},

		filterPropertyUsingFunction: function extend_PropertyFilter_filterPropertyUsingFunction() {
			//passes all three arguments straight through to the filterMethod
			var keepProperty = this.filter.apply(null, arguments);
			if (typeof keepProperty !== "boolean") {
				throw "Invalid return property ("+keepProperty+") returned from filter method (extendjs)"
			}
			return keepProperty;
		},
		
		filterPropertyUsingRegExp: function extend_PropertyFilter_filterPropertyUsingRegExp(propertyName) {
			return this.filter.test(propertyName);
		},
		
		filterPropertyUsingArray: function extend_PropertyFilter_filterPropertyUsingRegExp(propertyName) {
			return new RegExp("^(" + this.filter.join("|") + ")$").test(propertyName);
		},
		
		filterPropertyUsingObject: function extend_PropertyFilter_filterPropertyUsingObject(propertyName) {
			return !!this.filter[propertyName];
		}
	},
	null
);
