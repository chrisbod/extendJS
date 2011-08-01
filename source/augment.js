function augment(targetObject, sourceObject, filter, initMethod) {
	var callee = arguments.callee,
		augmentor ;//= instancePropertyName ? callee.getAugmenterBySourceAndPropertyName(sourceObject, instancePropertyName) : null;
	if (!augmentor) {
		augmentor = callee.createAugmentor(sourceObject,filter,initMethod);
	}
	if (!targetObject.augmentations) {
		targetObject.augmentations = [augmentor];
	}
	else {
		if (targetObject.hasOwnProperty("augmentations")) {//probably a prototype or singleton / custom instance
			targetObject.augmentations.push(augmentor);
		}
		else {
			targetObject.augmentations = targetObject.augmentations.concat([augmentor]); //we make a duplicate of the 'inherited' collection and push this onto it
		}
	}
	if (!targetObject.augment) {
		targetObject.augment = this.instance_augment;
	}
	return this.extend(targetObject, augmentor.propertyMap, filter);
}
augment.instance_augment = function augment_object_augment() {
	for (var i = 0, augmentations = this.augmentations, l = augmentations.length; i != l; i++) {
		if (augmentations[i].initMethod) {
			augmentation[i].initMethod.apply(this)
		}	
	}
}
augment.createAugmentor = function augment_createAugmentor (sourceObject, initMethod) {
	var id = null;//neeed to generate an id preferable meaningful (contructor name) - otherwise autgenerated
	var augmentor = new this.Augmentor(id, sourceObject, initMethod);
	augmentor.build();
	return augmentor;
};
augment.Augmentor = function augment_Augmentor(id,sourceObject,initMethod) {
	this.id = id;
	this.sourceObject = sourceObject;
	this.initMethod = initMethod;
	this.propertyMap = {}
};
augment.Augmentor.prototype = {
	build: function () {
	//index augmenter here - this is a full and raw copy - augmentations are consider to be interfaces and any inheritance in them should be included - the filter can be used to remove any unwanted properties if necessary
		for (var propertyName in sourceObject) {
			augmentor.propertyMap[i] = this.augmentValue(propertyName, sourceObject, sourceObject[i]);
		}
	},
	augmentValue: function augment_Augmentor_augmentValue(propertyName, sourceObject, value) {
		if (typeof method === "function") {
			return this.augmentMethod(propertyName, sourceObject, value);
		}
		return value;
	}
	augmentMethod: function augment_Augmentor_augmentMethod(sourceObject, methodName) {
		//need to look for capitalized methods (constructors||function constants)
		return new Function("return this.augmentations."+this.id+"." + methodName + ".apply(this.augmentations."+this.id+", arguments)")
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
