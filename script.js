let codexURL = 'codex.json';
let essentialsURL = 'essentials.json';

// Load JSON function

async function getJson(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

async function main() {
  codexList = await getJson(codexURL)
  essentialsList = await getJson(essentialsURL)

  // by default set to cocktail codex
  drinksAll = codexList.DRINKS;  // main object is drinksAll
  var codexButton = document.getElementById('codex');
  codexButton.classList.toggle('currentBank');

  console.log('let us drink');
}

main();



// Switch recipe bank

var listButtons = document.getElementsByClassName('listBtn');
for (var i = 0; i < listButtons.length; i++) {
  listButtons[i].addEventListener('click', bankHandler, true);
}

function bankHandler() {
  // store button as element
  var element = this;

  // check if current bank and return if so
  if (element.classList.contains("currentBank")){
    return;
  }

  // remove old bank and toggle to new
  if (!element.classList.contains("currentBank")){

    // turn off all ingredients
    ingList = [];
    for (var i = 1; i < allButtons.length; i++) {
      if(allButtons[i].classList.contains("inList")){
        allButtons[i].classList.toggle("inList");
      }
    }

    // turn off custom search
    // check if Button is already toggled
    if (recButton.classList.contains("inList")){
      recButton.classList.toggle("inList");
      recButton.innerHTML = "+ SEARCH";

      // clear button and ingList
      ingList = [];
      document.getElementById('matchDrinks').innerHTML = 'Select some ingredients';
    }

    // toggle new bank
    var oldBank = document.getElementsByClassName('currentBank');
    oldBank[0].classList.toggle('currentBank');

    element.classList.toggle('currentBank');

    // update drinksAll with new bank

    var bankName = element.id;
    console.log(bankName);
    
    if (bankName == 'codex'){
      drinksAll = codexList.DRINKS;
      listFilter(ingList);
    }
    if (bankName == 'essentials'){
      drinksAll = essentialsList.DRINKS;
      listFilter(ingList);
    }

    console.log(drinksAll.length)
  }
  
}

// Ingredients List

var ingList = [];

// ButtonListener
var allButtons = document.getElementsByClassName("btn");

for (var i = 1; i < allButtons.length; i++) {
    allButtons[i].addEventListener('click', listHandler, true);
}

// Add Custom Ingredient

var customButton = document.getElementById("addIng");
var gridDiv = document.getElementById("left-wrapper");
customButton.addEventListener('click', addIngredient, true)

function addIngredient() {
  // get input for button
  var ingInput = prompt("Add Ingredient")

  // create the button if not empty
  if (ingInput !== null){
    var element = document.createElement("button");
    element.innerHTML = ingInput;
    element.id = ingInput;
    element.className = "btn";
    gridDiv.insertBefore(element, gridDiv.children[1]);

    // add lister for new buttons
    element.addEventListener('click', listHandler, true);

    // add button to list
    var searchAdd = element.id.toLowerCase();
    toList(searchAdd);
    element.classList.toggle("inList");

  }

}

// Search By Name
var recButton = document.getElementById("addRec");
recButton.addEventListener('click', addRec, true);

function addRec() {

  // store button as element
  var element = this;

    // check if Button is already toggled
    if (element.classList.contains("inList")){
      element.classList.toggle("inList");
      element.innerHTML = "+ SEARCH";

      // clear button and ingList
      ingList = [];
      document.getElementById('matchDrinks').innerHTML = 'Select some ingredients';
      return;
    }

  // get input for button
  var recInput = prompt("Search for Cocktail");


  // do nothing on no input
  if (recInput == '' || recInput == null){
    console.log('no input');
    return
  }

  // toggle Button
  if (recInput !== null){
    element.innerHTML = recInput;
    element.classList.toggle("inList");
  }

  // turn off all ingredients
  ingList = [];
  for (var i = 1; i < allButtons.length; i++) {
    if(allButtons[i].classList.contains("inList")){
      allButtons[i].classList.toggle("inList");
    }
  }

  // search list by name
  toSearch = trimString(recInput).toLowerCase();

  var results = []; // stores index of matching drinks in drinksAll

  for(var i=0; i<drinksAll.length;i++){
      var toFind= drinksAll[i].name.toLowerCase();
      if(toFind.indexOf(toSearch)!=-1){
        if(!itemExists(results, drinksAll[i])){
         results.push(i);
        }
      }
  }

  var results = results.filter(onlyUnique)  // Gets only unique 
  var ingToList = {
    name: toSearch,
    matchDrinks: results
  };

  // Add cocktails to list
  ingList.push(ingToList);
  listFilter(ingList);
  if(ingToList.matchDrinks.length == 0){
    document.getElementById('matchDrinks').innerHTML = 'No cocktails found';
  };


}

// listHandler

function listHandler () {
  this.classList.toggle("inList");
  if(this.classList.contains("inList")){
    toList(this.id.toLowerCase());
  }
  if(!this.classList.contains("inList")){
    fromList(this.id.toLowerCase());
  }
}

// toList

function toList(toSearch) {
  toSearch = trimString(toSearch);

  var results = []; // stores index of matching drinks in drinksAll

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
  var ingToList = {
    name: toSearch,
    matchDrinks: results
  };

  ingList.push(ingToList);
  listFilter(ingList);
}

// fromList

function fromList(toRemove) {
  toRemove = trimString(toRemove);

  for(var i=0; i<ingList.length;i++){
    var toFind = ingList[i].name.toLowerCase();
    if(toRemove.indexOf(toFind)!=-1){
      ingList.splice(i,1);
    }
  }

  listFilter(ingList);
}

// listFilter Ingredients

function listFilter (ingList) {

  var arrays = [];

  for(var i=0; i<ingList.length;i++){   // build array of matchDrinks indices
    arrays.push(ingList[i].matchDrinks);
  }

  if(arrays.length == 0){
    document.getElementById('matchDrinks').innerHTML = 'Select some ingredients';
  };
  
  if(arrays.length>0){  // find common drinks
    var result = arrays.shift().reduce(function(res, v) {
      if (res.indexOf(v) === -1 && arrays.every(function(a) {
          return a.indexOf(v) !== -1;
      })) res.push(v);
      return res;
  }, []);


  // display found drinks
  var output = ''
  for(var i=0; i<result.length;i++){
    // HTML MAKER

    index = result[i]

    output += '<div>';
    output += '<div>';
    output += '<p class="name">'+drinksAll[index].name+'</p>';
    output += '<ul class="ing">';

    for(var k=0; k<drinksAll[index].ingredients.length;k++){
      output += '<li>'+drinksAll[index].ingredients[k]+'</li>';
    }
    if(drinksAll[index].garnish !== ''){
      output += '<li>'+drinksAll[index].garnish+'</li>';
    }
    output += '</ul>'
    output += '<div class="directions">'
    output += '<p>'+drinksAll[index].directions+'</p>';
    output += '</div>';
    output += '</div>';
    output += '</div>';


  }
  document.getElementById('matchDrinks').innerHTML = output;

  // display when no drinks found
  if(output.length == 0){
    document.getElementById('matchDrinks').innerHTML = 'No cocktails found';
  };


  } // if statement closer


}

// SEARCH TRIM CODES

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