var X = {
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
		RequireRequest: function (moduleName, targetObjectGetter) {
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
		METHODS_ONLY: function extend_METHODS_ONLY(propertyName, targetObject, sourceObject, sourceValue) {
			return sourceValue instanceof Function;
		},
		EXCLUDE_ALL_OBJECTS: function extend_EXCLUDE_OBJECTS(propertyName, targetObject, sourceObject, sourceValue) {
			return !(
				typeof sourceValue === "object" ||
				typeof sourceValue === "unknown"
				);
		}
	}