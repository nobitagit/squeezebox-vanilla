/*!
 * Squeezebox
 * A minimal Vanilla JavaScript accordion
 * 
 * MIT License
 * by Nobita
 *
 * Ugly version:
 * Old version: 3974 characters
 * New version: 1779 characters
 * Saved: 2195 (result is 44.7% of original)
 *
 *
 */

;(function ( window, document, undefined ) {

	"use strict";

	var opt, self, initialized;
	// UTILS ****
	function getStyle(el, prop){
		 return window.getComputedStyle(el).getPropertyValue(prop);
	}
	function setAttrs(el, attrs){
	  for(var key in attrs) {
	    el.setAttribute(key, attrs[key]);
	  }
	}
	// as in this case we only need to find siblings of the same class the cls argument
	// is needed every time for this function to work as there's no length checking before return;
	function siblings(el, cls){
		return Array.prototype.filter.call(el.parentNode.children, function(child){
		  return child !== el && child.classList.contains(cls);
		});
	}

	var _Squeezebox = function(opts){

		this.wrapperEl = '.squeezebox';
		this.headersClass = 'squeezhead';
		this.foldersClass = 'squeezecnt';
		this.closeOthers = true;
		this.speed = '.7s';

		//Override defaults
		if( opts ){
			for ( opt in opts ){
				this[opt] = opts[opt];
			}
		}
	};

	_Squeezebox.prototype = {
		init : function(){		
			self = this;
			this.animProps = ' height: auto; transition: all '+ this.speed +';';
			this.wrapper = document.querySelectorAll(this.wrapperEl);

			Array.prototype.forEach.call(this.wrapper,function(wr, idx, node){
				self.getHeights(wr); 
				self.setListeners(wr); 
			});

		},
		getHeights : function(wr){
			// TODO: rewrite this function so that it can calculate the height of a tab even if its
			// hidden and not only at load time, in order to avoid misbehaviours during ajax calls
			// or in caso of a templating system in place
			var folders = wr.getElementsByClassName(self.foldersClass),
				 fl = folders.length,
				 el;
			while(fl--){
				el = folders[fl];;
				// Register the div height/padding in a custom attribute
				setAttrs(el, {
					'data-sq_h'  : getStyle(el, 'height'),
					'data-sq_pt' : getStyle(el, 'padding-top'),
					'data-sq_pb' : getStyle(el, 'padding-bottom')
				});
				// Hide the element
				self.hideEl(el);
			}
		},
		hideEl : function (el){
			var elst = el.style;
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
			Array.prototype.forEach.call( siblings(el, self.foldersClass), function( sib, idx, ndl){
				self.hideEl(sib);
			});
		},
		setListeners : function(wr){
			// We attach only one listener per accordion and delegate di event listening
			wr.addEventListener('click', function(e){
			   var el = e.target;
			   // check that the event bubbles up to the proper header.
			   while (el && !el.classList.contains(self.headersClass) ){
			     el = el.parentNode;
			     // stop bubbling after wrapper is met.
			     if( el === wr ){
			     		return;
			     }
			   }
			   // store a reference to the clicked el to be passed as a callback later on
			   self.clickedEl = el;
			   // now el is = to the actual element we need the event to be bound to			   
			   self.toggleState( el.nextElementSibling );
				
			});
		},
		toggleState : function(el){
			if ( el.getAttribute('aria-hidden') === 'false'){
				// IF visibile hide it
				this.hideEl(el);
				this.fireCallback(el, 'onClose');
			} else {
				// IF hidden show it
				if ( this.closeOthers ) { this.hideSibl(el); }
				this.showEl(el);
				this.fireCallback(el, 'onOpen');
			}
		},
		fireCallback : function(el, dir){
			(this[dir]) ? this[dir](this.wrapper, this.clickedEl, el) : null;
		}
	};

	window.Squeezebox = _Squeezebox;

})( window, document );






