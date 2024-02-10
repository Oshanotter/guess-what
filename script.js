// initalize some variables
var overlay;
    var resultsPage;
    var startText;
    var gameList;
    var listNum;
    var allowColorChange = false;
    var passCorrectList = [];
    var cardList = [];
    var currentPosition = "NEUTRAL";
    var gamesDict;
    //defaultTimer = 60;

    function shuffleList(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap array[i] and array[j]
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    
    // Check if the user is on an iOS device
    function isiOS() {
      return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }
    
    // Detects if iOS device is in standalone mode
    //const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

    // Detects is Android device is in standalone mode
    function isRunningStandalone() {
      return (window.matchMedia('(display-mode: standalone)').matches);
    }
    
    function removeDuplicates(inputList) {
      return [...new Set(inputList)];
    }

    function createOverlay() {
      // first, make sure that the html tag always stays the same direction
      document.querySelector("html").classList.add("lockRotation");

      // create the overlay
      overlay = document.createElement('div');
      overlay.id = "overlay";
      overlay.style.height = "100%";
      overlay.style.width = "100%";
      overlay.style.overflow = "hidden";
      overlay.style.top = "0";
      overlay.style.position = "fixed";

      resultsPage = document.createElement('div');
      resultsPage.style.height = "85%";
      resultsPage.style.width = "90%";
      resultsPage.style.top = "15%"
      resultsPage.style.position = "fixed";
      resultsPage.style.alignItems = "flex-start"
      resultsPage.style.backgroundColor = "yellow";
      overlay.appendChild(resultsPage);

      var banner = document.createElement('div');
      banner.style.backgroundColor = "blue";
      banner.style.height = "15%";
      banner.style.width = "100%";
      banner.style.position = "absolute";
      banner.style.top = "0";
      overlay.appendChild(banner);

      circle = document.createElement('div');
      circle.className = "circle"
      circle.style.borderRadius = "50%";
      circle.style.border =  "1vw solid blue";
      circle.style.height = "10vw";
      circle.style.width = "10vw";
      circle.style.top = "80%"
      circle.style.left = "50%";
      circle.style.position = "absolute";
      circle.style.transform = "translate(-50%, -50%)";
      circle.innerText = roundTimer;
      circle.style.fontSize = "240%";
      circle.style.fontWeight = "bold";
      banner.appendChild(circle);

      startText = document.createElement('div');
      startText.innerText = "Get Ready\n5";
      startText.style.position = "absolute";
      startText.style.height = "80%";
      startText.style.width = "80%";
      startText.style.fontSize = "300%";
      startText.style.backgroundColor = "rgba(255, 0, 0, 0)";
      startText.style.top = "20%";
      startText.style.textAlign = "center";
      overlay.appendChild(startText);

      const exitButton = document.createElement('div');
      exitButton.style.top = "30%"
      exitButton.style.left = "4%";
      exitButton.style.position = "absolute";
      exitButton.style.backgroundColor = "blue";
      exitButton.style.fontSize = "150%";
      exitButton.innerText = '< Back';
      exitButton.addEventListener('click', function () {
          document.body.removeChild(overlay);
	      // make sure that the html tag is set back to normal
          document.querySelector("html").classList.remove("lockRotation");
          // set the gameCancled variable to true to stop the countdown timers
          gameCancled = true;
          allowColorChange = false;
      });
      banner.appendChild(exitButton);

      document.body.appendChild(overlay);

      gameCancled = false;
      getReady(6);
    }

    function getReady(countdown){
        if (gameCancled){
            return;
        }
        // start counting down to get ready
        if (countdown == 1){
            passCorrectList = [];
            cardList = [];
            startGame();
        }else{
            var newNum = countdown - 1;
            startText.innerText = "Get Ready\n" + newNum;
            setTimeout(function(){
                getReady(newNum);
            }, 1000);
        }
    }

    function startTimer(countdown){
        if (gameCancled){
            return;
        }
        // start the game timer
        if (countdown == 1){
            circle.innerText = "0";
            passCorrectList.push("PASS");
            cardList.push(gameList[listNum]);
            endGame();
        }else{
            var newNum = countdown - 1;
            circle.innerText = newNum;
            setTimeout(function(){
                startTimer(newNum)
            }, 1000);
        }
    }

    function startGame(){
        // start the game timer
        startTimer(10); // change 10 to roundTimer
        listNum = 0;
        startText.innerText = gameList[listNum];
        allowColorChange = true;
    }

    function getGameList(gameName){
        // remove me later v
        //var list = ["Belsprout", "Weepenbel", "Victreebel"]
        //var gamesDict = {}
        //gamesDict["Gen I"] = list
        // remove me later ^
        // get the array from the dictionary
        gameList = gamesDict[gameName];
        shuffleList(gameList);
        requestPermission();
        createOverlay();
    }

    function handleOrientation(event) {
        if (!allowColorChange){
            return;
        }
        if (event.gamma > -50 && event.gamma < 0) {
            overlay.style.backgroundColor = 'red';
            startText.innerText = "PASS"
            if (currentPosition != "PASS"){
                // add current item to passed list
                passCorrectList.push("PASS")
                cardList.push(gameList[listNum])
                currentPosition = "PASS";
            }
        } else if (event.gamma < 60 && event.gamma > 0) {
            overlay.style.backgroundColor = 'green';
            startText.innerText = "CORRECT"
            if (currentPosition != "CORRECT"){
                // add current item to correct list
                passCorrectList.push("CORRECT")
                cardList.push(gameList[listNum])
                currentPosition = "CORRECT";
            }
        } else {
            overlay.style.backgroundColor = '';
            if (currentPosition != "NEUTRAL"){
                listNum += 1;
                if (listNum > gameList.length - 1){
                    listNum = 0;
                }
                startText.innerText = gameList[listNum];
                currentPosition = "NEUTRAL";
            }
        }
    }

    function requestPermission() {
        if (window.DeviceOrientationEvent) {
            if (!isiOS()){
                window.addEventListener('deviceorientation', handleOrientation);
                return true;
            }
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                        console.log("permission granted")
                        return true;
                    } else {
                        console.log("permission denied")
                        return false;
                    }
                })
                .catch(error => {
                    console.error('Error requesting device orientation permission:', error);
                    return false;
                });
        } else {
            return false;
        }
    }

    function endGame(){
        // end the game and show the results
        allowColorChange = false;
        overlay.style.backgroundColor = ''
        startText.innerText = "TIME'S UP!"
        setTimeout(function(){
            // display the results
            startText.innerText = '';
            var leftCol = document.createElement('div');
            leftCol.style.width = "45%";
            leftCol.style.height = "100%";
            leftCol.style.justifyContent = "start";
            leftCol.style.flexDirection = "column";
            leftCol.style.display = "flex";
            leftCol.style.fontSize = "150%";
            leftCol.style.backgroundColor = "orange";
            leftCol.style.height = "auto";
            resultsPage.appendChild(leftCol)

            var middleCol = document.createElement('div');
            middleCol.style.width = "10%";
            middleCol.style.backgroundColor = "purple";
            resultsPage.appendChild(middleCol);

            var rightCol = document.createElement('div');
            rightCol.style.width = "45%";
            rightCol.style.height = "100%";
            rightCol.style.justifyContent = "start";
            rightCol.style.flexDirection = "column";
            rightCol.style.display = "flex";
            rightCol.style.fontSize = "150%";
            rightCol.style.backgroundColor = "pink";
            rightCol.style.height = "auto";
            resultsPage.appendChild(rightCol)

            resultsPage.style.overflowY = "auto";
	    // allow certain elements to scroll again if the user started creating a new set
    	    allowScroll(resultsPage);
		
            overlay.removeChild(startText);
            
            var totalPoints = 0;

            for (var i = 0; i < passCorrectList.length; i++){
                var card = cardList[i];
                if (passCorrectList[i] == "CORRECT"){
                    var color = "green";
                    totalPoints++;
                }else{
                    var color = "red";
                }
                var text = document.createElement('span');
                text.innerText = card;
                text.style.color = color;
                text.style.marginTop = "3%";
                var evenOdd = i % 2;
                if (evenOdd == 0){
                    // it is even, add to left list
                    leftCol.appendChild(text)
                }else{
                    // it is odd, add to right list
                    rightCol.appendChild(text)
                }
            }
            circle.innerText = totalPoints;
        }, 3000);
    }












function getDictionary(path) {
  //first, request permission to use the device's orientation
  requestPermission();
  // get the JSON file from the path
  fetch("game-sets/" + path)
    .then(response => response.json())
    .then(collectionDict => {
      var title = collectionDict["title"];
      var description = collectionDict["description"];
      gamesDict = collectionDict["games"];
      //console.log("the dictionary is below")
      //console.log(collectionDict);
      //console.log("requesting permission")
      //console.log(title)
      //console.log(description)
      //console.log("building game preview")
      buildGamePreview(title, description);
    })
    .catch(error => console.error('Error fetching or parsing JSON:', error));
}

function buildGamePreview(title, description) {
	// build the screen to confirm to play the game
        // first create a blank div tag to prevent background items from being clicked
        preventInput = document.createElement('div');
        preventInput.style.height = "100%";
        preventInput.style.width = "100%";
        preventInput.style.overflow = "hidden";
        preventInput.style.top = "0";
        preventInput.style.position = "fixed";
        preventInput.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
        document.body.appendChild(preventInput);
    
	// Create main container div
	const mainDiv = document.createElement('div');
	mainDiv.className = "blueGradient"
        mainDiv.classList.add('mainGamePreview');
	mainDiv.style.position = 'absolute';
	mainDiv.style.top = '50%';
	mainDiv.style.left = '50%';
	mainDiv.style.transform = 'translate(-50%, -50%)';
	mainDiv.style.width = '85%';
	mainDiv.style.border = '1px solid #ccc';
	mainDiv.style.padding = '10px';
	//mainDiv.style.backgroundColor = 'grey';
	mainDiv.style.textAlign = 'center';
        mainDiv.style.overflowY = "hidden";
	
	
	// Create close button in the top left
	const closeButton = document.createElement('div');
	closeButton.className = "gamePreview"
	closeButton.textContent = 'x';
	closeButton.style.position = 'absolute';
	closeButton.style.top = '3%';
	closeButton.style.left = '5%';
	closeButton.style.cursor = 'pointer';
	closeButton.addEventListener('click', () => {
	mainDiv.remove();
        preventInput.remove();
        //preventScroll(false);
	});
	
	// Create title
	const titleDiv = document.createElement('div');
	titleDiv.className = "gamePreview"
	titleDiv.textContent = title;
	titleDiv.style.fontWeight = 'bold';
	titleDiv.style.fontSize = "200%"
	
	
	// Create time options div
	const timeOptionsDiv = document.createElement('div');
	timeOptionsDiv.className = "orangeGradient"
        timeOptionsDiv.classList.add('timeOptions');
        timeOptionsDiv.style.margin = "auto";
	timeOptionsDiv.style.display = 'flex'; // Set display to flex
	//timeOptionsDiv.style.backgroundColor = 'lightblue'; // Set light blue background color
	timeOptionsDiv.style.flexDirection = 'column';
	timeOptionsDiv.style.fontSize = "125%";
	
	var chooseTimeText = document.createElement('div');
	chooseTimeText.className = "gamePreview"
	chooseTimeText.innerText = "Game Timer Options"
	timeOptionsDiv.appendChild(chooseTimeText);
	var theOptions = document.createElement('div');
	theOptions.className = "gamePreview";
	theOptions.style.display = 'flex';
	theOptions.style.flexDirection = 'row';
	theOptions.style.justifyContent = 'center';
	timeOptionsDiv.appendChild(theOptions);
	
	// Create options (60s, 90s, 120s)
	const timeOptions = [60, 90, 120];
	timeOptions.className = "gamePreview";
	timeOptions.forEach((option) => {
	    optionDiv = document.createElement('div');
	    optionDiv.className = "gamePreview";
        optionDiv.classList.add('timerOption');
	    optionDiv.textContent = option + "s";
	    optionDiv.style.cursor = 'pointer';
	    optionDiv.style.paddingLeft = '8%'; // Add margin to separate options
	    optionDiv.style.paddingRight = '8%';
	    optionDiv.style.paddingTop = '2%';
	    optionDiv.style.paddingBottom = '2%';
	    optionDiv.style.borderRadius = "999px";
	    if (defaultTimer == option){
		    optionDiv.classList.add('selectedTimer');
            roundTimer = defaultTimer;
	    }
	    optionDiv.addEventListener('click', () => {
	        // Execute function based on the selected option
	        roundTimer = option;
		// Find all elements with the class name 'selectedTimer'
		const selectedTimers = document.getElementsByClassName('timerOption');
		// Loop through the collection and remove the 'selectedTimer' class from each element
    		for (let i = 0; i < selectedTimers.length; i++) {
    		    const element = selectedTimers[i];
                if (element.innerText == option+'s'){
                    element.classList.add('selectedTimer');
                }else{
        		    element.classList.remove('selectedTimer');
                }
    		}
	    });
	    theOptions.appendChild(optionDiv);
	});
	
	// Create description div
	const descriptionDiv = document.createElement('div');
	descriptionDiv.className = "gamePreview"
	//descriptionDiv.innerText = description
        descriptionDiv.style.flexGrow = "1";
        descriptionDiv.style.display = "flex";
        descriptionDiv.style.flexDirection = "column";
        descriptionDiv.style.justifyContent = "center";
        descriptionDiv.style.alignItems = "center";
        descriptionDiv.style.overflow = "hidden";
        //descriptionDiv.style.textOverflow = "ellipsis";
	var descriptionText = document.createElement('p');
	descriptionText.className = "description";
	descriptionText.innerText = description;
	descriptionText.style.margin = "2%";
	descriptionDiv.appendChild(descriptionText);
	

	const gridDiv = document.createElement('div');
	gridDiv.className = "gamePreview";
    gridDiv.style.height = "100%";
    gridDiv.style.overflowY = "auto";
    theKeys = Object.keys(gamesDict);
	if (theKeys.length > 1){
		// add a "Play All" option
		var playAll = addPlayAllOption();
        gridDiv.appendChild(playAll);

    var gamesGrid = document.createElement('div');
    gamesGrid.className = "gamePreview";
    gamesGrid.classList.add('grid');
	
	// Create grid of div tags with titles and functions
	theKeys.forEach((key) => {
	    const gridItemDiv = document.createElement('div');
	    gridItemDiv.textContent = key;
	    gridItemDiv.style.border = '1px solid #ddd';
	    gridItemDiv.style.padding = '5px';
	    gridItemDiv.style.margin = '5px';
	    gridItemDiv.style.cursor = 'pointer';
	    gridItemDiv.addEventListener('click', function() {
		  getGameList(key);
	    });
	    gridItemDiv.style.borderRadius = "1vmin";
	    gridItemDiv.className = "gamePreview"
	    gamesGrid.appendChild(gridItemDiv);
	});
    
    gridDiv.appendChild(gamesGrid);
    
    var topHeight = "65%";
    var bottomHeight = "35%";
    
    }else{
        // add only the single play option
        var playBtn = addPlayButton();
        gridDiv.appendChild(playBtn);
        
        var topHeight = "80%";
        var bottomHeight = "20%";
    }
    
    var top = document.createElement('div');
    top.style.height = topHeight
    top.className = "gamePreview";
    top.style.display = "flex";
    top.style.flexFlow = "column";
    
    var bottom = document.createElement('div');
    bottom.style.height = bottomHeight
    bottom.className = "gamePreview";
    bottom.style.marginTop = "2%";
	
	mainDiv.style.borderRadius = "2vmin";
	timeOptionsDiv.style.borderRadius = "999px";
	
	// Append created elements to the main container
	top.appendChild(closeButton);
	top.appendChild(titleDiv);
	top.appendChild(descriptionDiv);
	top.appendChild(timeOptionsDiv);
    bottom.appendChild(gridDiv);
    mainDiv.appendChild(top);
	mainDiv.appendChild(bottom);
	
	// Append main container to the body
	document.body.appendChild(mainDiv);
    
    //prevent scrolling when the overlay is displayed
    //preventScroll(true);

    // allow certain elements to scroll again if the user started creating a new set
    allowScroll(gridDiv);
}


function addPlayAllOption() {
        const gridItemDiv = document.createElement('div');
	    gridItemDiv.textContent = "Play All Sets";
	    gridItemDiv.style.border = '1px solid #ddd';
	    gridItemDiv.style.padding = '5px';
	    gridItemDiv.style.margin = '5px';
	    gridItemDiv.style.cursor = 'pointer';
	    gridItemDiv.addEventListener('click', function() {
		  getAllGames();
	    });
	    gridItemDiv.style.borderRadius = "1vmin";
	    gridItemDiv.className = "yellowGradient"
        //gridItemDiv.style.backgroundColor = "yellow";
        gridItemDiv.style.color = "black";
        gridItemDiv.style.fontSize = "150%";
	    return gridItemDiv;
}

function getAllGames() {
    var theList = []
    theKeys.forEach((key) => {
        var set = gamesDict[key];
        theList = theList.concat(set);
    });
    removeDuplicates(theList);
    shuffleList(theList);
    gameList = theList;
    createOverlay();
}

function addPlayButton() {
    const gridItemDiv = document.createElement('div');
	    gridItemDiv.textContent = "Play";
	    gridItemDiv.style.border = '1px solid #ddd';
	    gridItemDiv.style.padding = '5px';
	    gridItemDiv.style.margin = '5px';
	    gridItemDiv.style.cursor = 'pointer';
	    gridItemDiv.addEventListener('click', function() {
		  getGameList("Play");
	    });
	    gridItemDiv.style.borderRadius = "1vmin";
	    gridItemDiv.className = "gamePreview"
        gridItemDiv.style.backgroundColor = "yellow";
        gridItemDiv.style.color = "black";
        gridItemDiv.style.fontSize = "150%";
	    return gridItemDiv;
}

/*function preventScroll(bool){
	return;
    if (bool){
        document.body.style.overflow = "hidden";
	//document.body.style.height = "100%";
	document.documentElement.style.overflow = "hidden";
	//document.documentElement.style.height = "100%";
    }else{
        document.body.style.overflow = '';
	//document.body.style.height = '';
	document.documentElement.style.overflow = '';
	//document.documentElement.style.height = '';
    }
}*/

function preventScroll() {
	// prevent any element from scrolling after the user has clicked on an input
	var preventDefault = function (e) {
	    e.preventDefault();
	    e.stopPropagation(); // Stop the event from propagating to parent or child elements
	};

	document.addEventListener('touchmove', preventDefault, { passive: false });
	document.addEventListener('touchforcechange', preventDefault, { passive: false });

}

function allowScroll(element) {
	var allowDefault = function (e) {
	        // do nothing
		e.stopPropagation();
	};

	element.addEventListener('touchmove', allowDefault, { passive: false });
	element.addEventListener('touchforcechange', allowDefault, { passive: false });

	element.addEventListener('scroll', function() {
            // Check if the scroll position is at the top
            if (element.scrollTop === 0) {
                // If at the top, prevent further scrolling up 
                element.scrollTop = 1; // Set it to 1 to prevent further scrolling
            }else if (element.scrollHeight - element.scrollTop === element.clientHeight) {
        	// If at the bottom, prevent further scrolling down
		element.scrollTop = element.scrollHeight - element.clientHeight - 1;
            }
        });

	setTimeout( function(){
	// set topscroll to 1 immediately so that scrolling up doesn't casue the whole screen to move
	element.scrollTop = 1;
	}, 1);
	
}

/*
function enableScrollHelper(element){

	var stretch = element.querySelector('.stretch');
	var position = element.scrollHeight - (2 * stretch.clientHeight);
	
	element.addEventListener('scroll', function() {
            // Check if the scroll position is at the top
            if (element.scrollTop >= position) { // >=
                // If at the top of the stretch element, don’t scroll any farther down
                console.log('reached position')
                //element.scrollTop = position - 1; 
		element.scrollTo({
	                top: position - 1,
	                behavior: 'smooth'
                });
		    
            }
        });

}
*/


function controlStretch(element){
	// adjusts the height of the stretch element to make sure that the grid containers can always scroll
	var stretch = element.querySelector('.stretch');
	console.log(stretch);

	// first set the height to zero in order to reset it
	stretch.style.height = "0px";
	    
	if (element.clientHeight >= element.scrollHeight){
		var allCards = element.querySelectorAll('.gameCard:not(.stretch):not(.buffer)');
		var num = allCards.length;
		console.log(num);
		if (num == 0){
			stretch.style.height = element.clientHeight + 1 + 'px';
			return;
		}
		
		var lastCard = allCards[num - 1];
		var lastElementPosition = lastCard.offsetTop + lastCard.offsetHeight;
		console.log(lastElementPosition);
		var newHeight = (element.clientHeight - lastElementPosition) + 1;
		stretch.style.height = newHeight + 'px';
	}

}

function addEmptyClickEvent(){
	// this function is needed in order to prevent random scrolling when double tapping on elements after clicking on an input tag on iOS
	// Get all elements on the page
	var allElements = document.getElementsByTagName("*");
	
	// Iterate through each element
	for (var i = 0; i < allElements.length; i++) {
	    var currentElement = allElements[i];
	    // Check if the element does not already have an onclick attribute
	    if (!currentElement.hasAttribute("onclick")) {
	        currentElement.addEventListener("click", function() {
	            // simply return to prevent scrolling
	            return;
	        });
	    }
	}

}

function displayPopup(message, closeText=null, continueText=null, continueFunction=null, ...continueArgs){
	// create an element over the top of everything and display a message with options
    	// first create a blank div tag to prevent background items from being clicked
        preventInput = document.createElement('div');
        preventInput.style.height = "100%";
        preventInput.style.width = "100%";
        preventInput.style.overflow = "hidden";
        preventInput.style.top = "0";
        preventInput.style.position = "fixed";
        preventInput.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
        document.body.appendChild(preventInput);
        
        var mainDiv = document.createElement('div');
        mainDiv.style.width = "70%";
        mainDiv.style.position = "fixed";
        mainDiv.style.top = "50%";
        mainDiv.style.left = "50%";
        mainDiv.style.transform = 'translate(-50%, -50%)';
        mainDiv.style.margin = "auto";
        mainDiv.style.overflow = "hidden";
        mainDiv.style.borderRadius = "20px";
        mainDiv.style.border = "solid";
        mainDiv.style.display = "flex";
        mainDiv.style.flexDirection = "column";
	mainDiv.style.textAlign = "center";
        preventInput.appendChild(mainDiv);
        
        var messageDiv = document.createElement('div');
        messageDiv.style.margin = "5%";
        messageDiv.innerText = message;
        mainDiv.appendChild(messageDiv);
        
        var buttonContainer = document.createElement('div');
        buttonContainer.style.display = "flex";
        buttonContainer.style.justifyContent = "space-evenly";
        buttonContainer.style.marginBottom = "5%";
        mainDiv.appendChild(buttonContainer);

	if (closeText != null){
	        var cancelBtn = document.createElement('div');
	        cancelBtn.style.padding = "3% 5% 3% 5%";
	        cancelBtn.style.borderRadius = "999px";
	        cancelBtn.classList = "redGradient";
	        cancelBtn.innerText = closeText;
	        cancelBtn.addEventListener('click', () => {
	            preventInput.remove();
	    	});
	        buttonContainer.appendChild(cancelBtn);
	}
        
        if (continueText != null && continueFunction != null){
            var continueBtn = document.createElement('div');
            continueBtn.style.padding = "3% 5% 3% 5%";
            continueBtn.style.borderRadius = "999px";
            continueBtn.classList = "blueGradient";
            continueBtn.innerText = continueText;
            continueBtn.addEventListener('click', () => {
                continueFunction(...continueArgs);
		preventInput.remove();
        	});
            buttonContainer.appendChild(continueBtn);
        }
}










// functions for favorites page

function toggleHeart(gameID) {
	var theElement = document.getElementById(gameID);
	var heartDiv = theElement.querySelector("div")
	if (heartDiv.innerText == "♥︎") {
		heartDiv.innerText = "♡";
        removeFavorites(gameID);
	} else {
		heartDiv.innerText = "♥︎";
        addToFavorites(gameID);
	}
	// now try to toggle the heart on the duplicate div too
	var theElement = document.getElementById(gameID + "-fave");
	if (theElement == null){
		return;
	}
	var heartDiv = theElement.querySelector("div")
	if (heartDiv.innerText == "♥︎") {
		heartDiv.innerText = "♡";
	} else {
		heartDiv.innerText = "♥︎";
	}
}

function getFavorites() {
    var faves = localStorage.getItem("favorites");
    if(faves !== null){
	    return JSON.parse(faves);
    }
    return [];
}

function addToFavorites(newValue) {
    var favesList = getFavorites();
    favesList.push(newValue);
    setFavorites(favesList);
}

function setFavorites(favesList) {
    var string = JSON.stringify(favesList);
    localStorage.setItem("favorites", string);
}

function removeFavorites(valueToRemove) {
    var favesList = getFavorites();
    var updatedList = favesList.filter(value => value !== valueToRemove);
    setFavorites(updatedList);
}

function markFavorites() {
    var favesList = getFavorites();
    favesList.forEach(value => {
        document.getElementById(value).firstChild.innerText = '♥︎';
    });
}

function hideOtherElements(unhiddenElementClass) {
    var list = ['allGames', 'favorites', 'create', 'settings'];
    for (var i = 0; i < list.length; i++) {
	var value = list[i];
        var element = document.getElementById(value);
        if (value == unhiddenElementClass){
            element.classList.remove('hidden');
		controlStretch(element);
		allowScroll(element);
	    document.querySelector("body > div.menu-bar > div:nth-child(" + (i + 1) + ")").classList.add("active");
        }else{
            element.classList.add('hidden');
	    document.querySelector("body > div.menu-bar > div:nth-child(" + (i + 1) + ")").classList.remove("active");
        }
    }
}

function displayFavorites() {
    var favesPage = document.getElementById('favorites');
    favesPage.innerHTML = '<div class="gameCard orangeGradient buffer"></div><div class="gameCard pinkGradient stretch" style="height: 0px;"></div>';
    var buffer = favesPage.querySelector(".buffer");
    var favesList = getFavorites();
    console.log(favesList)
    favesList.forEach(value => {
        var element = document.getElementById(value);
        console.log(element)
	var clone = element.cloneNode(true);
	clone.id = value + "-fave";
        favesPage.insertBefore(clone, buffer);
    });
    hideOtherElements('favorites');
}








// functions for create page

function createSet() {
    // reveal the create-page
    var page = document.getElementById('create-page');
    page.classList.remove('hidden');
    selectedColor = "blueGradient";
}

function discardSet() {
    var page = document.getElementById('create-page');
    page.classList.add('hidden');
    var inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(element => {
        element.value = '';
    });
    selectColor('blueGradient');

    // make sure that the scrolling bug in iOS doesn't mess with the user experience
    preventScroll();

    // make sure random scrolling doesn't happen on iOS
    addEmptyClickEvent();
}

function selectColor(color) {
    var circles = document.querySelectorAll('.color-circle');
    circles.forEach(element => {
        if (element.classList.contains(color)){
            element.classList.add('selectedColor');
            selectedColor = color;
        }else{
            element.classList.remove('selectedColor');
        }
    });
}

async function importUserCreatedGame(id, errorCount=0){
	if (errorCount > 5){
		console.log('fetch failed')
		handleIdError();
	}
	try{
		var url = 'https://tinyurl.com/' + id;
		const response = await fetch(url);
	  	const tinyURL = await response.url
		var data = tinyURL.replace(location.href + '?s=', '');
		console.log(data);
		getJsonFromData(data);
	}catch{
		setTimeout(function () {
			fetchUserCreatedGame(id, errorCount + 1)
		}, 1000)
	}
}

async function uploadUserCreatedGame(data, errorCount=0){
	if (errorCount > 5){
		console.log('upload failed')
		handleUploadError();
	}
	try{
		var url = 'https://tinyurl.com/api-create.php?url=' + location.href + '?s=' + data;
		const response = await fetch(url);
	  	const tinyURL = await response.text()
		var id = tinyURL.replace('http://tinyurl.com/', '');
		preventInput.remove();
		displayPopup("Your Shareable Code:\n\n" + id, "Close", "Copy Code", function (){
			// Create a temporary input element to copy the code to the clipboard
		      	var tempInput = document.createElement('input');
		      	tempInput.value = id;
			tempInput.classList = "hidden";
		      	document.body.appendChild(tempInput);
		      	tempInput.select();
			tempInput.setSelectionRange(0, 99999); // For mobile devices
		      	navigator.clipboard.writeText(tempInput.value);
		      	tempInput.remove();
			// change the continue text
			var continueBtn = preventInput.querySelector("div.blueGradient");
			continueBtn.innerText = "Copied!";
			// generate an error to prevent the window from closing after copying
			throw new Error('This is expected behavior. Please Ignore. Window prevented from closing');
		});
	}catch{
		setTimeout(function () {
			uploadUserCreatedGame(data, errorCount + 1)
		}, 1000)
	}
}

function createGame() {
	var title = document.getElementById('gameTitle').value.trim();
	var description = document.getElementById('description').value.trim();
	var cards = document.getElementById('enterCards').value;

	if (title == "" || description == "" || cards.trim() == ""){
		var message = "All fields are required.\n\nPlease make sure nothing is left blank.";
		displayPopup(message, 'Okay');
		return;
	}
	
	// split the cards into a list and remove the whitespace
	var cardsList = cards.split("\n");
	for (var i = 0; i < cardsList.length; i++) {
	    cardsList[i] = cardsList[i].trim();
	    if (cardsList[i] == ""){
		    // remove the item by splicing it
		    cardsList.splice(i, 1);
		    // adjust the index because the size of the list changed
		    i--;
	    }
	}

	// get current date
	var currentDate = new Date();
	var year = currentDate.getFullYear().toString().substr(-2); // Last two digits of the year
	var month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 because months are zero-based
	var day = currentDate.getDate().toString().padStart(2, '0');
	var hours = currentDate.getHours().toString().padStart(2, '0');
	var minutes = currentDate.getMinutes().toString().padStart(2, '0');
	var seconds = currentDate.getSeconds().toString().padStart(2, '0');
	var milliseconds = currentDate.getMilliseconds().toString().padStart(3, '0');
	var dateString = year + month + day + hours + minutes + seconds + milliseconds;
	
	// create the id for the game from the title and current date
	var gameID = title.replace(/ /g, '-') + dateString;

	var dict = {
	    "title": title,
	    "description": description,
	    "games": {
	      "Play": cardsList
	    },
	    "color": selectedColor, 
	    "id": gameID
	}

	//var dictString = JSON.stringify(dict);
	storeUserCreatedGame(dict);
	generateUserCreatedGame(dict);
}

function shareGame(id){
	alert("share game: " + id);
	displayPopup("Generating Shareable Code\n\n. ....");
	function changeEllipsis() {
		var topText = "Generating Shareable Code\n\n";
		var ellipsisElement = preventInput.querySelector('div > div > div');
		var ellipsisText = ellipsisElement.innerText;
		if (ellipsisText == topText + " ....."){
			ellipsisElement.innerText = topText + ". ....";
			setTimeout(changeEllipsis, 500);
		}else if (ellipsisText == topText + ". ...."){
			ellipsisElement.innerText = topText + ".. ...";
			setTimeout(changeEllipsis, 500);
		}else if (ellipsisText == topText + ".. ..."){
			ellipsisElement.innerText = topText + "... ..";
			setTimeout(changeEllipsis, 500);
		}else if (ellipsisText == topText + "... .."){
			ellipsisElement.innerText = topText + ".... .";
			setTimeout(changeEllipsis, 500);
		}else if (ellipsisText == topText + ".... ."){
			ellipsisElement.innerText = topText + "..... ";
			setTimeout(changeEllipsis, 500);
		}else if (ellipsisText == topText + "..... "){
			ellipsisElement.innerText = topText + " .....";
			setTimeout(changeEllipsis, 500);
		}
	}
	
	var gameDict = getUserCreatedGame(id);
	var string = JSON.stringify(gameDict);
	var urlEncoded = encodeURIComponent(string);
	uploadUserCreatedGame(urlEncoded);
}

function getJsonFromData(data){
	// decode the url encoded data
	// create json object by de-stringifing it
	// add the new game to local storage: storeUserCreatedGame(jsonString, gameID)
	// call generateUserCreatedGame(jsonObject)
}

function generateUserCreatedGame(dict){
    var gameID = dict['id'];
    var title = dict['title'];
    var des = dict['description'];
    
	// create the game card for a user created game	
	var mainDiv = document.createElement('div');
	mainDiv.classList = "gameCard " + dict['color'];
	mainDiv.id = gameID;
	mainDiv.onclick = function() {
		//first, request permission to use the device's orientation
  		requestPermission();
        var cardDict = getUserCreatedGame(gameID);
    	gamesDict = cardDict['games'];
		buildGamePreview(title, des);
	};
	// create heart div
	var heartDiv = document.createElement('div');
	heartDiv.innerText = "♡";
	heartDiv.onclick = function() {
    		toggleHeart(gameID);
		event.stopPropagation();
	};
	// create the dropdown menu
	var dropDown = makeDropDownMenu(gameID);
	// create image 
	var image = document.createElement('img');
	image.src = "icons/masked.png";
	image.alt = "icon";
	// create title div
	var titleDiv = document.createElement('div');
	titleDiv.innerText = title;

	// append the elements to the main div
	mainDiv.appendChild(heartDiv);
	mainDiv.appendChild(dropDown);
	mainDiv.appendChild(image);
	mainDiv.appendChild(titleDiv);

	// append mainDiv to create page
	var createPage = document.getElementById('create');
    var buffer = createPage.querySelector('.buffer');
	createPage.insertBefore(mainDiv, buffer);

	// adjust the stretch element after adding a new game card
	controlStretch(createPage);

	// exit the create screen
	discardSet();
}

function storeUserCreatedGame(dict){
    var gamesDict = getAllUserCreatedGames();
    var gameID = dict['id'];
    gamesDict[gameID] = dict;
    setUserCreatedGames(gamesDict); 
}

function getAllUserCreatedGames(){
    var games = localStorage.getItem("userCreatedGames");
    if(games !== null){
	    return JSON.parse(games);
    }
    return {};
}

function setUserCreatedGames(gamesDict) {
    var string = JSON.stringify(gamesDict);
    localStorage.setItem("userCreatedGames", string);
}

function removeUserCreatedGame(idToRemove) {
    var gamesDict = getAllUserCreatedGames();
    delete gamesDict.idToRemove;
    setUserCreatedGames(gamesDict);
}

function getUserCreatedGame(id) {
    var gamesDict = getAllUserCreatedGames();
    var game = gamesDict[id];
    return game;
}

function buildAllUserCreatedGames() {
    // this function should be run when the app starts, it gets all user created games from localstorage and builds them
    var dict = getAllUserCreatedGames();
    for (var key in dict) {
        var value = dict[key];
        generateUserCreatedGame(value);
    }
}

function makeDropDownMenu(gameID){
	// create a sub-function to create the table rows and cells
	function makeRowCells(title, clickFunction){
		var row = document.createElement('tr');
		var cell = document.createElement('th');
		cell.innerText = title;
		cell.onclick = function() {
	    		clickFunction(gameID);
			event.stopPropagation();
		};
		row.appendChild(cell);
		return row;
	}
	
	var dropDown = document.createElement('div');
	dropDown.classList = "dropDownButton";
	dropDown.innerText = '☰';
	dropDown.onclick = function() {
    		toggleDropDown(gameID);

		// Add event listener to detect if user clicked outside of menu
		document.addEventListener("click", function handleClickOutsideMenu(evt) {
		    // Check if the target element or any of its ancestors have the 'dropDownMenu' class
		    if (evt.target.closest(".dropDownMenu")) {
		        // This is a click inside the dropdown menu, do nothing
		        console.log("Clicked inside menu!");
		        return;
		    }
		    // This is a click outside the dropdown menu
		    console.log("Clicked outside menu!");
		    // toggle the DropDown menu again
		    toggleDropDown(gameID);
		    // Remove the event listener after the first click outside the menu
		    document.removeEventListener("click", handleClickOutsideMenu, true);
		}, true);

		// stop other events in parent elements from executing
		event.stopPropagation();
	};
	// make table
	var table = document.createElement('table');
	table.classList = "dropDownMenu hidden";
	var tbody = document.createElement('tbody');
	table.appendChild(tbody);
	var shareBtn = makeRowCells('Share ➦', shareGame);
	var editBtn = makeRowCells('Edit ✎', editGame);
	var deleteBtn = makeRowCells('Delete ⌫', deleteGame);
	tbody.appendChild(shareBtn);
	tbody.appendChild(editBtn);
	tbody.appendChild(deleteBtn);
	dropDown.appendChild(table);
	return dropDown;
}

function toggleDropDown(gameID){
	var gameCard = document.getElementById(gameID);
	var menu = gameCard.querySelector('.dropDownMenu');
	menu.classList.toggle('hidden');
	/*
	if (menu.classList.contains('hidden')){
		menu.classList.remove('hidden');
	}else{
		menu.classList.add('hidden');
	}
 	*/
}

function editGame(id){
	alert("edit game: " + id);
}

function deleteGame(id, confirm=false){
	if (confirm == false){
		var message = "Are you sure you want to delete this game?\n\nThis action cannot be undone.";
		displayPopup(message, "Cancel", "Delete Game", deleteGame, id, true);
		return;
	}
	// delete game from user created games list
	removeUserCreatedGame(id);
	// delete the element from the page
	var element = document.getElementById(id);
	element.remove();
	// remove it from the favorites list
	removeFavorites(id);
	// adjust the stretch element
	var createPage = document.getElementById('create');
	controlStretch(createPage);
}

function handleUploadError(){
	// display an error message
	// the game couldn't be shared at this time
}

function handleIdError(){
	// display an error message
	// invalid game id or network error
}





// functions for settings page

function getSettings() {
    var settings = localStorage.getItem("settings");
    if(settings !== null){
	    return JSON.parse(settings);
    }
    return {};
}

function setSettings(dict) {
    var string = JSON.stringify(dict);
    localStorage.setItem("settings", string);
}

function setDefaultTimer(seconds) {
	const selectedTimers = document.getElementsByClassName('timerOption');
	// Loop through the collection and remove the 'selectedTimer' class from each element
	for (let i = 0; i < selectedTimers.length; i++) {
    		const element = selectedTimers[i];
                if (element.innerText == seconds+'s'){
                	element.classList.add('selectedTimer');
			var settings = getSettings();
		        settings["default-timer"] = seconds;
			setSettings(settings);
			defaultTimer = seconds;
                }else{
        		element.classList.remove('selectedTimer');
                }
	}
}

function displaySettingsPage(){
	// display the correct default timer
	var time = getSettings()["default-timer"];
	if (time == undefined){
		var defaultTime = 60;
	}else{
		var defaultTime = time;
	}
	setDefaultTimer(defaultTime);
	
	// make the page visible
	hideOtherElements("settings");
}
    
    
    
    
	
function installPrompt() {
    if (!isRunningStandalone()){
    	// Create a new div element
    	var newDiv = document.createElement('div');
    
    	// Style the div
    	newDiv.style.position = 'fixed';
        	newDiv.style.top = '50%';
        	newDiv.style.left = '50%';
        	newDiv.style.transform = 'translate(-50%, -50%)';
        	newDiv.style.padding = '10px';
    	newDiv.style.border = '1px solid #0000ff';
    	newDiv.style.flexFlow = "column";
    
    	// add default text
    	var theText = document.createElement('p');
    	theText.innerText = "Please install the PWA"
    	newDiv.appendChild(theText);
    
    	// Style the close button
    	var closeBtn = document.createElement('span');
    	closeBtn.style.cursor = 'pointer';
    	closeBtn.innerText = "x"
    	closeBtn.style.position = "absolute";
    	closeBtn.style.top = 0;
    	closeBtn.style.left = 0;
    	closeBtn.style.display = "flex";
    	newDiv.appendChild(closeBtn)
    
    	// Add a click event listener to close the div
    	closeBtn.addEventListener('click', function() {
    	  document.body.removeChild(newDiv);
    	});
    	
    	// Append the div to the body
    	document.body.appendChild(newDiv);
    	
    	if (isiOS()){
    		// prompt to install on iOS
    		theText.innerHTML = "<p>The experience is better with the App!</p><p>Download it by tapping the share button <img src='https://i.imgur.com/eUbPxhg.png' style='display: inline; height: 10px; width: auto;' alt='img-mail' /> below, then tap on 'Add to Home Screen'</p>"
    		
    	}else if (!isiOS()){
    		// prompt to install on Android
    		theText.innerText = "The experience is better with the App!\nTo install the Web App please click the install button below.";
            var installBtn = document.createElement('div');
            installBtn.innerText = "Install";
            installBtn.style.borderRadius = "999px";
            installBtn.style.backgroundColor = "yellow";
	    installBtn.style.padding = "2% 8%";
	    installBtn.style.color = "black";
            installBtn.addEventListener('click', function() {
        	  // install the PWA
              deferredPrompt.prompt();
        	});
            newDiv.appendChild(installBtn);
    	}
    }
}



let deferredPrompt;

window.addEventListener('beforeinstallprompt', function (e) {

  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();

  // Stash the event so it can be triggered later.
  deferredPrompt = e;
});


function main() {
	// call functions that should run immediately upon load
    buildAllUserCreatedGames();
	markFavorites();
	installPrompt();

	// Add event listener for changes in orientation to adjust the stretch element
	window.addEventListener('orientationchange', function(){
		var currentElement = document.querySelector('.grid-container:not(.hidden)');
		controlStretch(currentElement);
	});

	// get the default timer
	var time = getSettings()["default-timer"];
	if (time == undefined){
		defaultTimer = 60;
	}else{
		defaultTimer = time;
	}
}
main();
