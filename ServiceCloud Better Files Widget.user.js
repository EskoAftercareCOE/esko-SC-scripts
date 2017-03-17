// ==UserScript==
// @name        ServiceCloud Better Files Widget
// @author      bevi@esko.com
// @namespace   com.esko.bevi.betterfiles
// @description Makes the files widget use all the available vertical space
// @include     /^http(s)?:\/\/(esko\.my\.salesforce\.com)\/([0-9A-Z]+\?)(.*)$/
// @include     /^http(s)?:\/\/(esko--accept\.cs83\.my\.salesforce\.com)\/([0-9A-Z]+\?)(.*)$/
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require     https://raw.githubusercontent.com/sizzlemctwizzle/GM_config/master/gm_config.js
// @require     https://gist.githubusercontent.com/BrockA/2625891/raw/9c97aa67ff9c5d56be34a55ad6c18a314e5eb548/waitForKeyElements.js
// @require     http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js
// @version     4
// @downloadURL https://github.com/tuxfre/esko-SC-scripts/raw/master/ServiceCloud%20Better%20Files%20Widget.user.js
// @icon        data:image/gif;base64,R0lGODlhIAAgAKIHAAGd3K/CNOz4/aje8zGv3HLJ63PAsv///yH5BAEAAAcALAAAAAAgACAAQAPGeLrc/k4MQKu9lIxRyhaCIhBVYAZGdgZYCwwMKLmFLEOPDeL8MgKEFXBFclkIoMJxRTRmaqGedEqtigSFYmYgGRAInV3vlzGsDFonoCZSAlAAQyqeKrDUFK7FHCDJh3B4bBJueBYeNmOEX4hRVo+QkZKTV4SNBzpiUlguXxcamRFphhhgmgIVQSZyJ6NGgz98Jl9npFwTFLOlJqQ1FkIqJ4ZIZIAEfGi6amyYacdnrk8dXI6YXVlGX4yam9hHXJTWOuHk5RAJADs=
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_log
// ==/UserScript==

// two arrays containing file extensions that we handle specifically for viewing
// images
var imageformats = ["jpg", "jpeg", "gif", "png", "pdf", "svg", "tiff", "tif", "bmp", "ico"];
// text
var textformats = ["txt", "xml", "log", "rtf"];


this.$ = this.jQuery = jQuery.noConflict(true);
// adding jQueryUI stylesheet
$("head").append ('<link href="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/themes/redmond/jquery-ui.min.css" rel="stylesheet" type="text/css">');

// overriding the tooltip styling
$("head").append ('<style>.ui-tooltip{ max-width: 50%; width: 50%; max-height: 90%; overflow: hidden;}</style>');

// custom function/extension to match exactly the contents of element is css-style selection
$.expr[':'].textEquals = $.expr.createPseudo(function(arg) {
	return function( elem ) {
		return $(elem).text().match("^" + arg + "$");
	};
});

// we wait for one of our targets to be fully instanciated
waitForKeyElements ('div.eFilesWidget', init);


function init() {
	// let's first use all the vertical space we have ...
	$('div.eFilesWidget > div.eWidgetBody').css( "height", "100%" );
	// now we display all the files (not just the most recent)
	$('a[onclick*="eCaseUnifiedFilesShowAll"]').click();
	// and now let's change all the file links
	$('div.eFilesWidgetFileNameContainer > a').each(function(index) {
		// a bit of caching for performance
		var $this = $(this);
		// getting SFDC's file ID
		var fileID = $this.attr("href").match(/javascript:srcUp\('%2F([^%]+)%3F[^']+'\);/)[1];
		// getting the file name
		var fileName = $this.text().trim();
		// extracting the extension
		var fileExtension = fileName.substr((~-fileName.lastIndexOf(".") >>> 0) + 2).toLowerCase();
		// populating the direct url to the file
		var directFileURL = $('a[onclick*="'+fileID+'"]:textEquals("Download")').attr("onclick").match(/entityFilesComponent\.performAction\(\'[^']+\', \'[^']+\', \'[^']+\', \'([^']+)\'/)[1];
		// changing the link's href
		$this.attr("href", directFileURL);
		// changing the link's target to open in new window/tab
		$this.attr('target','_blank');
		// if the file is an image...
		if ($.inArray(fileExtension, imageformats) !== -1) {
			// we add a tooltip
			$this.tooltip({
				position: {
					my: "center top",
					at: "center top+30px",
					of: "div.centerContent"
				},
				content: '<div><img src="'+directFileURL+'" style="width: 100%; height: 100%;" /></div>'
			});
		// if the file is text
		} /*else if ($.inArray(fileExtension, textformats) !== -1) {
			// create a text tooltip [not working because of SFDC]
			$(this).tooltip({
				position: {
					my: "center top",
					at: "center top+5%",
					of: "div.centerContent"
				},
				content: '<div><iframe src="'+directFileURL+'" style="width: 100%; height: 100%;" /></div>'
			});

		}*/ /* SFDC forces the download regardless */
	});
}

