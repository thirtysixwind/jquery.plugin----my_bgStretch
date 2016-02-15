
$('.warning').on('click', function(){
	$(this).hide();
});

$('.box').my_bgStretch([
	'http://i4.tietuku.com/2f474d4c7133f259.jpg',
	'http://i8.tietuku.com/0610f03bdbb0c4ec.jpg',
	'http://i11.tietuku.com/afd20a4bb208b7ca.jpg'
],{
	centeredX : true,
	centeredY : true,
	switchType : 'slide',
	duration : 3000
});

//控制单个元素
$('.control').each(function(index){
	var $control = $(this);
	$control.find('.pause').on('click', function(){
		$('.box').eq(index).my_bgStretch().pause();
	});
	$control.find('.resume').on('click', function(){
		$('.box').eq(index).my_bgStretch().resume();
	});
	$control.find('.prev').on('click', function(){
		$('.box').eq(index).my_bgStretch().prev();
	});
	$control.find('.next').on('click', function(){
		$('.box').eq(index).my_bgStretch().next();
	});
	$control.find('.show').on('change', function(){
		$('.box').eq(index).my_bgStretch().show(parseInt(this.value));
	});
});

//控制所有元素
$('.controlall').find('.pause').on('click', function(){
	$('.box').my_bgStretch().pause();
});
$('.controlall').find('.resume').on('click', function(){
	$('.box').my_bgStretch().resume();
});
$('.controlall').find('.prev').on('click', function(){
	$('.box').my_bgStretch().prev();
});
$('.controlall').find('.next').on('click', function(){
	$('.box').my_bgStretch().next();
});
$('.controlall').find('.show').on('change', function(){
	$('.box').my_bgStretch().show(parseInt(this.value));
});






