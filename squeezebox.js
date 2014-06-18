/* Squeezebox - vanilla JavaScript accordion
 * MIT License - by Nobita
 */

;(function ( window, document, undefined ) {

	"use strict";

	// *** UTILS ****
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
		// *** Defaults ***
		this.wrapperEl = '.squeezebox';
		this.headersClass = 'squeezhead';
		this.foldersClass = 'squeezecnt';
		this.closeOthers = true;
		this.speed = '.7s';

		// Override defaults
		if( opts ){
			for ( var opt in opts ){
				this[opt] = opts[opt];
			}
		}
	};

	_Squeezebox.prototype = {
		init : function(){		
			var self = this;
			this.wrapper = document.querySelectorAll(this.wrapperEl);
			Array.prototype.forEach.call(this.wrapper,function(wr, idx, node){
				self.getHeights(wr); 
				self.setListeners(wr); 
			});
		},
		// The following method can be called whenever the content of the folder changes
		// in order to update its height. Example
		// var sqbox = new Squeezebox();
		// .....inject content...
		// sqbox.getHeights(wrapper)

		// TODO: the following method works only if the tabs are closed, refactor it
		// so that the user needs will be able to update the div height of currently open tabs
		getHeights : function(wr){
			// Call this method 
			var self = this,
				 folders = wr.getElementsByClassName(self.foldersClass),
				 fl = folders.length,
				 el,
				 elst;

			// Getting height of hidden elements can be tricky.
			// We need to:
			// - make sure they DO NOT have display:none so they have actual height
			// - they remain invisibile (visibility:hidden)
			// - they git position:absolute so they take no space at all
			// - they have no transitions attached so that the changes in style take place immediately
			// Then we can show the element (if hidden), record its styles, and backtrack again.
			while(fl--){
				el = folders[fl],
				elst = el.style;
				elst.position = 'absolute';
				elst.visibility = 'hidden';
				elst.display = '';
				elst.transition = '';
			// TODO: add will-change for better performance? http://dev.opera.com/articles/css-will-change-property/
				self.showEl(el);
				setAttrs(el, {
					'data-sq_h'  : getStyle(el, 'height'),
					'data-sq_pt' : getStyle(el, 'padding-top'),
					'data-sq_pb' : getStyle(el, 'padding-bottom')
				});	
				elst.position = 'relative';
				elst.visibility = 'visible';
				self.hideEl(el);		
				self.addTran(el);
			}
		},
		addTran : function(el){
			var self = this;
			setTimeout(function(){
				el.style.transition = 'all ' + self.speed;				
			}, 100);
		},
		hideEl : function (el){
			var elst = el.style;
			elst.maxHeight = 0;
			elst.paddingTop = 0;
			elst.paddingBottom = 0;
			// set its aria-role
			el.setAttribute('aria-hidden', 'true');
		},
		showEl : function(el){
			var elst = el.style;
			elst.maxHeight = el.getAttribute('data-sq_h');
			elst.paddingTop = el.getAttribute('data-sq_pt');
			elst.paddingBottom = el.getAttribute('data-sq_pb');
			el.setAttribute('aria-hidden', 'false');			
		},
		hideSibl : function(el){
			var self = this;
			Array.prototype.forEach.call( siblings(el, self.foldersClass), function( sib, idx, ndl){
				self.hideEl(sib);
			});
		},
		setListeners : function(wr){
			var self = this;
			// We attach only one listener per accordion and delegate the event listening
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
			   // store a reference to the clicked el to be passed as a callback 
			   // as 'onOpen' or 'onClose' later on
			   self.clickedEl = el;
			   // now el is = to the actual element we need the event to be bound to			   
			   self.toggle( el.nextElementSibling );
				
			});
		},
		toggle : function(el){
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






