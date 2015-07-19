

var mongoose = require('mongoose');
var myUsersSchema = require("./userSchema").myUsersSchema;
var myGroupsSchema = require("./groupSchema").myGroupsSchema;
var aUser;


mongoose.connect('mongodb://allUsers:135792468@ds047752.mongolab.com:47752/apartment');
mongoose.model('myUsers', myUsersSchema);
mongoose.model('myGroups', myGroupsSchema);


db = mongoose.connection;
db.on('error', function(err){
	console.log('DB connection error:' + err);
});





// Login, check if email and pass are match in the DB and return them as a session if they does

exports.LogMeIN = function(req,res){

	var mail = req.body.mail.toLowerCase();
	var pass = req.body.pass;
	var returnedJson = null;


		aUser.findOne({ $and: [ { mail: req.body.mail} , {pass: req.body.pass} ] } , function (err, doc){

			// failed login
			if(doc == null){

				returnedJson = {"status":"Failed"};
				res.json(returnedJson);
			}
			// success login
			else{

				console.log("The Username: "+mail+" Has Just Logged In\n\n");
				returnedJson = {"status":"Success", "apart": doc.apart};
				res.json(returnedJson);
			}

		});


};




// Register, check if email already exists, if not register him

exports.RegMe = function(req,res){

	var theMail = req.body.mail.toLowerCase();

	var returnedJson = null;


		aUser.findOne( { mail: theMail}, function (err, doc){

			// wasnt found, may register
			if(doc == null){

				console.log("Reg: "+theMail+" "+req.body.user+" "+req.body.pass+" "+req.body.city+" "+req.body.add+" "+req.body.amount);

				var newUser = new aUser({

					mail: theMail,
					user: req.body.user,
					pass: req.body.pass,
					apart: "0"
			
				});
				newUser.save(function(err, docs){
    
	    			if(err){

						console.log("why the ..."); // should never happen
				        res.json(err);
				    }
				    else{

						returnedJson = {"status":"Success"};
						res.json(returnedJson);
				    }

				});


			}
			// already Exists
			else{

				returnedJson = {"status":"Failed"};
				res.json(returnedJson);
			}

		});


};





// will be called automaticlly every 1 min to update the client, i wont use the live update call from client more then once for now
// but i did made it to work at the client side

exports.LiveUpdate = function(req, res){

	var mail = req.body.mail.toLowerCase();
	var pass = req.body.pass;
	var userInfo;
	var apartInfo;
	var returnedJson = null;

		aUser.findOne({ $and: [ { "mail": req.body.mail} , {"pass": req.body.pass} ] } , function (err, doc){ // CHECK he is a real user

			// user is not logged in
			if(doc == null){

				returnedJson = {"status":"Failed"};
				res.json(returnedJson);
			}
			// user is logged in, so i want to send him all of its info
			else{



				if(doc.apart != "0"){ // I have an apartment group


					aGroup.findOne( { gOwner: doc.apart} , function (err, newDoc){ // CHECK he is belong to the apartment



						returnedJson = {"status":"Success", "statusApart":"1", "userInfo":doc, "apartInfo":newDoc};
						res.header("Content-Type", "application/json; charset=utf-8");
						res.json(returnedJson);

					});


				}
				else{ // I Dont have any apartment group
						
					returnedJson = {"status":"Success", "statusApart":"0", "userInfo":doc};
						res.header("Content-Type", "application/json; charset=utf-8");
					res.json(returnedJson);
				}

			}

		});


};







// Updating users status data

exports.apartUpdate = function(req,res){

	var myMail = req.body.mail.toLowerCase();
	var myPass = req.body.pass;
	var plusArr = req.body.plusArr;
	var statusArr = req.body.statusArr;

	var returnedJson = null;



		aUser.findOne({ $and: [ { mail: myMail} , {pass: myPass} ] } , function (err, doc){

			// user is not logged in
			if(doc == null){

				returnedJson = {"status":"Failed"};
				res.json(returnedJson);
			}
			// user is logged in, so i want to send him all of its info
			else{

				if(doc.apart != "0"){ // I have an apartment group


					aGroup.findOne( { gOwner: doc.apart} , function (err, newDoc){


						var index = 0;
						//doc holds my user and newDoc Holds my apart

						for(index=0; index< newDoc.gUsersArr.length ;index++){

							if(newDoc.gUsersArr[index] == doc.mail){break;}
						}

						newDoc.gPlusArr[index] = plusArr;
						newDoc.gStatusArr[index] = statusArr;
						
						var q = newDoc.update({$set: { gPlusArr:newDoc.gPlusArr, gStatusArr:newDoc.gStatusArr }  });

						q.exec(function(err, results){


							returnedJson = {"status":"Success"};
							res.header("Content-Type", "application/json; charset=utf-8");
							res.json(returnedJson);

						});



					});



				}
				else{ // I Dont have any apartment group to update, should not get here if he dont have
						
					returnedJson = {"status":"Failed"};
					res.json(returnedJson);
				}

			}

		});


};












// add a new user to the group

exports.addUser = function(req,res){

	var mail = req.body.mail.toLowerCase();
	var pass = req.body.pass;
	var toAdd = req.body.toAdd;
	var returnedJson = null;
	var check = true;


		aUser.findOne({ $and: [ { mail: req.body.mail} , {pass: req.body.pass} ] } , function (err, doc){ // checking if this is a real user

			// failed login
			if(doc == null){

				returnedJson = {"status":"Failed"};
				res.json(returnedJson);
			}
			// a real user
			else{


				if(doc.apart != "0" && mail == doc.apart){ // I have an apartment group and i am the manager


					aUser.findOne({mail: toAdd} , function (err, docAddedUser){ // checking if the other user exists

						// tring to add a user which does not exists
						if(docAddedUser == null || docAddedUser.apart != "0"){

							returnedJson = {"status":"Failed"};
							res.json(returnedJson);
						}
						else{ // user exists



							
							var q = docAddedUser.update({$set: { apart: doc.apart }  });

							q.exec(function(err, results){




								aGroup.findOne( { gOwner: doc.apart} , function (err, newDoc){


																		
										if(newDoc == null){ // should never happen, but just in case, i dunno

											returnedJson = {"status":"Failed"};
											res.json(returnedJson);
										}
										else{ // now i need to add my user into the apartment


											 // check that i am not already in this apartment
											for(var tempIndex =0; tempIndex < newDoc.gUsersArr.length; tempIndex++){

												if(toAdd == newDoc.gUsersArr[tempIndex]){

													check = false;
													returnedJson = {"status":"Failed"};
													res.json(returnedJson);
												}
											}


											if(check && newDoc.gUsersArr.length < 4){

												
													newDoc.gUsersArr[newDoc.gUsersArr.length] = toAdd;
													newDoc.gNamesArr[newDoc.gNamesArr.length] = docAddedUser.user;
													newDoc.gPlusArr[newDoc.gPlusArr.length] = 0;
													newDoc.gStatusArr[newDoc.gStatusArr.length] = "O";



													var q2 = newDoc.update({$set: { gUsersArr: newDoc.gUsersArr, gNamesArr: newDoc.gNamesArr, gPlusArr: newDoc.gPlusArr, gStatusArr: newDoc.gStatusArr }  });

													q2.exec(function(err, results){


														returnedJson = {"status":"Success"};
														res.json(returnedJson);

													});
											}else{

												returnedJson = {"status":"Failed"};
												res.json(returnedJson);

											}


										}


								});



							});





						}


					});



				}
				else{ // tring to add but dont have any apartment

					returnedJson = {"status":"Failed"};
					res.json(returnedJson);
				}



			}

		});


};









exports.joinApart = function(req,res){


	var mail = req.body.mail.toLowerCase();
	var pass = req.body.pass;
	var joinTo = req.body.joinTo;
	var returnedJson = null;


		aUser.findOne({ $and: [ { mail: req.body.mail} , {pass: req.body.pass} ] } , function (err, doc){

			// failed login
			if(doc == null){

				returnedJson = {"status":"Failed"};
				res.json(returnedJson);
			}
			// successfully login
			else{

				if(doc.apart == "0"){ // i dont have apartment yet so i may join one //since i did not had apart yet, i dont need to check if i am there


					aGroup.findOne( { gOwner: joinTo} , function (err, newDoc){


						if(newDoc == null || newDoc.gUsersArr.length > 3){ // apart Does Not Exists, cant have more the 4 users in each apart

							returnedJson = {"status":"Failed"};
							res.json(returnedJson);

						}else{


								newDoc.gUsersArr[newDoc.gUsersArr.length] = mail;
								newDoc.gNamesArr[newDoc.gNamesArr.length] = doc.user;
								newDoc.gPlusArr[newDoc.gPlusArr.length] = 0;
								newDoc.gStatusArr[newDoc.gStatusArr.length] = "O";

								var q = newDoc.update({$set: { gUsersArr: newDoc.gUsersArr, gNamesArr: newDoc.gNamesArr, gPlusArr: newDoc.gPlusArr, gStatusArr: newDoc.gStatusArr }  });

								q.exec(function(err, results){




									var q2 = doc.update({$set: { apart: joinTo }  });

									q2.exec(function(err, results){


										returnedJson = {"status":"Success"};
										res.json(returnedJson);
									});


								});





						}

					});


				}else{


					returnedJson = {"status":"Failed"};
					res.json(returnedJson);
				}



			}

		});


};










exports.createNewApart = function(req,res){

	var mail = req.body.mail.toLowerCase();
	var pass = req.body.pass;
	var city = req.body.city;
	var street = req.body.street;
	var returnedJson = null;


		aUser.findOne({ $and: [ { mail: mail} , {pass: pass} ] } , function (err, doc){

			// failed login
			if(doc == null){

				returnedJson = {"status":"Failed"};
				res.json(returnedJson);
			}
			// success login
			else{


				if(doc.apart == "0"){ // no apart



						var newApart = new aGroup({

								gOwner: mail, 
								gUsersArr: [mail],
								gStatusArr: ["O"],
								gNamesArr: [doc.user],
								gCity: city,
								gAddress: street,
								gPlusArr: [0]
						
						});

						newApart.save(function(err, docs){
			    
				    			if(err){

									console.log("why the ..."); // should never happen
							        res.json(err);
							    }
							    else{


									var q = doc.update({$set: { apart: mail }  });

									q.exec(function(err, results){


										returnedJson = {"status":"Success"};
										res.json(returnedJson);
									});


							    }

						});




				}else{

					console.log("2");
					returnedJson = {"status":"Failed"};
					res.json(returnedJson);
				}

			}

		});


};






// Setting kick start function, returns is i am a manager or not

exports.settingsKickStart = function(req,res){

	var mail = req.body.mail.toLowerCase();
	var pass = req.body.pass;
	var returnedJson = null;


		aUser.findOne({ $and: [ { mail: mail} , {pass: req.body.pass} ] } , function (err, doc){

			// failed login
			if(doc == null){

				returnedJson = {"status":"Failed", "status2": 0};
				res.json(returnedJson);
			}
			// success login
			else{


				if(doc.apart != "0"){

					if(doc.apart == mail){					
					

						aGroup.findOne({ gOwner: mail} , function (err, newDoc){

							returnedJson = {"status":"Success", "apartAdmin": 1, "user": doc.user, "city": newDoc.gCity, "add": newDoc.gAddress };
							res.json(returnedJson);

						});

					}
					else{


						returnedJson = {"status":"Success", "apartAdmin": 0, "user": doc.user};
						res.json(returnedJson);
					}
				}
				else{

					returnedJson = {"status":"Failed", "status2": 1};
					res.json(returnedJson);
				}


			}

		});


};







// update NOT MANAGER user data

exports.simpleUpdate = function(req,res){

	var mail = req.body.mail.toLowerCase();
	var pass = req.body.pass;
	var name = req.body.name;
	var returnedJson = null;


		aUser.findOne({ $and: [ { mail: req.body.mail} , {pass: req.body.pass} ] } , function (err, doc){

			// failed login
			if(doc == null){

				returnedJson = {"status":"Failed"};
				res.json(returnedJson);
			}
			// success login
			else{

					var q = doc.update({$set: { user: name }  });

					q.exec(function(err, results){




						aGroup.findOne({ gOwner: doc.apart} , function (err, newDoc){

							var tempIndex;

							for(tempIndex =0; tempIndex < newDoc.gUsersArr.length ; tempIndex++){

								if(newDoc.gUsersArr[tempIndex] == mail){

									newDoc.gNamesArr[tempIndex] = name;
									break;
								}
							}



							var q2 = newDoc.update({$set: { gNamesArr: newDoc.gNamesArr }  });


								q2.exec(function(err, results){

									returnedJson = {"status":"Success"};
									res.json(returnedJson);
								});


						});


					});

			}

		});


};











// update A MANAGER user data

exports.adminUpdate = function(req,res){

	var mail = req.body.mail.toLowerCase();
	var pass = req.body.pass;
	var name = req.body.name;
	var city = req.body.city;
	var add = req.body.add;
	var returnedJson = null;


		aUser.findOne({ $and: [ { mail: req.body.mail} , {pass: req.body.pass} ] } , function (err, doc){

			// failed login
			if(doc == null){

				returnedJson = {"status":"Failed"};
				res.json(returnedJson);
			}
			// success login
			else{

					var q = doc.update({$set: { user: name }  });

					q.exec(function(err, results){




						aGroup.findOne({ gOwner: doc.apart} , function (err, newDoc){

							var tempIndex;

							for(tempIndex =0; tempIndex < newDoc.gUsersArr.length ; tempIndex++){

								if(newDoc.gUsersArr[tempIndex] == mail){

									newDoc.gNamesArr[tempIndex] = name;
									break;
								}
							}


							var q2 = newDoc.update({$set: { gNamesArr: newDoc.gNamesArr, gAddress: add, gCity: city }  });


								q2.exec(function(err, results){

									returnedJson = {"status":"Success"};
									res.json(returnedJson);
								});


						});


					});

			}

		});


};












exports.removeUser = function(req,res){

	var mail = req.body.mail.toLowerCase();
	var pass = req.body.pass;
	var remove = req.body.remove;
	var returnedJson = null;


		aUser.findOne({ $and: [ { mail: req.body.mail} , {pass: req.body.pass} ] } , function (err, doc){

			// failed login
			if(doc == null){

				returnedJson = {"status":"Failed"};
				res.json(returnedJson);
			}
			// success login
			else{


				if(doc.apart == mail){ // this is realy the manager


					aUser.findOne( { mail: remove}  , function (err, removeDoc){

						if(removeDoc != null && removeDoc.apart == mail){ // the user exists and he is at the correct apartment


								var q = removeDoc.update({$set: { apart: "0" }  });
								var tempIndex =0 ;

								q.exec(function(err, results){


									aGroup.findOne( { gOwner: mail}  , function (err, docs){


										if(docs != null){

											for( tempIndex = 0; tempIndex < docs.gUsersArr.length; tempIndex++){

												if(docs.gUsersArr[tempIndex] == remove){

													break;
												}

											}

											docs.gUsersArr.splice(tempIndex, 1);
											docs.gPlusArr.splice(tempIndex, 1);
											docs.gNamesArr.splice(tempIndex, 1);
											docs.gStatusArr.splice(tempIndex, 1);


											var q2 = docs.update({$set: { gUsersArr: docs.gUsersArr, gPlusArr: docs.gPlusArr, gNamesArr: docs.gNamesArr, gStatusArr: docs.gStatusArr }  });

											q2.exec(function(err, results){


												returnedJson = {"status":"Success"};
												res.json(returnedJson);

											});

										}


									});



								});

						}
						else{

							returnedJson = {"status":"Failed"};
							res.json(returnedJson);	
						}


					});


				}else{

					returnedJson = {"status":"Failed"};
					res.json(returnedJson);	
				}

			}

		});


};







exports.leaveApartment = function(req,res){

	var mail = req.body.mail.toLowerCase();
	var pass = req.body.pass;
	var returnedJson = null;
	var oldApart;
	var tempIndex = 0;
	var newApart;

		aUser.findOne({ $and: [ { mail: req.body.mail} , {pass: req.body.pass} ] } , function (err, doc){

			// failed login
			if(doc == null){

				returnedJson = {"status":"Failed"};
				res.json(returnedJson);
			}
			// success login
			else{


				if(doc.apart != "0"){ // i got apart and now i need to split user and admin


					if(doc.apart == mail){ // admin user




						oldApart = doc.apart;
						var q = doc.update({$set: { apart: "0" }  });


						q.exec(function(err, results){


								aGroup.findOne( { gOwner: oldApart}  , function (err, docs){



									if(docs.gUsersArr.length > 1){ // i got more then 1 user

											for(tempIndex = 0; tempIndex < docs.gUsersArr.length ; tempIndex++){


												if(docs.gUsersArr[tempIndex] == mail){break;}
											}

											var check;

											if(tempIndex == 0){ // i want to take the next normal user and make him an admin
												check = 1;
											}
											else{
												check = 0;
											}



											docs.gUsersArr.splice(tempIndex, 1);
											docs.gPlusArr.splice(tempIndex, 1);
											docs.gNamesArr.splice(tempIndex, 1);
											docs.gStatusArr.splice(tempIndex, 1);

											newApart = docs.gUsersArr[check];


											var q2 = docs.update({$set: { gOwner: newApart, gUsersArr: docs.gUsersArr, gPlusArr: docs.gPlusArr, gNamesArr: docs.gNamesArr, gStatusArr: docs.gStatusArr }  });

											q2.exec(function(err, results){ // now i just need to update all the rest of the users



												aGroup.findOne( { gOwner: newApart}  , function (err, newDocs){


														for(tempIndex = 0; tempIndex < newDocs.gUsersArr.length ; tempIndex++){



															aUser.findOne( { mail: newDocs.gUsersArr[tempIndex]}  , function (err, usersLoop){


																	var q3 = usersLoop.update({$set: { apart: newApart }  });

																	q3.exec(function(err, results){});


															});

														}


													returnedJson = {"status":"Success"};
													res.json(returnedJson);

												});



											});

									}
									else{ // i only got 1 user, delete all schema



									aGroup.findOne( { gOwner: oldApart}  , function (err, docs){

											docs.remove({}, function(err) { 
												
												returnedJson = {"status":"Success"};
												res.json(returnedJson);
											});


									});


									}



								});


						});






					}
					else{ // normal user

						oldApart = doc.apart;
						var q = doc.update({$set: { apart: "0" }  });


						q.exec(function(err, results){


								aGroup.findOne( { gOwner: oldApart}  , function (err, docs){


									for(tempIndex = 0; tempIndex < docs.gUsersArr.length ; tempIndex++){


										if(docs.gUsersArr[tempIndex] == mail){break;}
									}



										docs.gUsersArr.splice(tempIndex, 1);
										docs.gPlusArr.splice(tempIndex, 1);
										docs.gNamesArr.splice(tempIndex, 1);
										docs.gStatusArr.splice(tempIndex, 1);


										var q2 = docs.update({$set: { gUsersArr: docs.gUsersArr, gPlusArr: docs.gPlusArr, gNamesArr: docs.gNamesArr, gStatusArr: docs.gStatusArr }  });

										q2.exec(function(err, results){


											returnedJson = {"status":"Success"};
											res.json(returnedJson);

										});


								});


						});


					}



				}else{ // no apart


					returnedJson = {"status":"Failed"};
					res.json(returnedJson);
				}

			}

		});


};










/*


								var q = removeDoc.update({$set: { apart: 0 }  });

								q.exec(function(err, results){


								});



*/
















// vidran and ofir helped me with this line, it should close my connection at the end of the process, hope i got it right
// they also helped me understand the logic and how to make it look better with the models
// so i give the credit for the fine looking code to them =p


db.once('open' , function(){
	console.log('Connected');
	aUser = this.model('myUsers');
	aGroup = this.model('myGroups');
});



process.on('SIGINT', function() {

  db.close(function () {

    console.log('Mongoose Disconnected');
    process.exit(0);
  });

});