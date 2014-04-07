$(document).ready(function() {
	$('#ball').click(function(){
		$(this).effect('explode');
	});
	$('#button').hover(function() {
		$(this).addClass('red');
	});
	$('ol').sortable();
    $('#header').slideDown('slow');
	$('img').animate({top:'+=100px'},1000);
	$('#header').mouseenter(function() {
        $('#header').fadeTo('fast', 1);
    });
    $('#header').mouseleave(function() {
        $('#header').fadeTo('fast', 0.5);
    });
	$("#menu").accordion({collapsible: true, active: false});
});