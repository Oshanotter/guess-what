//screen.orientation.lock("landscape");

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
    defaultTimer = 120;

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
    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

    // Detects is Android device is in standalone mode
    function isRunningStandalone() {
      return (window.matchMedia('(display-mode: standalone)').matches);
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

      var circle = document.createElement('div');
      circle.id = "circle"
      circle.style.borderRadius = "50%";
      circle.style.border =  "1vw solid blue";
      circle.style.height = "10vw";
      circle.style.width = "10vw";
      circle.style.top = "80%"
      circle.style.left = "50%";
      circle.style.position = "absolute";
      circle.style.transform = "translate(-50%, -50%)";
      circle.innerText = defaultTimer;
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
      });
      banner.appendChild(exitButton);

      document.body.appendChild(overlay);

      getReady(6);
    }

    function getReady(countdown){
        // start counting down to get ready
        if (countdown == 1){
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
        startTimer(10); // change 10 to defaultTimer
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
        //requestPermission();
        createOverlay();
    }

    function handleOrientation(event) {
        if (!allowColorChange){
            if (typeof passCorrectList == 'undefined' || typeof cardList == 'undefined') {
                passCorrectList = [];
                cardList = [];
            }
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
                        return true;
                    } else {
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
            overlay.removeChild(startText);

            for (var i = 0; i < passCorrectList.length; i++){
                var card = cardList[i];
                if (passCorrectList[i] == "CORRECT"){
                    var color = "green";
                }else{
                    var color = "red";
                }
                var text = document.createElement('span');
                text.innerText = card;
                text.style.color = color;
                var evenOdd = i % 2;
                if (evenOdd == 0){
                    // it is even, add to left list
                    leftCol.appendChild(text)
                }else{
                    // it is odd, add to right list
                    rightCol.appendChild(text)
                }
            }
            /*
            if (cardList.length % 2 == 1){
                // add another card to the right column to make them even
                var text = document.createElement('span');
                text.innerText = "hi there, this is some very, extra long text";
                rightCol.appendChild(text);
            }*/
        }, 3000);
    }












async function getDictionary(path) {
  try {
    // Fetch the JSON file
    const response = await fetch(path);
    collectionDict = await response.json();
    gamesDict = collectionDict["games"];
    console.log(collectionDict)

    var title = collectionDict["title"];
    var description = collectionDict["description"];
    console.log(title)
    console.log(description)
    requestPermission()
    buildGamePreview(title, description);
    console.log("done building game")
	  
  } catch (error) {
    console.error('Error fetching or parsing JSON:', error);
  }
}

function buildGamePreview(title, description) {
	// build the screen to confirm to play the game
	// Create main container div
	const mainDiv = document.createElement('div');
	mainDiv.className = "gamePreview"
	mainDiv.style.position = 'absolute';
	mainDiv.style.top = '50%';
	mainDiv.style.left = '50%';
	mainDiv.style.transform = 'translate(-50%, -50%)';
	mainDiv.style.width = '95%';
	mainDiv.style.border = '1px solid #ccc';
	mainDiv.style.padding = '10px';
	mainDiv.style.backgroundColor = 'grey';
	mainDiv.style.textAlign = 'center';
	
	
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
	});
	
	// Create title
	const titleDiv = document.createElement('div');
	titleDiv.className = "gamePreview"
	titleDiv.textContent = title;
	titleDiv.style.fontWeight = 'bold';
	titleDiv.style.fontSize = "200%"
	
	
	// Create time options div
	const timeOptionsDiv = document.createElement('div');
	timeOptionsDiv.className = "gamePreview"
	timeOptionsDiv.style.display = 'flex'; // Set display to flex
	timeOptionsDiv.style.backgroundColor = 'lightblue'; // Set light blue background color
	timeOptionsDiv.style.flexDirection = 'column';
	timeOptionsDiv.style.fontSize = "150%";
	
	var chooseTimeText = document.createElement('div');
	chooseTimeText.className = "gamePreview"
	chooseTimeText.innerText = "Game Timer Options"
	timeOptionsDiv.appendChild(chooseTimeText);
	var theOptions = document.createElement('div');
	theOptions.className = "gamePreview"
	theOptions.style.display = 'flex';
	theOptions.style.flexDirection = 'row';
	theOptions.style.justifyContent = 'center';
	timeOptionsDiv.appendChild(theOptions);
	
	// Create options (60s, 90s, 120s)
	const timeOptions = [60, 90, 120];
	timeOptions.className = "gamePreview"
	timeOptions.forEach((option) => {
	    optionDiv = document.createElement('div');
	    optionDiv.className = "gamePreview"
	    optionDiv.textContent = option + "s";
	    optionDiv.style.cursor = 'pointer';
	    optionDiv.style.paddingLeft = '10%'; // Add margin to separate options
	    optionDiv.style.paddingRight = '10%';
	    optionDiv.style.paddingTop = '3%';
	    optionDiv.style.paddingBottom = '3%';
	    if (defaultTimer == option){
		    optionDiv.classList.add('selectedTimer');
	    }
	    optionDiv.addEventListener('click', () => {
	        // Execute function based on the selected option
	        roundTimer = option;
		// Find all elements with the class name 'selectedTimer'
		const selectedTimers = document.getElementsByClassName('selectedTimer');
		
		// Loop through the collection and remove the 'selectedTimer' class from each element
		for (let i = 0; i < selectedTimers.length; i++) {
		    const element = selectedTimers[i];
		    element.classList.remove('selectedTimer');
		}
		optionDiv.classList.add('selectedTimer');
	    });
	    theOptions.appendChild(optionDiv);
	});
	
	// Create description div
	const descriptionDiv = document.createElement('div');
	descriptionDiv.className = "gamePreview"
	descriptionDiv.innerText = description

	const gridDiv = document.createElement('div');
	gridDiv.className = "gamePreview";
	var theKeys = Object.keys(gamesDict);
	if (theKeys.length > 1){
		// add a "Play All" option
		
	}
	for (const key in gamesDict){
		
	}
	
	// Create grid of div tags with titles and functions

	
	theKeys.forEach((key) => {
	    const gridItemDiv = document.createElement('div');
	    gridItemDiv.textContent = item.title;
	    gridItemDiv.style.border = '1px solid #ddd';
	    gridItemDiv.style.padding = '5px';
	    gridItemDiv.style.margin = '5px';
	    gridItemDiv.style.cursor = 'pointer';
	    gridItemDiv.addEventListener('click', function() {
		  getGameList(key);
	    });
	    gridItemDiv.style.borderRadius = "1vmin";
	    gridItemDiv.id = "gamePreview"
	    gridDiv.appendChild(gridItemDiv);
	});
	
	mainDiv.style.borderRadius = "2vmin";
	timeOptionsDiv.style.borderRadius = "999px";
	
	// Append created elements to the main container
	mainDiv.appendChild(closeButton);
	mainDiv.appendChild(titleDiv);
	mainDiv.appendChild(descriptionDiv);
	mainDiv.appendChild(timeOptionsDiv);
	mainDiv.appendChild(gridDiv);
	
	// Append main container to the body
	document.body.appendChild(mainDiv);
}









	
	
function installPrompt() {
	// Create a new div element
	var newDiv = document.createElement('div');

	// Style the div
	newDiv.style.position = 'fixed';
    	newDiv.style.top = '50%';
    	newDiv.style.left = '50%';
    	newDiv.style.transform = 'translate(-50%, -50%)';
    	newDiv.style.padding = '10px';
	newDiv.style.border = '1px solid #0000ff';

	// add default text
	var theText = document.createElement('p');
	theText.innerText = "Please install the PWA"
	newDiv.appendChild(theText)

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
	
	if (isiOS() && !isRunningStandalone()){
		// prompt to install on iOS
		theText.innerHTML = "<p>The experience is better with the App!</p><p>Download it by tapping the share button <img src='https://i.imgur.com/eUbPxhg.png' style='display: inline; height: 10px; width: auto;' alt='img-mail' /> below, then tap on 'Add to Home Screen'</p>"
		
	}else if (!isiOS()){
		// prompt to install on Android
		theText.innerText = "Please install the PWA for Android"
	}
}
installPrompt()
