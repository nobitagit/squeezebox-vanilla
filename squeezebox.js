/*!
 * Squeezebox
 * A minimal Vanilla JavaScript accordion
 * 
 * MIT License
 * by Nobita
 */

;(function ( window, document, undefined ) {

	"use strict";

	var i, len, initialized;

	function getStyle(el, prop){
		 return window.getComputedStyle(el).getPropertyValue(prop);
	}
	function setAttrs(el, attrs){
	  for(var key in attrs) {
	    el.setAttribute(key, attrs[key]);
	  }
	}
	// as in this case we only need to find siblings of the same class the cls argument
	// is needed evry time for this function to work as there's length checking before return;
	function siblings(el, cls){
		return Array.prototype.filter.call(el.parentNode.children, function(child){
		  return child !== el && child.classList.contains(cls);
		});
	}
	function iter(nodes, fn){
		return Array.prototype.slice.call(nodes);
	}

	var _Squeezebox = function(el, opts){

		// Defaults
		this.wrapper = document.getElementsByClassName('squeezebox');
		this.headersClass = 'squeezhead';
		this.foldersClass = 'squeezecnt';
		this.closeOthers = true;
		this.animated = true;
		this.speed = '.5s'

		//Override defaults
		if( opts === undefined || typeof opts === 'function'){
			for ( opt in opts ){
				this[opt] = opts[opt];
			}
		}
		this.animProps = ' height: auto; transition: all '+ this.speed +';';

	};


	_Squeezebox.prototype = {
		init : function(){
			this.selectEls();
		},
		selectEls : function(){		
			var len = this.wrapper.length,
				 self = this;

			Array.prototype.forEach.call(this.wrapper,function(wr, idx, node){

				//var heads = wr.getElementsByClassName(self.headersClass);
				var folders = wr.getElementsByClassName(self.foldersClass),
					 fl = folders.length;

				while(fl--){
					var el = folders[fl];;
					// Register the div height in a custom attribute
					setAttrs(el, {
						'data-sq_h'  : getStyle(el, 'height'),
						'data-sq_pt' : getStyle(el, 'padding-top'),
						'data-sq_pb' : getStyle(el, 'padding-bottom')
					});
					// Hide the element
					self.hideEl(el);
				}

				self.setListeners(wr);
			});

		},
		hideEl : function (el){
			var self = this,
				 elst = el.style;
			elst.maxHeight = 0;
			elst.paddingTop = 0;
			elst.paddingBottom = 0;
			//elst.overflow = 'hidden';
			// set its aria-role
			el.setAttribute('aria-hidden', 'true');

			// add animation class only once and after the folders have been hidden
			// so the animtion does not occur at load time
			if (!initialized){
				setTimeout(function(){
					el.style.cssText += self.animProps;
					initialized = true;
				},10);
			}
		},
		showEl : function(el){
			var elst = el.style;
			elst.maxHeight = el.getAttribute('data-sq_h');
			elst.paddingTop = el.getAttribute('data-sq_pt');
			elst.paddingBottom = el.getAttribute('data-sq_pb');
			el.setAttribute('aria-hidden', 'false');			
		},
		hideSibl : function(el){
			//Array.prototype.forEach.call()
			var self = this;
			Array.prototype.forEach.call( siblings(el, self.foldersClass), function( sib, idx, ndl){
				self.hideEl(sib);
			});
		},
		setListeners : function(wr){
			var self = this;
			wr.addEventListener('click', function(e){
			   var el = e.target;
			   // check that the event bubbles up to the proper header.
			   while (el && !el.classList.contains(self.headersClass) ){
			     el = el.parentNode;
			   }
			   // now el is = to the actual element we need the event to be bound to			   
			   self.toggleState( el.nextElementSibling );
				
			});
		},
		toggleState : function(el){
			if ( el.getAttribute('aria-hidden') === 'false'){
				// IF visbile hide it
				this.hideEl(el);
			} else {
				// IF hidden show it
				this.hideSibl(el);
				this.showEl(el);
			}
		}
	};

	window.Squeezebox = _Squeezebox;

})( window, document );






