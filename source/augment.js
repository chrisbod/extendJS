function augment(targetObject, sourceType, filter, augmentId ) {//propertyNameForInstance will need implementing
	var callee = arguments.callee,
		augmentor ;//= instancePropertyName ? callee.getAugmenterBySourceAndPropertyName(sourceObject, instancePropertyName) : null;
	if (!augmentor) {
		augmentor = callee.createAugmentor(sourceType,filter,augmentId);
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
	this.augmentations = this.augmentations.concat();//we need a new instance of the augmentations array with NO properties set - if this ever gets called on a prototype then weirdness will occur
	for (var i = 0, augmentations = this.augmentations.concat(), l = augmentations.length; i != l; i++) {
		augmentations[i].applyToInstance(this);
	}
};
augment.createAugmentor = function augment_createAugmentor (sourceType, augmentId) {
	var applyDirect = false;
	if (!augmentId && augmentId !== null) {
		if (/function\s*([^\ \(]+)/.test(sourceType.toString())) {//we have a nice function name
			augmentId = $2.replace(/^./, function (match) {
				return match.toLowerCase();
			});
		}
		else {
			augmentId = this.generateAugmentorId();
		}
	} else {
		applyDirect = true;
		augmentId = this.generateAugmentorId();
	}
	var augmentor = new this.Augmentor(augmentId, sourceType, applyDirect);
	augmentor.build();
	this.addAugmentor(augmentor);
	return augmentor;
};
augment.Augmentor = function augment_Augmentor(id, sourceType, applyDirect) {
	this.id = id;
	this.applyDirect = applyDirect;
	this.resolveType(sourceType);
	this.propertyMap = {};
};
augment.Augmentor.prototype = {
	resolveType: function (sourceType) {	
		//wrong logic here need to base this on applyDirect
		if (this.sourceType.Augmentor) {
			this.sourceType = function augment_Augmentor() {
				sourceType.Augmentor.apply(this);
			};
			this.sourceType.prototype = this.sourcePrototype;
		} else {
			this.sourceType = sourceType;
		}
	},
	build: function () {
	//index augmenter here - this is a full and raw copy - augmentations are consider to be interfaces and any inheritance in them should be included - the filter can be used to remove any unwanted properties if necessary
		for (var propertyName in this.sourcePrototype) {
			augmentor.propertyMap[i] = this.augmentValue(propertyName, sourcePrototype, sourcePrototype[propertyName]);
		}
	},
	applyToInstance: function (instance) {
		if (this.applyDirect) {//apply directly to object
			this.sourceType.apply(instance);
		} else {
			instance.augmentations[this.id] = new this.sourceType(instance);
		}
	},
	augmentValue: function augment_Augmentor_augmentValue(propertyName, sourcePrototype, value) {
		if (typeof method === "function") {
			return this.augmentMethod(propertyName, value);
		}
		return value;
	},
	augmentMethod: function augment_Augmentor_augmentMethod(methodName,value) {
		if (/^[A-Z]/.test(methodName)) {capitalized methods (assume constructors||function constants)
			return value;
		}
		return new Function("return this.augmentations."+this.id+"." + methodName + ".apply(this" + (this.applyDirect ? "" : "this.augmentations" + this.id + ", arguments)");
	}
};
augment.counter = 0;
augment.builtAugmentors = [];
augment.addAugmentor = function (augmentor) {
	

}
augment.generateAugmentorId = function () {
	return "unnamedAugmentor"+this.counter++;
}
//Dummy Augmentation 'interface'
augment.Augmentation = function augment_Augmentation(augmentee) {
	this.augmentee = augmentee;
};
augment.Augmentation.prototype = {
	augmentee: void augment.Augmentation||Object
};
