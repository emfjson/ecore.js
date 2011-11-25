(function(){
	
	ENamedElement = function(name){
		this.name = name;
	},
	
	EPackage = function(classifiers){
		this.name = name;
		this.eClassifiers = classifiers;
	},
	EPackage.prototype = new ENamedElement;
	
	EObject = function(){
		
	},
	
	EClass = function(){
		var eClass = function(){
			this.init.apply(this, arguments);
		};
		eClass.prototype.init = function(){};
		eClass.prototype.parent = eClass;
		eClass.extend = function(obj){
			var extended = obj.extended;
			for (var i in obj){
				eClass[i] = obj[i];
			}
			if (extended) extended(eClass);
		};
		eClass.include = function(obj){
			var included = obj.included;
			for (var i in obj){
				eClass.prototype[i] = obj[i];
			};
			if (included) included(eClass);
		};
		return eClass;
	},
	
	EAttribute = function(){},
	EAttribute.prototype = new EModelElement;
	
	EReference = function(){},
	EReference.prototype = new EModelElement;
	
	EOperation = function(){},
	EOperation.prototype = new EModelElement;
	
	EDataType = function(){},
	EDataType.prototype = new EModelElement;
	
	EEnum = function(){}
}).call(this);
