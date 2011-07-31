function augment(targetObject, sourceObject, filter, instancePropertyName, constructor, ConstructorToApply, forceRefresh) {
	var callee = arguments.callee,
		builtAugments = callee.builtAugments,
		augmenter = instancePropertyName ? callee.getAugmenterBySourceAndPropertyName(sourceObject, instancePropertyName) : null;
	if (!augmenter) {
		augmenter = callee.createAugmenter(sourceObject, instancePropertyName, ConstructorToApply);
	}
	if (!targetObject.augmentations) {
	targetObject.augmentations = [augmentor];
	}
	else {
		if (targetObject.hasOwnProperty("augmentations") {
			targetObject.augmentations.push(augmenter);
		}
		else {
			targetObject.augmentations = targetObject.augmentations.concat([augmentor]); //we make a duplicate of the 'inherited' collection and push this onto it
		}
	}
	if (!targetObject.augment) {
		targetObject.augment = this.augmentObject;
	}
	return this.extend(targetObject, augmenter.augmentedProperties, filter);
}
augment.augmentObjectInstance = function augment_object_augment() {
	for (var i = 0, augmentations = this.augmentations, l = augmentations.length, augmentation, Constructor = this.ConstructorToApply; i != l; i++) {
		augmentation = augmentations[i];
		if (augmentation.propertyName) {
			this[propertyName] = new Constructor(this);
		}
		else {
			Constructor.apply(this,[this])
		}
	}

}
augment.createAugmenter = function augment_createAugmenter (sourceObject, instancePropertyName) {
	var augmenter = new this.Augmenter(sourceObject, instancePropertyName);
	
};
augment.Augmenter = function augment_Augmenter(sourceObject,propertyName,constructorToApply) {
	this.sourceObject = sourceObject;
	this.propertyName = propertyName;
	this.constructorToApply = constructorToApply;
	this.augmentedProperties = {};
};
augment.Augmenter.prototype = {
	augmentMethod: function augment_Augmenter_augmentMethod(sourceObject, methodName) {
	
	//need to look for capitalized methods (constructors)
		var augmentedMethod = this.augmentedProperties[methodName];
		if (!augmentedMethod) {
			//not using a closure - we want an unadultered method;
			if (this.propertyName) {//we've been given a propertyName to point to so wrap it
				augmentedMethod = this.augmentedProperties[methodName] = new Function("return this."+this.propertyName+"." + methodName + ".apply(" + this.propertyName + ", arguments)");
			}
			else {
				augmentedMethod = sourceObject[methodName]; //map the method on directly
			}

			//END DEBUG
		}
		return augmentedMethod;
	},
	augmentProperty : function (sourceObject, propertyName) {
		//need to look for capitalized properties (constants)
		this.augmentedProperties[propertyName] = sourceObject[propertyName];
	}
};
augment.counter = 0;
augment.builtAugments = [];
//Augmentation 'interface'
augment.Augmentation = function augment_Augmentation(augmentee) {
	this.augmentee = augmentee || this;
}
augment.Augmentation.prototype = {
	augmentee: void augment.Augmentation||Object,
}
