(function(window){
	
	var libraries = {},
		loaded = [],
		blazedefer = function(){return blazedefer;};

	/**
	 * Add onload listener to an element
	 */
	function elementReady(element, callback) {

		var readyState = function(){
				if(element.readyState == "complete") {
					callback.call(element)
				}
		}

		if(element.addEventListener){
			element.addEventListener('DOMContentLoaded',callback);
			element.addEventListener('load',callback);
		}else{
			element.attachEvent('onreadystatechange',readyState);
			element.attachEvent('onload',callback);	
		}

		return element;
	}


	/**
	 * create element base from the source
	 * @return DOMElment
	 */
	function createElement(source){
		var el;
		if( (/.js$/).test(source) ){
			el = document.createElement('script');
			el.src = source;	
		}else{
			el = document.createElement('link');
			el.rel = "stylesheet";
			el.href = source;	
		}
		
		return el;
	}


	/**
	 * extends object1 with the object2
	 */
	function extend(obj, obj2) {
		
		for(attr in obj2) {
			obj[attr] = obj2[attr];
		}

		return obj;
	}


	/**
	 * public methods of bladedefer
	 */	
	var methods = {


	 	/**
		 * check if the script is already loaded
		 * @param string name
		 */
	 	isLoaded: function(name){
		 	return loaded.indexOf(name) > -1 ? true : false;
		},

		/**
		 * check if the scripts are already loaded
		 * @param Array scripts
		 */
		isAllLoaded: function(scripts){
			for(var i in scripts) {
				/**
				 * if one script is not loaded, immediately returns false
				 */
				if(!this.isLoaded(scripts[i])) {
					return false;
				}
			}

			return true;
		},
		/**
	  	 * add libraries to the listing
	  	 * @param object libs
	  	 */
		libraries: function(libs){
		 	extend(libraries, libs);
		 	return this;
		},

		/**
		 * execute a function when the dependencies are loaded
		 * @param array dependencies
		 * @param function callback
		 */
		run: function(dependecies, callback){

			var _loaded = [];
			
			/**
			 * loop through each dependency script
			 */
			 for(var i in dependecies) {
			 	var scriptName = dependecies[i];

			 	/**
			 	 * check if the script is already loaded in the html
			 	 */
			 	 if(this.isLoaded(scriptName)) {
			 	 	
			 	 	_loaded.push(scriptName);

			 	 } else {
			 	 	/**
			 	 	 * check if the script name exists in the library listing
			 	 	 */
			 	 	var self = this,	
			 	 		scriptData = libraries[scriptName];

			 	 	 /**
			 	 	  * stop and log error if the script doesnt exists in the list
			 	 	  */
			 	 	if(!scriptData) {
			 	 	 	return console.error("Script: "+scriptName+" doesn\'t exists in the library.");
			 	 	}

			 	 	 /**
			 	 	  * check if the data is a string or an object
			 	 	  * if string, transform it to object for uniform datatype
			 	 	  */
			 	 	scriptData = scriptData.constructor == String ? {url: scriptData} : scriptData;

			 	 	/**
			 	 	 * check for the dependency of the script
			 	 	 */
			 	 	if(scriptData.dependency) {

			 	 	} else {
				 	 	/**
				 	 	 * the script doesnt have any dependency
				 	 	 */
				 	 	 var docScript = createElement(scriptData.url);

				 	 	 /**
				 	 	  * add onload listener for the script tag
				 	 	  */
				 	 	 elementReady(docScript, function(){
				 	 	 	_loaded.push(scriptName);
				 	 	 	loaded.push(scriptName);


				 	 	 	if(self.isAllLoaded(dependecies)) {

				 	 	 	}

				 	 	 })
			 	 	}

			 	 }
			 }
			return this;
		},

		/**
		 * load js scripts 
		 */
		loadScripts: function(dependecies, scripts){
			return this;
		}
	 }


	 window.blazedefer = extend(blazedefer, methods);

})(window);