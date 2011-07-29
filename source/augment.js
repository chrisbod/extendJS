function augment(targetObject, sourceObject, filter, instancePropertyName, forceRefresh) {
	var callee = arguments.callee,
		builtAugments = callee.builtAugments,
		augmenter = instancePropertyName ? callee.getAugmenterBySourceAndPropertyName(sourceObject, instancePropertyName) : null;
	if (!augmenter) {
		augmenter = callee.createAugmenter(sourceObject, instancePropertyName);
	}
	return this.extend(targetObject, augmenter.augmentedProperties, filter);
}
augment.createAugmenter = function augment_createAugmenter (sourceObject, instancePropertyName) {
	var augmenter = new this.Augmenter(sourceObject, instancePropertyName);
	
};
augment.Augmenter = function augment_Augmenter(sourceObject,propertyName) {
	this.sourceObject = sourceObject;
	this.propertyName = propertyName;
	this.augmentedProperties = {};
};
augment.Augmenter.prototype = {
	augmentMethod: function augment_Augmenter_augmentMethod(sourceObject, methodName) {
	
	//need to look for capitalized methods (constructors)
		var augmentedMethod = this.augmentedProperties[methodName];
		if (!augmentedMethod) {
			//not using a closure - we want an unadultered method;
			augmentedMethod = this.augmentedProperties[methodName] = new Function("this."+this.propertyName+"." + methodName + ".apply(" + this.propertyName + ", arguments)");
			//DEBUG ONLY - sets a name to the function to give the developer a hint!
			try {
				augmentedMethod.name = "augmentedMethod_" + this.propertyName + "_" + methodName;
			}
			catch (e) {
			}
			//END DEBUG
		}
	},
	augmentProperty : function (sourceObject, propertyName) {
		//need to look for capitalized properties (constants)
		this.augmentedProperties[propertyName] = sourceObject[propertyName];
	}
};
augment.counter = 0;
augment.builtAugments = [];