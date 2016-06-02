function Promise(){
	var list = [];

	this.resolve = function(value){
		var item = list.shift();
		item &&  item.success && typeof item.success === 'function' &&  item.success(value,this);	
	};
	this.reject = function(value){
		var item = list.shift();
		item && item.fail && typeof item.fail === 'function' && item.fail(value,this);
	};
	this.then = function(successCbk,failCbk){
		list.push({
			'success':successCbk,
			'fail':failCbk
		});
		return this;
	}
};

Promise.when = function(cbk){
	return cbk();
}


module.exports = Promise;
