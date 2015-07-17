
var mongoose = require('mongoose');
var schema = mongoose.Schema;



var myGroupsSchema = new schema({

		gOwner: {type:String, index:1, required:true, unique:true}, 
		gUsersArr: [String],
		gStatusArr: [String],
		gNamesArr: [String],
		gCity: {type:String, required:true},
		gAddress: {type:String, required:true},
		gPlusArr: [Number]

}, {collection:"myGroups"}); 



exports.myGroupsSchema = myGroupsSchema;


