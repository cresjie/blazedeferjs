(function(window){
	
	var libraries = {},
		queues = {},
		loaded = [],
		blazedefer = function(){return blazedefer;};

	/**
	 * Add onload listener to an element
	 */
	function elementReady(element, callback, param) {

		var fired = false,
			ready = function() {
				
				/** 
				 * makes sure that the callback is only executed once
				 */
				if(!fired){
					fired =true;
					callback.apply(element, param);
					
				}
			},
			readyState = function(){
				if(el.readyState == "complete") {
					ready();
				}
			};

		if(element.addEventListener){
			element.addEventListener('DOMContentLoaded',ready);
			element.addEventListener('load',ready);
		}else{
			element.attachEvent('onreadystatechange',readyState);
			element.attachEvent('onload',ready);	
		}

		return element;
	}


	/**
	 * create element base from the source
	 * @return DOMElment
	 */
	function createElement(source, name){
		var el;
		if( (/.js$/).test(source) ){
			el = document.createElement('script');
			el.src = source;	
			el.async = true;
		}else{
			el = document.createElement('link');
			el.rel = "stylesheet";
			el.href = source;	
		}

		/**
		 * set the name of the element
		 */
		if(name) {
			el.setAttribute('blazedefer-library', name);
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

		elementReady: elementReady,

		/**
		 * check url if its the same host with the window url
		 */
		isSameHost: function(url) {
			/**
			 * a nifty trick to have a complete web url
			 */
			 var a = document.createElement('a');
			 a.href = url;

			 return a.href.indexOf(window.location.host) > -1 ? true : false;
		},

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
		run: function(dependencies, callback, param){

			/**
			 * initiate variable functions to be called later
			 */ 
			var self = this,
				callback = callback ? callback : function(){},
				dependencies = dependencies ? dependencies : [],
				reCheckDependency = function(){
					/**
					 * recheck dependencies if everything is already loaded
					 */
					 if(self.isAllLoaded(dependencies)) {
					 	callback.apply(this, param);
					 }
				},
				loadToDocument = function(url, scriptName){

					var firstQueue = false,
						docScript;
					/**
					 * check first if the script is already in queue
					 */
					 if(queues[scriptName]) {
					 	/**
					 	 * the script is already in the queue listing
					 	 * then just retreive its script tag instance 
					 	 * and add "ready" event later
					 	 */
						docScript = queues[scriptName];
					 } else {

					 	docScript = createElement(url, scriptName);
					 	queues[scriptName] = docScript;
					 	firstQueue = true;
					 }
						
			 	 	 /**
			 	 	  * add onload listener for the script tag
			 	 	  */
			 	 	 elementReady(docScript, function(){

			 	 	 	/**
			 	 	 	 * if the script is not yet in the list of loaded script
			 	 	 	 */
			 	 	 	if(!self.isLoaded(scriptName)) {
			 	 	 		loaded.push(scriptName);
			 	 	 	}
			 	 	 	/**
			 	 	 	 * remove the script from the queue list
			 	 	 	 */
			 	 	 	queues[scriptName] = null;
			 	 	 	
			 	 	 	reCheckDependency();

			 	 	 });

			 	 	 /**
			 	 	  * and now, add the script in the head section
			 	 	  */
			 	 	  if(firstQueue) {
			 	 	  	document.getElementsByTagName('head')[0].appendChild(docScript);
			 	 	  }
			 	 	 
				};
			
			/**
			 * transform dependencies datatype into array
			 */
			 dependencies = dependencies.constructor == String ? [dependencies] : dependencies;
			 
			 /**
			  * if doesnt have dependencies, then just run the callback immediately
			  */
			 if(!dependencies.length) {
			 	callback.apply(this, param);
			 }


			 /**
			  * added settimeout for a nonblocking rendering in the html
			  */
			 //setTimeout(function(){

			 	/**
				 * loop through each dependency script
				 */
				 for(var i in dependencies) {
				 	var scriptName = dependencies[i];

				 	/**
				 	 * check if the script is already loaded in the html
				 	 */
				 	 if(self.isLoaded(scriptName)) {
				 	 	reCheckDependency();

				 	 } else {
				 	 	/**
				 	 	 * check if the script name exists in the library listing
				 	 	 */
				 	 	var scriptData = libraries[scriptName];

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

				 	 		var dependency = scriptData.dependency;
				 	 		/**
				 	 		 * check and transform the datatype of dependency into array
				 	 		 */
				 	 		dependency = dependency.constructor == String ? [dependency] :  dependency;
				 	 		
				 	 		self.run(dependency, function(data, name){
				 	 			loadToDocument(data.url, name);
				 	 		},[scriptData, scriptName]);

				 	 	} else {
					 	 	loadToDocument(scriptData.url, scriptName);
				 	 	}

				 	 }
				 }
			// });
			
			return this;
		},

		/**
		 * load js scripts 
		 * @param Array dependencies: name of the libraries
		 * @param Array|String scripts: url
		 */
		loadScripts: function(dependecies, urls, callback, params){
			var _loaded = [];
			/**
			 * default value of urls is array
			 */
			urls = urls ? urls : [];

			/**
			 * check urls datatype
			 * and transform it to array 
			 */
			 urls = urls.constructor == String ? [urls] : urls;

			 this.run(dependecies, function(){
			 	for(var i in urls) {
			 		var docScript = createElement(urls[i]);

			 		elementReady(docScript, function(i){
			 			_loaded.push(urls[i]);

			 			if(_loaded.length == urls.length) {
			 				callback.apply(blazedefer, params)
			 			}
			 		},[i]);

			 		document.getElementsByTagName('head')[0].appendChild(docScript);
			 	}
			 });

			return this;
		},

		/**
		 * defer css
		 */
		loaddCss: function(urls){	
			self.loadScripts([], urls);
		}
	 }


	 window.blazedefer = extend(blazedefer, methods);

})(window);