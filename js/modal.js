/**
 * @name modal.js v1.0
 * @author Jean Ehrhardt
 * A really simple, light, efficient, and usefull modal plugin
 */
(function (){
	var nbModal = 0, // identify the modal number (for a default id)
		defaultModalId = '',
		modalWrapper = null, // will contains the DOM modal wrapper selector
		isClosable = true, // to avoid close an unfinished modal's animation
		isTrigger = false, // to avoid trigger flooding
		body = null, // document.body when it will be ready
		classRegex = /^[a-z0-9]+[\w-]*$/i; // to identify if a className is correct

	// The default modal template
	var modalTemplate = 
		'<header class="modal-title"><p></p></header>'+
		'<div class="modal-content"></div>'
	;

	var instances = [];

	/** 
	 * Constructor
	 * @fn Modal
	 * @param userOpt Object which contains the user options that will erased the defaults
	 * The main Modal object is init here
	 */
	this.Modal = function (userOpt) {
		this.options = {};
		this.dom = {}; // to contains the DOM references of modal elements and attribute events to them

		// Default modal id
		nbModal++;
		defaultModalId = 'modal'+nbModal;

		// Init default options
		this.options.addCloseBtn    	= true; // add the close button to the template
		this.options.attributes     	= {}; // init attributes object
		this.options.autoOpen	    	= false; // this modal will be open when the page will be loaded
		this.options.closeByOverlay 	= true; // will close the modal when a click is done outside
		this.options.closeBtn 	    	= '&#10006'; // close button content
		this.options.closeBtnClass 		= ''; // close button classes (in addition with modal-mainClose)
		this.options.content 	    	= ''; // modal's content
		this.options.customClass    	= ''; // default class set
		this.options.escapeClose    	= true; // Press 'Esc' will close the modal
		this.options.headerFixed        = false; // Modal header 'fixed' position
		this.options.height 	    	= null; // there is no specific height by default (will be 'auto' in CSS)
		this.options.id 		    	= defaultModalId; // by default a modal has this id
		this.options.responsive         = true; // modal responsive or not
		this.options.responsiveBrink    = 50; // nb of px that the responsive modal has to leave between window's sides (/2 for each side, so 25 both sides)
		this.options.template 	    	= modalTemplate; // template of the modal
		this.options.title 		    	= ''; // modal's title
		this.options.transition    		= 'fade'; // transition CSS reference
		this.options.transitionDuration = 400; // duration close/open animation (in ms)
		this.options.width 		    	= null; // there is no specific width by default (will be 'auto' in CSS)

		// Check if the user has set personnal properties
		if (typeof userOpt === 'object')
			overwriteDefaults(userOpt,this.options);

		instances.push(this); // save this instance to get it later
		if (instances.length > 1) checkUniqueProp(); // check if some properties keep a unique value

		/* 
		* If a new modal is init after document generation, create it
		* For modals which are created in the document ready event
		*/
		if (body != null) {
			initDOM(this.dom,this.options); // generate DOM of this modal
			initialiseModalEvents.call(this); // Init modal events (call the method to get the context)

			if (this.options.autoOpen) this.open(); // Open directly the modal with the option autoOpen
		}
	};


	/**
	 * @fn open
	 * @param target Selector when the modal 
	   is open in a dynamic way (thanks to the data-modal)
	 * Public method
	 * Open the modal
	 */
	Modal.prototype.open = function (target) {
		// Avoid multiple trigger
		if (isTrigger)
			return;

		var modal = document.getElementById(this.options.id); // The according modal into the DOM

		isClosable = false;

		modalWrapper.style.transitionDuration = this.options.transitionDuration+'ms'; // set transition duration

		// Init custom events with the according context
		var param = {modal: this, target: target};
		var beforeOpen = document.createEvent("CustomEvent"),
			open       = document.createEvent("CustomEvent");
		beforeOpen.initCustomEvent('beforeOpen', false, false, param);
		open.initCustomEvent('open', false, false, param);

		// Trigger beforeOpen event
		setTimeout(function () {
			modal.dispatchEvent(beforeOpen);
		}, 0);

		// Show the modal
		modalWrapper.className = 'show';
		this.dom.id.style.display = 'block';

		// Responsive handling (only if a specific width is set)
		if (this.options.responsive && this.options.width != null) {
			var responsiveBrink = screen.width-this.options.responsiveBrink,
				originalWidth = this.options.width, // the original modal's width as initialized
				reduce = responsiveBrink <= modal.offsetWidth, // modal needs here to be reduce
				stretch = responsiveBrink > modal.offsetWidth && modal.offsetWidth < originalWidth; // modals has been reduced and have to been stretched to get its original width

			if (reduce || stretch)
				modal.style.width = (responsiveBrink > originalWidth ? originalWidth : responsiveBrink)+'px'; // New width can't exceed the original one
		}

		// Trigger opened event (according to the transitionDuration)
		setTimeout(function () {
			modal.dispatchEvent(open);
			isClosable = true; // modal can now be closed
		}, this.options.transitionDuration);
	};


	/**
	 * @fn close
	 * Public method
	 * Close the current modal (thisModal)
	 */
	Modal.prototype.close = function () {
		// Avoid close an unfinished modal's animation
		if (!isClosable)
			return;

		var _     = this,
			modal = document.getElementById(this.options.id); // The according modal into the DOM

		isTrigger = true;

		// Init custom events with the according context
		var param = {modal: _};
		var beforeClose = document.createEvent("CustomEvent"),
			closed      = document.createEvent("CustomEvent");
		beforeClose.initCustomEvent('beforeClose', false, false, param);
		closed.initCustomEvent('closed', false, false, param);

		// Trigger beforeClose event
		setTimeout(function () {
			modal.dispatchEvent(beforeClose);
		}, 0);

		modalWrapper.className = ''; // remove the 'show' class
		modal.className += ' close';
		// Hide modal after transition
		setTimeout(function () {
			modal.className = modal.className.replace(new RegExp('(^|\\b)' + 'close'.split(' ').join('|') + '(\\b|$)', 'gi'), ' '); // remove the 'close' class
			modal.style.display = 'none';
			modal.dispatchEvent(closed); // trigger closed event
		}, this.options.transitionDuration);

		// Any modals can be open again after this timeout
		setTimeout(function () {
			isTrigger = false;
		}, (this.options.transitionDuration >= 600 ? this.options.transitionDuration : 600));
	};


	/**
	 * @fn destroy
	 * Public method
	 * Destroy the modal
	 */
	Modal.prototype.destroy = function () {
		var modal = document.getElementById(this.options.id); // The according modal into the DOM

		// Remove instance
		for (var i=0,length=instances.length; i<length; i++) {
			if (instances[i].options.id == this.options.id) {
				instances.splice(i,1);
				break;
			}
		}

		// remove the DOM (after the transition)
		setTimeout(function(){
			modal.parentNode.removeChild(modal);
		},this.options.transitionDuration);
	};


	/**
	 * @fn setCloseByOverlay
	 * @param bool Boolean if the modal can be close by overlay
	 * Public method
	 * Reset closeByOverlay option
	 */
	Modal.prototype.setCloseByOverlay = function (bool) {
		if (typeof bool == 'boolean') 
			this.options.closeByOverlay = bool;
		else
			throw new Error('(Modal.js) The param needs to be a boolean.');
	};

	/**
	 * @fn setContent
	 * @param content HTML
	 * Public method
	 * Reset modal's content
	 */
	Modal.prototype.setContent = function (content) {
		var modalContent = document.querySelector('#'+this.options.id+' .modal-content'); // The according modal content into the DOM

		if (modalContent != null) {
			this.options.content = content;
			modalContent.innerHTML = content; // DOM insertion
		}
		else
			throw new Error('(Modal.js) Your modal doesn\'t contains any "modal-content" class.');
	};

	/**
	 * @fn setSize
	 * @param height
	 * @param width
	 * Public method
	 * Reset modal's sizes
	 */
	Modal.prototype.setSize = function (height,width) {
		var modal = document.getElementById(this.options.id); // The according modal into the DOM

		this.options.height = height;
		this.options.width = width;

		if (height != null)
			modal.style.height = height+'px';
		else
			modal.style.height = ''; // remove the inline property


		if (width != null)
			modal.style.width = width+'px';
		else
			modal.style.width = ''; // remove the inline property
	};

	/**
	 * @fn setId
	 * @param id String
	 * Public method
	 * Reset modal's id
	 */
	Modal.prototype.setId = function (id) {
		var modal = document.getElementById(this.options.id); // The according modal into the DOM

		if (typeof id == 'string') {
			this.options.id = id;
			modal.id = id;
			checkUniqueProp(); // check if the new id is unique
		}
		else
			throw new Error('(Modal.js) Your id must be a string.');
	};

	/**
	 * @fn setTemplate
	 * @param template String HTML contents of the new modal
	 * Public method
	 * Reset modal's template
	 */
	Modal.prototype.setTemplate = function (template) {
		var modal = document.getElementById(this.options.id); // The according modal into the DOM

		this.options.template = template;
		modal.innerHTML = template;

		var title    = modal.querySelector('.modal-title p'),
			content  = modal.querySelector('.modal-content');

		// Append title
		if (title != null && this.options.title != '')
			title.innerHTML = this.options.title;

		// Append content
		if (content != null && this.options.content != '')
			content.innerHTML = this.options.content;

		// Append close button
		if (this.options.addCloseBtn) {
			createCloseButton(this.options,modal); // create it
			this.dom.closeBtn = modal.querySelector('.modal-mainClose'); // reset the dom reference for event
			initialiseModalEvents.call(this); // Init modal events (call the method to get the context)
		}
	};

	/**
	 * @fn setTitle
	 * @param title String
	 * Public method
	 * Reset modal's title
	 */
	Modal.prototype.setTitle = function (title) {
		var modalTitle = document.querySelector('#'+this.options.id+' .modal-title p'); // The according modal into the DOM

		if (modalTitle != null) {
			this.options.title = title;
			modalTitle.innerHTML = title;
		}
		else
			throw new Error('(Modal.js) Your modal doesn\'t contains any "modal-title" class with a <p> tag.');
	};

	/**
	 * @fn setTransition
	 * @param transition String
	 * Public method
	 * Reset modal's transition
	 */
	Modal.prototype.setTransition = function (transition) {
		var modal = document.getElementById(this.options.id); // The according modal into the DOM

		this.options.transition = transition;
		modal.setAttribute('data-transition',transition);
	};


	/**
	 * @fn overwriteDefaults
	 * @param userOpt Object user options
	 * @param defaultOpt Object default options
	 * Helper: overwrite the default options by the one set by user
	 */
	var overwriteDefaults = function (userOpt, defaultOpt) {
		var userProp;

		// Loop each user property and overwrite this one into the defaultOptions
		for (userProp in userOpt) {
			// Check if this property is well setted into the default options
			if (defaultOpt.hasOwnProperty(userProp))
				defaultOpt[userProp] = userOpt[userProp];
		}

		return defaultOpt;
	};

	/**
	 * @fn checkUniqueProp
	 * Helper: check if the value of a property is unique (for id or autoOpen for example)
	 */
	var checkUniqueProp = function () {
		var idHistory 		= [],
			autoOpenHistory = [],
			idValue 		= null;

		for (var i=0,length=instances.length; i<length; i++) {
			idValue = instances[i].options['id'];

			// Same ids found, feedback
			if (idHistory.indexOf(idValue) >= 0)
				throw new Error('(Modal.js) There is twice same id. There can be only unique id.');

			idHistory.push(idValue);
		}
	};

	/**
	 * @fn createCloseButton
	 * @param modal Object instance's options of the current modal
	 * @param selector HTML selector of the modal into the DOM
	 * DOM generation: Create the close button into the modal template
	 */
	var createCloseButton = function (options,selector) {
		var header 		= selector.querySelector('.modal-title'),
			createClose = document.createElement('span');
		closeBtn = null;

		// If a header is defined, add to it
		if (header != null) {
			closeBtn = header.appendChild(createClose);
		}
		// Otherwise, add it as the first modal child
		else {
			closeBtn = selector.appendChild(createClose);
			selector.insertBefore(closeBtn,selector.firstChild);
		}

		closeBtn.className = 'modal-mainClose';

		// Attribute all custom class specified to the main close button
		if (options.closeBtnClass != '') {
			var customCloseClass = options.closeBtnClass.split(' ');
			for (var i=0,length=customCloseClass.length; i<length; i++) {
				// If an invalid class is specified
				if (!classRegex.test(customCloseClass[i]))
					throw new Error('(Modal.js) An invalid custom class has been specified.');
				else
					closeBtn.className += (' '+customCloseClass[i]);
			}
		}
		closeBtn.innerHTML = options.closeBtn; // Set the main close button content
	};

	/**
	 * @fn initDOM
	 * @param dom Modal dom object
	 * @param options Modal options
	 * DOM generation: Prepare the DOM for modal templates
	 */
	var initDOM = function (dom,options) {
		// Prepare the modal container (only the first time)
		if (modalWrapper == null) {
			var wrapper = document.createElement('div');
			wrapper.id = 'modalBackground';

			// Prepend the modal container as the first body child
			body.appendChild(wrapper);
			body.insertBefore(wrapper,body.firstChild);

			modalWrapper = document.getElementById('modalBackground');
		}

		/*
		* Prepare modal template
		*/
			var newModal = document.createElement('div');
			
			// Id attribution (the default or the custom one)
			newModal.id = options.id;

			// Class attribution
			newModal.className = 'modal'; // default modal class
			if (options.customClass != '') {
				var customClass = options.customClass.split(' ');
				// Attribute all custom class specified to the modal
				for (var i=0,length=customClass.length; i<length; i++) {
					// If an invalid class is specified
					if (!classRegex.test(customClass[i]))
						throw new Error('(Modal.js) An invalid custom class has been specified.');
					else
						newModal.className += (' '+customClass[i]);
				}
			}

			// Template attribution
			newModal.innerHTML = options.template;
			var header = newModal.querySelector('.modal-title'),
				content = newModal.querySelector('.modal-content');

			// Add the fixed class to the modal
			if (header && options.headerFixed)
				newModal.className += ' fixed';

			// Add the close button to the modal
			if (options.addCloseBtn)
				createCloseButton(options,newModal);

			/* If the custom template set by the user
			*  is invalid (no modal-title or modal-content class)
			*  throw the error 
			*/
			if (!header && options.title != '')
				throw new Error('(Modal.js) Your template doesn\'t match the model. If you want to set a title, please add a "modal-title" class with a <p> inside.');
			else if (!content && options.content != '')
				throw new Error('(Modal.js) Your template doesn\'t match the model. If you want to set a content, please add a "modal-content" class to your container.');

			// Title
			if (options.title != '') header.querySelector('p').innerHTML = options.title;

			// Content
			if (options.content != '') content.innerHTML = options.content;

			// Style attribution
			if (options.height != null)
				newModal.style.height = options.height+'px';
			if (options.width != null) {
				newModal.style.width = options.width+'px';
				// Min width smaller than the one set in CSS
				if (options.width < 250)
					newModal.style.minWidth = options.width+'px';
			}
			newModal.style.animationDuration = options.transitionDuration+'ms'; // animation duration
			// Children need to be animated too
			if (options.transition == 'donna') {
				var children = newModal.childNodes;
				for (var i=0,length=children.length; i<length; i++) {
					children[i].style.animationDuration = options.transitionDuration+'ms';
				}
			}

			// Datas-attribute attribution
			newModal.setAttribute('data-transition',options.transition); // Add transition state
			var attr;
			for (attr in options.attributes) {
				newModal.setAttribute('data-'+attr,options.attributes[attr]);
			}

		// Insert modal into the wrapper
		modalWrapper.appendChild(newModal);

		// DOM saving (attribute events to them with initialiseModalEvents)
		dom.id = document.getElementById(newModal.id);
		if (options.addCloseBtn) dom.closeBtn = closeBtn;
	};

	/**
	 * @fn initialiseModalEvents
	 * Initialise events for each modal
	 */
	var initialiseModalEvents = function () {
		// Click on the close button
		if (this.options.addCloseBtn)
			this.dom.closeBtn.addEventListener('click', this.close.bind(this));
	};

	/**
	 * @fn resizeModal
	 * @param Object modal according instance
	 * Resize a responsive open modal if the brink is exceed
	 */
	var resizeModal = function (modal) {
		modals = document.querySelectorAll('#modalBackground .modal');
		// First, find the visible modal
		for (var i=0,length=modals.length; i<length; i++) {
			if (modals[i].style.display == 'block') {
				var instance = findInstance(modals[i].id); // deduce instance of this modal
				// Conisder this modal only if the responsive option and if a specific width are set
				if (instance.options.responsive && instance.options.width != null) {
					var responsiveBrink = screen.width-instance.options.responsiveBrink,
						reduce = responsiveBrink <= modals[i].offsetWidth, // modal needs here to be reduce
						stretch = responsiveBrink > modals[i].offsetWidth && modals[i].offsetWidth < instance.options.width; // modals has been reduced and have to been stretched to get its original width

					if (reduce || stretch)
						modals[i].style.width = responsiveBrink+'px';
				}
				break;
			}
		}
	};

	/**
	 * @fn findInstance
	 * @param idModal Id of the target modal
	 * Helper: find instance of a modal according to the id
	 */
	var findInstance = function (idModal) {
		var instance = null;

		for (var i=0,length=instances.length; i<length; i++) {
			if (instances[i].options.id === idModal) {
				instance = instances[i];
				break;
			}
		}

		// This instance no longer exists
		if (instance == null)
			throw new Error('(Modal.js) The according modal instance no longer exists.');

		return instance;
	};



	/*
	* ******************************
	* @fn ready
	* The document has to be ready to build modals into the DOM
	*/
	var ready = function () {
		body = document.body; // Document is now ready

		/*
		* Body and DOM functions
		*/
			var target, modalTarget, modals = null;

			/**
			 * @fn openDynamic
			 * @param Event clicked
			 * Open a modal thanks to the DOM and the data-modal attribute
			 */
			var openDynamic = function (e) {
				target = e.target;
				modalTarget = target.getAttribute('data-modal');

				// If a data-modal is specified, find the according thanks to the id
				if (modalTarget) {
					var instance = findInstance(modalTarget);
					instance.open(target); // open it
				}
			};

			/**
			 * @fn closeByOverlay
			 * @param Event clicked
			 * @note This function is the same for all modals so we need to call it outside of the initialiseModalEvents method
			 * Close the visible modal when the overlay is clicked
			 */
			var closeByOverlay = function (e) {
				target = e.target;
				if (target.id === 'modalBackground') {
					modals = document.querySelectorAll('#modalBackground .modal');
					// First, find the visible modal
					for (var i=0,length=modals.length; i<length; i++) {
						if (modals[i].style.display == 'block') {
							var instance = findInstance(modals[i].id); // deduce instance of this modal
							// Close this modal only if the closeByOverlay option is set
							if (instance.options.closeByOverlay)
								instance.close(); // close it
							break;
						}
					}
				}
			};

			/**
			 * @fn closeByDOM
			 * @param Event clicked
			 * Close the visible modal when a modal-close element is clicked
			 */
			var closeByDOM = function (e) {
				target = e.target;
				if (target.className === 'modal-close') {
					modals = document.querySelectorAll('#modalBackground .modal');
					// First, find the visible modal
					for (var i=0,length=modals.length; i<length; i++) {
						if (modals[i].style.display == 'block') {
							var instance = findInstance(modals[i].id); // deduce instance of this modal
							instance.close(); // close it
							break;
						}
					}
				}
			};

			/**
			 * @fn closeByEsc
			 * Close the visible modal if the Esc key is pressed
			 */
			var closeByEsc = function () {
				modals = document.querySelectorAll('#modalBackground .modal');
				// First, find the visible modal
				for (var i=0,length=modals.length; i<length; i++) {
					if (modals[i].style.display == 'block') {
						var instance = findInstance(modals[i].id); // deduce instance of this modal
						// Close this modal only if the escapeClose option is set
						if (instance.options.escapeClose)
							instance.close(); // close it
						break;
					}
				}
			};

			// DOM deleguation
			body.addEventListener("click", function (e) {
				openDynamic(e);
				closeByDOM(e);

				// To avoid trigger several close
				if (modalWrapper && (new RegExp('(^| )' + 'show' + '( |$)', 'gi').test(modalWrapper.className)))
					closeByOverlay(e);
			});

			document.addEventListener('keydown', function (e) {
				// If a modal is open and if the key is Esc keycode
				if (modalWrapper && (new RegExp('(^| )' + 'show' + '( |$)', 'gi').test(modalWrapper.className)) && e.keyCode == 27)
					closeByEsc();
			});

			// Resize a responsive modal
			window.addEventListener('resize', function () {
				// If a modal is open
				if (modalWrapper && (new RegExp('(^| )' + 'show' + '( |$)', 'gi').test(modalWrapper.className)))
					resizeModal();
			});

		/*
		* Finally, the DOM is ready, modals can be created
		* Only for modals which are created outside the document ready event
		*/
		var instance = null;
		for (var i=0,length=instances.length; i<length; i++) {
			instance = instances[i];

			initDOM(instance.dom,instance.options); // generate DOM of this modal
			initialiseModalEvents.call(instance); // Init modal events (call the method to get the context)

			if (instance.options.autoOpen) instance.open(); // Open directly the modal with the option autoOpen
		}
	};
	// Trigger before any event as ready with jQuery or onload in vanilla
	document.onreadystatechange = function () {
		if (document.readyState == 'interactive')
			ready();
	};
}());