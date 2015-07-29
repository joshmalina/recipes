'use strict';

/**
 * @ngdoc function
 * @name recipesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the recipesApp
 */
 angular.module('recipesApp')
 .controller('MainCtrl', ['$scope', 'Path', '$firebaseArray', '$q', function ($scope, Path, $firebaseArray, $q) {

 	// reference to our data
 	var ref = new Firebase (Path);

 	// an array of our data
 	$scope.message_recipes = $firebaseArray(ref.child('message_recipes'));  		

 	$scope.alerts = [];

 	function alert(error, type) {  		
 		$scope.alerts.push({type: type, msg: error});
 	}

 	$scope.clear = function() {
 		$scope.selectedRecipes = [];
 	}

 	// empty / null objects needed for ng-model
 	$scope.edit = {}; 
 	$scope.new_recipe = [];
 	$scope.new_recipe.ingredients = [];
 	$scope.selected = null;


 	$scope.addIngredient = function() {
 		$scope.new_recipe.ingredients.push('');
 	}

 	// checks to see if a recipe by that name already exists
 	// if exists, return that recipe's ingredients, else return original name
 	function recipeExists(name) {

 		var defer = $q.defer();

 		$scope.message_recipes.$loaded().then(function(recipes) {

 			var length = recipes.length;

 			for(var i = 0; i < length; i++) {

 				if(name == recipes[i].name) {
 					defer.resolve(recipes[i].ingredients || []);
 				}

 			} 			

 			defer.resolve(name);
 		})

 		return defer.promise;
 	}

 	// select an object, prep for editing
 	$scope.select = function(recipe) {
 		$scope.selected = recipe;
 		$scope.edit.id = recipe.$id;
 		$scope.edit.name = recipe.name;
 		$scope.edit.ingredients = $scope.flatten(recipe.ingredients);
 	}

 	// remaps an ingredient list to include other recipes' ingredients
 	function recipeMap(ingredients) {

 		var promises = [];

 		angular.forEach(ingredients, function(each) {

 			var result = recipeExists(each);

 			promises.push(result);

 		});

 		return $q.all(promises);		

 	}

 	// function for flattening nested JSON objects
 	// http://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
 	$scope.flatten = function(data) {
 		var result = {};

 		function recurse (cur, prop) {
 			if (Object(cur) !== cur) {
 				result[prop] = cur;
 			} else if (Array.isArray(cur)) {
 				for(var i=0, l=cur.length; i<l; i++)
 					recurse(cur[i], i);
 				if (l == 0)
 					result[prop] = [];
 			} else {
 				var isEmpty = true;
 				for (var p in cur) {
 					isEmpty = false;
 					recurse(cur[p], prop ? prop+"."+p : p);
 				}
 				if (isEmpty && prop)
 					result[prop] = {};
 			}
 		}

 		recurse(data, "");

 		return result;
 	}

 	// overwrite reference for edited recipe
 	$scope.editRecipe = function() {
 		ref.child('message_recipes').child($scope.edit.id).child('ingredients').set($scope.edit.ingredients);
 	}

 	// adds a new recipe if it doesn't already exist
 	// if does, send an error message
 	// else add the recipe, making sure to interpolate other recipes if there
 	$scope.addRecipe = function(new_recipe) {

 		recipeExists(new_recipe.name).then(function(val) {

 			// does this name already exist
 			if(angular.isArray(val)) {

 				alert('Sorry -- that recipe already exists!', 'danger');
 				return;

 			// does an ingredient reference the recipe itself
 			} else if (new_recipe.ingredients.indexOf(new_recipe.name) > -1) {

 				alert('Sorry -- an ingredient may not have the same name as a recipe name');
 				return;

 			} else {

 				recipeMap(new_recipe.ingredients).then(function(loaded){
 					$scope.message_recipes.$add({name: new_recipe.name}).then(function(ref) {
 						ref.child('ingredients').set(loaded || {}, function() {
 							alert('Recipe added', 'success');
 						});
 					});
 				})

 			} 		


 		})  	

 	}


 }]);
