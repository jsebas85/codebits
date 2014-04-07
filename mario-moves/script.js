$(document).ready(function() {
    setInterval(function() { 
		for(i=0; i < 50; i++)
    	{
    		$('img').animate({left: "+=10px"}, 'fast');
    	}
    	
    	for(i=0; i < 30; i++)
    	{
    		$('img').animate({left: "-=10px"}, 'fast');
    	}
	},1000) 
    
    	
   
});