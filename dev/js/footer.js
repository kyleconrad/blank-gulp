$( document ).ready(function() {

	// Base Variables
	var windowWidth = $( window ).width(),
		windowHeight = $( window ).height();

	var $html = document.getElementsByTagName( 'html' )[0],
		$body = document.getElementsByTagName( 'body' )[0];

	var isMobile = navigator.userAgent.match( /mobile/i ),
		isDesktop;





	// Mobile / Desktop Classes & Checks
	if ( isMobile ) {
		$body.classList.add( 'mobile' );
	}
	else if ( !isMobile ) {
		$body.classList.add( 'desktop' );
	}






	// Safari Font Fix
	// based on http://stackoverflow.com/a/31842229
	safariFontFix();

	function safariFontFix() {
		var is_chrome = navigator.userAgent.indexOf( 'Chrome' ) > -1,
			is_explorer = navigator.userAgent.indexOf( 'MSIE' ) > -1,
		    is_firefox = navigator.userAgent.indexOf( 'Firefox' ) > -1,
		    is_safari = navigator.userAgent.indexOf( 'Safari' ) > -1,
		    is_opera = navigator.userAgent.indexOf( 'Presto' ) > -1,
		    is_mac = (navigator.userAgent.indexOf( 'Mac OS' ) != -1);
		    is_windows = !is_mac;

	    if ( is_chrome && is_safari ) {
			is_safari = false;
	    }

	    if ( is_safari || is_windows ) {
			$body.classList.add( 'safari-font-fix' );
	    }
	}





	// Widow Control
	widowControl();

	function widowControl() {
		// Add elements to variable below
		var windowWidth = $( window ).width(),
			widowElements = $( '' );

		widowElements.each( function() {
			$( this ).html( $( this ).html().replace( /&nbsp;/g, ' ' ) );
		});

		if ( windowWidth > 700 ) {
			widowElements.each( function() {
			    $( this ).html( $( this ).html().replace( /\s((?=(([^\s<>]|<[^>]*>)+))\2)\s*$/, '&nbsp;$1' ) );
			});
		}
	};





	// Debounce Resize
	// based on http://stackoverflow.com/a/27923937
	$( window ).on( 'resize', function() {
		var newWindowWidth = $( window ).width();

		windowHeight = $( window ).height();

		// Only fire on horizontal resize
		if ( windowWidth != newWindowWidth ) {
			clearTimeout( window.resizedFinished );

			window.resizedFinished = setTimeout( function(){
				widowControl();

				windowWidth = $( window ).width();
			}, 250);
		}
	});

});