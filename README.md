# modal.js

Modals are everywhere on webpage nowadays. My purpose is to do a really simple, light, efficient, and, last but not least, extremely useful plugin!

This plugin will allow you to easily declare and customize a nice modal:
* declare your modal with the properties of your choice
* display it with your DOM or JS manipulations
* modify it as you wish with events and methods joined with this plugin (see below). You can totally redraw your own modal!

## Installation

The good and old fashioned way! Get the css and js files from the file navigation above (min or not, as you want).

Then, include the style and script as bellow:

```html
	<link rel="stylesheet" href="css/modal.css"/>
	<script type="text/javascript" src="js/modal.js"></script
```

***And jQuery you said?*** As I said before, this plugin needs to be simple and light, no need of jQuery!

***For Internet Explorer users (meh)***: This plugin will works with IE9+, not below!

## Usage

Here's an example of how you can build your modal and use it.

In your HTML, use a "data-modal" attribute to the DOM element that you will link to your modal (a click on it will open the modal).

```html
	<button id="open" data-modal="myModal"></button>
```

Then, into your script (in an HTML or JS file, but after your modal.js declaration):

```js
	var modal = new Modal({
		autoOpen: true, // this modal will be immediately open when the page is loaded
		content: 'My modal content !', // why not use a DOM element that you can extract thanks to innerHTML or with jQuery ?,
		customClass: 'myOwnClass andAntoherOne',
		height: 500,
		id: 'myModal', // as into the data-modal button !
		title: 'My modal title !', // use a simple text here, but you can use HTML too !
		transition: 'fade', // for the transition effect
		width: 700
	});
```

And here we are, your modal is ready to be displayed after the open button will be clicked!
Most of these properties have no need to be edited if you want a simple modal, but you can see here that it's well customisable. And there are some other possibilities, see Options section.

### Open a modal

You can open your modal thanks to JS too:

```js
	var button = document.getElementById('open');
	button.addEventListener('click', function () {
		modal.open();
	});
```

### Close a modal

To close your modal, there are several ways:
* if the option closeByOverlay is set, click on this one will close the modal
* if the option addCloseBtn is set, a button will be added into your modal header template. You can set the content and the class of this button (see Options section).
* into your modal template, any click on an element with the class 'modal-close' will close it
* call manually modal.close();

## Options

Here's an options list for your modal with the default value:

```js
	// The default modal template
	var modalTemplate = 
		'<header class="modal-title"><p></p></header>'+
		'<div class="modal-content"></div>'
	;

	var modalOptions = {
		addCloseBtn: true, // add the close button to the modal's template
		attributes: {}, // init attributes object (see Attributes into the Tips section)
		autoOpen: false, // modal will be displayed or not when the page is ready
		closeByOverlay: true, // will close the modal when a click is done outside
		closeBtn: '&#10006', // close button content (a cross)
		closeBtnClass: '', // close button classes (in addition with modal-mainClose)
		content: '', // modal's content (display into the 'modal-content' class of your template)
		customClass: '', // class in addition to the modal default class
		escapeClose: true, // Press 'Esc' will close the modal
		height: 400, // the default height
		id: 'modal'+NbModal, // this id needs to be unique. By default, it will be 'modal1' where your modal is the first declared
		template: modalTemplate, // template of the modal, see Template section for more details
		title: '', // modal's title (display into the <p> tag of 'modal-title' class of your template))
		transition: 'fade', // transition CSS reference. See Transition effect part into the Tips section for more details
		transitionDuration: 400, // duration close/open animation (in ms)
		width: 500 // the default width
	};
```

## Events

These events are triggered all along the open/close cycle.

* ***beforeOpen***: when the modal is open and the transition animation started
* ***open***: modal is open and transition is over
* ***beforeClose***: modal is closed and the transition animation started
* ***closed***: modal is closed and transition is over

Here's an example of how you can deal with one of these events:

```js
	var myModal = document.getElementById('myModal');
	myModal.addEventListener('open', function (e) {
		// use e.detail to access to the modal object
		console.log('My modal is now open !');
	});
```

## Methods

Call any of these methods with the according modal variable. For all those following examples, we consider the modal instance as below:
```js
	var modal = new Modal({...});
```

### open

Open manually your modal
```js
	modal.open();
```

### close

Close manually your modal
```js
	modal.close();
```

### destroy

Remove your modal instance and the DOM equivalent
```js
	modal.destroy();
```

### setCloseByOverlay

Reset closeByOverlay option
```js
	modal.setCloseByOverlay(true); // if it was false for example
```

### setContent

Reset modal's content
```js
	var newContent = '<p>A new content !</p>';
	modal.setContent(newContent);
```

### setSize

Reset modal's sizes
```js
	modal.setSize(400,600); // first param: the new height, second param: the new width
```

### setId

Reset modal's id
```js
	modal.setId('myNewId'); // watch out, this id must remain unique !
```

### setTemplate

Reset modal's template. Once this edition is done, other modal's properties will be injected again (title and content).
* If you don't need to add a dynamic title, do not add a 'modal-title' class to one of your element with a p HTML tag inside.
* Same for the content, do not add a 'modal-content' class element to one of your elements, if you don't need to display the dynamic content
```js
	var newTemplate = 
		'<div class="modal-title"><a href="#">...</a><p>(Here will be push my dynamic title)</p></div>'+
		'<article><h2>A title for my content</h2><div class="modal-content">(Here will be push my dynamic content)</div></article>'
	;
	modal.setTemplate(newTemplate); // the template will be reset with the dynamic title and content !
```

### setTitle

Reset modal's dynamic title. (a "modal-title" class with a p HTML tag inside)
```js
	modal.setTitle('My new modal title !');
```

### setTransition

Reset modal's transition effect. See Transition effect part into the Tips section for more details 
```js
	modal.setTransition('donna'); // you can assign here your own transition reference! But you'll need to defined it into your CSS (see transition effect part for more details)
```

Here's a good example of how you can deal with one of these methods and combine with an event:
```js
	var myModal = document.getElementById('myModal');
	myModal.addEventListener('closed', function (e) {
		e.detail.setTransition('myCustomTransition'); // use e.detail to dynamically access to this modal
	});
```

## Tips

* If you edit template and you want to keep a dynamic title and content, see the setTemplate part in the Methods section.

* When you use an event and you want to dynamically apply a specific method to this modal, use e.detail as described in the final example of the Methods section.

* You can combine [Font Awesome](http://fontawesome.io/) for example for your close button. To do this, check this example:
	```js
		var modal = new Modal({
			closeBtn: '',
			closeBtnClass: 'fa fa-times'
		});
	```

* The CSS of the plugin contains several transition animations for your modal. The default one is a simple animation, the others are:
	* scale
	* fall
	* val (this one will not work well on IE, unfortunately)
	* donna
	* don

	These nice animations are taken from [tympanus.net](http://tympanus.net/codrops/) (http://tympanus.net/Development/ModalWindowEffects/ and http://tympanus.net/Development/DialogEffects/). A lot of thanks to these great guys for their work!

	***If you want to create your own transition effect***, you can do this (into a CSS file):
	```css
		body > #modalBackground.show .modal[data-transition="myOwnTransition"] {
			-webkit-animation-name: transition-open;
			animation-name: transition-open;
		}
		.modal.close[data-transition="myOwnTransition"] {
			-webkit-animation-name: transition-close;
			animation-name: transition-close;
		}
		@-webkit-keyframes transition-open {
			0% {...}
			100% {...}
		}
		@keyframes transition-open {
			0% {...}
			100% {...}
		}

		@-webkit-keyframes transition-close {
			0% {...}
			100% {...}
		}
		@keyframes transition-close {
			0% {...}
			100% {...}
		}
	```

* The option 'attributes' will allow you to add some data informations to your modal. For example:
	```js
		var modal = new Modal({
			attributes: {
				status: 'online',
				quantity: 12,
				...
			}
		});
	```
	It will give to your modal data-status with online as value and data-quantity attributes with 12.
	You can use this to adapt the style of your modal (*[data-attribute="online"]) or get values with JS for some business.

* ***To add an element so that you can close your modal***, such a button with a "Let's go !" indication, specify a 'modal-close' class to this one. Each DOM element with this class into your content will close the modal with a click.

## Licensing

This code is licensed under the MIT License.