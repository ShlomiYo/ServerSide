
var mongoose = require('mongoose');
var schema = mongoose.Schema;



var myUsersSchema = new schema({

		mail: {type:String, index:1, required:true, unique:true}, // index == that this row will be reveived faster, and the 1 == "true"	
		user: {type:String, index:1, required:true},
		pass: {type:String, required:true},		
		apart: {type:String, required:true}

}, {collection:"myUsers"}); // , { _id : false }); ?



exports.myUsersSchema = myUsersSchema;


