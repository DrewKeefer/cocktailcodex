let codexURL = 'codex.json';
let essentialsURL = 'essentials.json';
let ibaURL = 'iba.json';

// Load JSON function

async function getJson(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

async function main() {
  codexList = await getJson(codexURL);
  essentialsList = await getJson(essentialsURL);
  ibaList = await getJson(ibaURL);

  // by default set to cocktail codex
  var codexButton = document.getElementById('codex');
  codexButton.classList.toggle('currentBank');
}

main();

// #region INITIALIZE THINGS

// add listener for listButtons
var listButtons = document.getElementsByClassName('listBtn');
for (var i = 0; i < listButtons.length; i++) {
  listButtons[i].addEventListener('click', bankHandler, true);
}

// add listener for allButtons
var allButtons = document.getElementsByClassName("btn");
for (var i = 1; i < allButtons.length; i++) {
  allButtons[i].addEventListener('click', listHandler, true);
}

// add listener to customButton
var customButton = document.getElementById("addIng");
var gridDiv = document.getElementById("left-wrapper");
customButton.addEventListener('click', addIngredient, true)

// search by Name button
var recButton = document.getElementById("addRec");
recButton.addEventListener('click', addRec, true);

// initialize variables

var ingList = [];

// #endregion

// Main Update Function

function mainUpdate() {

  // determine drink bank

  drinksAll = [];
  for (var i = 0; i < listButtons.length; i++) {
    if (listButtons[i].classList.contains('currentBank')){
      listString = listButtons[i].id + 'List.DRINKS';;
      toAdd = (eval(listString));
      drinksAll = drinksAll.concat(toAdd);
    }
  }

  // check if search by name is active

  if(recButton.classList.contains('inList')){
    // SEARCH BY NAME

    var recInput = recButton.id.toLowerCase();
    var result = nameSearch(recInput);
  }
  // search by ingredients if not
  else{
    // SEARCH BY INGREDIENTS

    // determine ingredients
    ingList = [];
    var activeIngs = document.getElementsByClassName('inList');
    for(var i=0; i<activeIngs.length;i++){
      ingList.push(trimString(activeIngs[i].id.toLowerCase()));
    }
    // perform ingredient search
    var result = ingredientSearch();
  }



  // if no ingredients selected display message
  if(result == null){
    document.getElementById('matchDrinks').innerHTML = 'Please select some ingredients';
    return;
  }

  // if no drinks found display message
  if(result.length === 0){
    document.getElementById('matchDrinks').innerHTML = 'No cocktails found';
    return;
  }

  // create new object with only matched drinks
  matchDrinks =[];
  for(var i=0; i<result.length; i++){
    var index = result[i];
    matchDrinks[i] = drinksAll[index];
  }
  // sort drinks alphabetically
    matchDrinks.sort( compare );

  // display found drinks

  var output = ''
  for(var i=0; i<result.length;i++){
    // HTML MAKER

    // set bank symbol
    var bankHTML = '';
    if (matchDrinks[i].bank == 'codex'){
      bankHTML = 'CC';
    } else if (matchDrinks[i].bank == 'essentials'){
      bankHTML = 'EC'
    } else if (matchDrinks[i].bank == 'IBA'){
      bankHTML = 'IBA'
    };

    output += '<div class="drink-block">';
      output += '<div class="nameHeader">'
        output += '<p class="name">'+ matchDrinks[i].name +'</p>';
        output += '<p class="'+ matchDrinks[i].bank +'-outside">'+'</p>';
        output += '<p class="'+ matchDrinks[i].bank +'">'+ bankHTML +'</p>';
      output += '</div>'

      output += '<ul class="ing">';

      for(var k=0; k<matchDrinks[i].ingredients.length;k++){
        output += '<li>'+matchDrinks[i].ingredients[k]+'</li>';
      }
      if(matchDrinks[i].garnish !== ''){
        output += '<li>'+matchDrinks[i].garnish+'</li>';
      }
    output += '</ul>'
    output += '<div class="directions">'
    output += '<p>'+matchDrinks[i].directions+'</p>';
    output += '</div>';
    output += '</div>';


  }
  document.getElementById('matchDrinks').innerHTML = output;


}


function addIngredient() {
  // get input for button
  var ingInput = prompt("Add Ingredient")

  // do nothing on no input
  if (ingInput == '' || ingInput == null){
    return
  }

  // create the button if not empty
  if (ingInput !== null){
    var element = document.createElement("button");
    element.innerHTML = ingInput;
    element.className = "btn";
    element.id = ingInput;
    gridDiv.insertBefore(element, gridDiv.children[1]);
    element.classList.toggle('inList');

    // add listner for new buttons
    element.addEventListener('click', listHandler, true);
    mainUpdate();

  }
}

function addRec() {

  // store button as element
  var element = this;

  // check if Button is already toggled
  if (element.classList.contains("inList")){
    element.classList.toggle("inList");
    element.innerHTML = "+ SEARCH";
    document.getElementById('matchDrinks').innerHTML = 'Select some ingredients';
    return;
  }

  // get input for button
  var recInput = prompt("Search for Cocktail");

  // do nothing on no input
  if (recInput == '' || recInput == null){
    return
  }

  // toggle Button
  if (recInput !== null){
    element.innerHTML = recInput;
    element.id = recInput;
    element.classList.toggle("inList");
  }
  mainUpdate();

  return recInput
  
}

// listHandler
function listHandler () {
  if(this === null){
    return;
  }
  this.classList.toggle("inList");
  mainUpdate()
}

// bankHandler
function bankHandler() {

  // store button as element
  var element = this;

  // check if current bank and remove class if so
  if (element.classList.contains('currentBank')){
    element.classList.toggle('currentBank');
  }
  // add if not already in bank
  else{
    element.classList.toggle('currentBank');
  }

  mainUpdate();
}

// search by ingredients
function ingredientSearch(){
  // find matching drinks for individual ingredients

  var ingMatch = {};
  for(var j=0; j<ingList.length;j++){
    var results = []; // stores index of matching drinks in drinksAll
    toSearch = ingList[j]; // search by each ingredients in list

    for(var i=0; i<drinksAll.length;i++){
      for(var k=0; k<drinksAll[i].ingredients.length;k++){
        var toFindIng = drinksAll[i].ingredients[k].toLowerCase();
        var toFindGar = drinksAll[i].garnish.toLowerCase();
        var toFind = toFindIng + toFindGar
        if(toFind.indexOf(toSearch)!=-1){
          if(!itemExists(results, drinksAll[i])){
          results.push(i);
          }
        }
      }
    }
    var results = results.filter(onlyUnique)  // Gets only unique 
    ingMatch[j] = results;
  }

  // loop through object and find indices common between all of them

  var size = Object.keys(ingMatch).length;

  var arrays = [];
  for (var i=0; i<size; i++){
    arrays.push(ingMatch[i]);
  }

  if(arrays.length>0){  // find common drinks
    var result = arrays.shift().reduce(function(res, v) {
      if (res.indexOf(v) === -1 && arrays.every(function(a) {
          return a.indexOf(v) !== -1;
      })) res.push(v);
      return res;
  }, []);
  }

  return result
}

// search by name
function nameSearch(nameInput){

  // turn off all ingredients
  ingList = [];
  for (var i = 1; i < allButtons.length; i++) {
    if(allButtons[i].classList.contains("inList")){
      allButtons[i].classList.toggle("inList");
    }
  }
  
  // search by drink name

  var ingMatch = {};
  var results = []; // stores index of matching drinks in drinksAll
  toSearch = nameInput; // search by each ingredients in list
  for(var i=0; i<drinksAll.length;i++){
      var toFindName = drinksAll[i].name.toLowerCase();
      if(toFindName.indexOf(toSearch)!=-1){
        if(!itemExists(results, drinksAll[i])){
        results.push(i);
      }
    }
  }
  var results = results.filter(onlyUnique)  // Gets only unique 
  return results;
}

// #region SEARCH TRIM CODES

function trimString(s) {
  var l=0, r=s.length -1;
  while(l < s.length && s[l] == ' ') l++;
  while(r > l && s[r] == ' ') r-=1;
  return s.substring(l, r+1);
}

function compareObjects(o1, o2) {
  var k = '';
  for(k in o1) if(o1[k] != o2[k]) return false;
  for(k in o2) if(o1[k] != o2[k]) return false;
  return true;
}

function itemExists(haystack, needle) {
  for(var i=0; i<haystack.length; i++) if(compareObjects(haystack[i], needle)) return true;
  return false;
}

// UNIQUE VALUES

function onlyUnique(value, index, self){
  return self.indexOf(value) === index;
}

// COMPARISON FUNCTION
function compare(a,b) {
  if ( a.name < b.name ){
    return -1;
  }
  if ( a.name > b.name ){
    return 1;
  }
  return 0;
}

// #endregion