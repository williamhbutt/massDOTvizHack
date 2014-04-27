$(function(){
	$('a[href=#]').on('click', function(e){
		e.preventDefault();
	});

	$('#river').css({
		height: $(window).height(),
		width: $(window).width()
	})

	$( "#from" ).datepicker({
		defaultDate: "-1w",
		changeMonth: true,
		numberOfMonths: 3,
		onClose: function( selectedDate ) {
			$( "#to" ).datepicker( "option", "minDate", selectedDate );
		}
	});
	$( "#to" ).datepicker({
		defaultDate: "+1w",
		changeMonth: true,
		numberOfMonths: 3,
		onClose: function( selectedDate ) {
			$( "#from" ).datepicker( "option", "maxDate", selectedDate );
		}
	});

	$('.routes .filter input#filter').on('keyup change blur', function(){
		if ($('.routes .filter input#filter').val().length) {
			filterRoutes.search($('.routes .filter input#filter').val(), $(this).closest('.list-group'));
		} else {
			filterRoutes.clear($('.routes'));
		}
	});
	$('.routes .filter button.icon-erase').on('click', function(){
		filterRoutes.clear($('.routes'));
	})
	filterRoutes.updateBadges($('.routes'));

	$('.annotations .filter input#filter').on('keyup change blur', function(){
		if ($('.annotations .filter input#filter').val().length) {
			filterRoutes.search($('.annotations .filter input#filter').val(), $(this).closest('.list-group'));
		} else {
			filterRoutes.clear($('.annotations'));
		}
	});
	$('.annotations .filter button.icon-erase').on('click', function(){
		filterRoutes.clear($('.annotations'));
	})
	filterRoutes.updateBadges($('.annotations'));

	$('#controls .handle a').on('click',function(e){
		e.preventDefault();
		$('#controls').toggleClass('open');
	})
	$('a.list-group-item').on('click',function(e){
		$(this).toggleClass('active');
	});

	setTimeout(function(){loadingScreen.close();}, 1750);

	$('a.icon-digitaslbi-logo').on('click',function(e){
		loadingScreen.open();
		setTimeout(function(){loadingScreen.close();}, 250);
	});
});


var filterRoutes = {
	search: function(_term, _list){
		/* hide all */
		$(_list).find($('.contained-list a.list-group-item')).hide();

		/* show matches */
		$(_list).find($('.contained-list .list-group-item:contains("'+_term+'")')).show();

		filterRoutes.updateBadges(_list);
	},
	clear: function(_list){
		$(_list).find($('.filter input#filter')).val('');
		$(_list).find($('.contained-list a.list-group-item')).show();
		filterRoutes.updateBadges(_list);
	},
	updateBadges: function(_list) {
		/* update badges */
		var $headingList = $(_list).find($('.contained-list div.list-group-item.heading'));
		$headingList.each(function(){
			var count = 0;
			var thisIndex = $(_list).find('.contained-list div.list-group-item.heading').index($(this));
			//console.log($(this).nextUntil($headingList[thisIndex+1]), $(this).nextUntil($headingList[thisIndex+1]));
			$(this).nextUntil($headingList[thisIndex+1]).each(function(){
				if ($(this).is(':visible')) {
					count++;
				}
			});
			$(this).find('.badge').text(count);
		});
	}
}

var hideLoadingTimeout = null;
var loadingScreen = {
	open: function(){
		$('#loading').css('display', 'block');
		$('body').addClass('loading');
	},
	close: function(){
		$('body').removeClass('loading');
		hideLoadingTimeout = setTimeout(function(){$('#loading').css('display', 'none');},250);
	}
}
