let count = 0;
function setCount(userInput) {
  count = userInput;
  // console.log(count);
}

// This function can be called flag. I use this funciton to detect if the queryAttractions function is fetching data or not.
// Check the comment inside of the queryAttractions function
let isLoading = false;
function detectLoading(signal) {
  isLoading = signal;
  // console.log(isLoading);
}

function failQuery(userInput) {
  let container = document.getElementById("container");

  let firstLayerDiv = document.createElement("p");
  firstLayerDiv.className = "wrongMessage";
  container.appendChild(firstLayerDiv);
  firstLayerDiv.innerHTML = userInput;

  container.parentNode.replaceChild(firstLayerDiv, container);
}

// The code below is when user query the attraction by using the enter key to query.
let inputtest = document.getElementById("queryLocationName");
inputtest.addEventListener("keyup", function (event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Trigger the button element with a click
    document.getElementById("queryAttractionsNameByEnter").click();
  }
});

function querytagsCheck() {
  keywordInput = document.getElementById("queryLocationName").value;
  let container = document.getElementById("container");
  if (container) {
    container.remove();
  }
  let wrongMessage = document.querySelector(".wrongMessage");

  if (wrongMessage) {
    wrongMessage.remove();
  }

  let outerContainer = document.getElementById("outerContainer");

  let firstLayerDiv = document.createElement("div");
  firstLayerDiv.className = "container";
  firstLayerDiv.id = "container";
  outerContainer.appendChild(firstLayerDiv);

  queryAttractions(0);
}

function queryAttractions(pageNumber) {
  // If isLoading is true, it means the function is fetching the data via API. Even the scrolling function has been manipulated more than once.
  // This queryAttractions function cannot pass the if statement in scrolling function. (check window.addEventListener)
  detectLoading(true);

  let url = "";
  keywordInput = document.getElementById("queryLocationName").value;
  if (keywordInput === "") {
    url = `http://13.210.218.205:4000/api/attractions?page=${pageNumber}`;
  } else {
    url = `http://13.210.218.205:4000/api/attractions?page=${pageNumber}&keyword=${keywordInput}`;
  }

  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      setCount(response["nextPage"]);
      if (response.message) {
        failQuery(
          `There is no result matching your query, try another word again, thanks.`
        );
      } else {
        for (let i = 0; i < response["data"].length; i++) {
          let name = response["data"][i]["name"];
          let mrt = response["data"][i]["mrt"];
          let category = response["data"][i]["category"];
          let image = response["data"][i]["images"][0];
          let id = response["data"][i]["id"];
          // This url is not the same as the /api/attraction/id,
          // This url directly link to the attraction.html page, but using the data capatured from API.
          let idUrl = `http://13.210.218.205:4000/attraction/${id}`;
          createGrid(name, mrt, category, image, idUrl);
        }
      }
      // This function is for testing purpose and also can know whether the data back or not.
      // setTimeout(function(){
      //     detectLoading(false);
      // },5000)

      // If the data has been captured successfully by API, this means here should set up to false. Then, the system can excute the function again.
      detectLoading(false);
    })
    .catch((error) => {
      console.log(
        error,
        "Something went wrong when fetching data via API, Check JS function : queryAttractions()"
      );
    });
}

queryAttractions(count);
window.addEventListener("scroll", () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const scrlled = window.scrollY;

  if (Math.ceil(scrlled) === scrollable) {
    // count means True and isLoading means false
    if (count && isLoading === false) queryAttractions(count);
  }
  // else {
  //   console.log("I am here");
  // }
});

// The code is for creating attractions' block.
// change the title to => name, mrt, category. url => image
function createGrid(name, mrt, category, image, idUrl) {
  let container = document.getElementsByClassName("container")[0];

  // a tag
  let lineToAttractionPage = document.createElement("a");
  lineToAttractionPage.setAttribute("href", idUrl);

  // Reference(how to add New Nodes): https://ithelp.ithome.com.tw/articles/10191867    => check in the middle of the article
  // add new nodes.
  // First Layer
  let firstLayerDiv = document.createElement("div");
  firstLayerDiv.className = "square";
  // Second and Third Layer Topbox
  let secondLayerDivTopBox = document.createElement("div");
  secondLayerDivTopBox.className = "topBox";

  let loaderImg = document.createElement("div");
  loaderImg.className = "loader --1";

  let thirdLayerImg = document.createElement("img");
  thirdLayerImg.className = "image";
  thirdLayerImg.src = image;
  // Reference: http://otischou.tw/notes/2017/01/01/detect-is-image-loaded.html
  thirdLayerImg.onload = function () {
    loaderImg.style.display = "none";
    thirdLayerImg.style.display = "block";
  };

  let thirdLayerPForName = document.createElement("p");
  textNodeForName = document.createTextNode(name);
  thirdLayerPForName.appendChild(textNodeForName);
  // Second and Third Layer bottomBox
  let secondLayerDivbottomBox = document.createElement("div");
  secondLayerDivbottomBox.className = "bottomBox";

  let thirdLayerPForMrt = document.createElement("p");
  textNodeForMrt = document.createTextNode(mrt);
  thirdLayerPForMrt.appendChild(textNodeForMrt);

  let thirdLayerPForCategory = document.createElement("p");
  textNodeForCategory = document.createTextNode(category);
  thirdLayerPForCategory.appendChild(textNodeForCategory);

  secondLayerDivTopBox.appendChild(loaderImg);
  secondLayerDivTopBox.appendChild(thirdLayerImg);
  secondLayerDivTopBox.appendChild(thirdLayerPForName);
  secondLayerDivbottomBox.appendChild(thirdLayerPForMrt);
  secondLayerDivbottomBox.appendChild(thirdLayerPForCategory);
  firstLayerDiv.appendChild(secondLayerDivTopBox);
  firstLayerDiv.appendChild(secondLayerDivbottomBox);
  lineToAttractionPage.appendChild(firstLayerDiv);
  container.appendChild(lineToAttractionPage);
}
