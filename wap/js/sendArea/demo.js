

var ajaxHandler = function(){

	var promise = new Promise();

	$.ajax({
		url:'xx',
		success:function(data){
			promise.resolve;
		}
	})
	return promise;
}

var getName = function(){
	return this.name;
}

ajaxHandler.then(init);

var init = function(){
	getName();
}