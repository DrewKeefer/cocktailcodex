let apiURL = 'file.json';

// Load JSON function

async function getJson(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

async function main() {
  drinkList = await getJson(apiURL)
  drinksAll = drinkList.DRINKS  // main object is drinksAll
  
}

main();

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

// listFilter

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

    output += '<li>'+drinksAll[index].garnish+'</li>';
    output += '</ul>'
    output += '<div class="directions">'
    output += '<p>'+drinksAll[index].directions+'</p>';
    output += '</div>';
    output += '</div>';
    output += '</div>';


  }
  document.getElementById('matchDrinks').innerHTML = output;


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