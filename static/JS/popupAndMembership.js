// Check more insturction and explaination from this site: https://www.w3schools.com/howto/howto_css_modals.asp
let signInPopup = document.getElementById("signInPopup"); /*in index.html */
let registerPopup = document.getElementById("registerPopup"); /*in index.html */

// The variables below are to clear the text inside of the input field after the window colsed.
let clearNameBoxInput = document.getElementsByClassName("nameBox")[0];
let clearEmailBoxInputForSignIN =
  document.getElementsByClassName("emailBox")[0];
let clearEmailBoxInputForRegister =
  document.getElementsByClassName("emailBox")[1];
let clearPasswordBoxInputForSignIN =
  document.getElementsByClassName("passwordBox")[0];
let clearPasswordBoxInputForRegister =
  document.getElementsByClassName("passwordBox")[1];

let urlUser = "/api/user";
let urlBooking = "/api/booking";
// This is for checking whether current page's URL is the same as booking page URL and then I can get the contact name.
let urlCurrentBooking = "/booking";

// in index.html This function is the all the log-in function source, which means if I want to use log-in box, I can just use this.
function btnPushItems_2() {
  signInPopup.style.display = "block";
}
function clearValue() {
  clearEmailBoxInputForSignIN.value = "";
  clearEmailBoxInputForRegister.value = "";
  clearPasswordBoxInputForSignIN.value = "";
  clearPasswordBoxInputForRegister.value = "";
  clearNameBoxInput.value = "";
}

window.onclick = function (event) {
  if (event.target == signInPopup || event.target == registerPopup) {
    event.target.style.display = "none";
    clearValue();
    let existErrorMsgTag = document.getElementsByClassName("errorMsg")[0];
    if (existErrorMsgTag) {
      existErrorMsgTag.remove();
    }
  }
};

/*in signIn.html */
function register() {
  registerPopup.style.display = "block";
  signInPopup.style.display = "none";
  clearValue();
  let existErrorMsgTag = document.getElementsByClassName("errorMsg")[0];
  if (existErrorMsgTag) {
    existErrorMsgTag.remove();
  }
}
function closeIconSignIn() {
  signInPopup.style.display = "none";
  clearValue();
  let existErrorMsgTag = document.getElementsByClassName("errorMsg")[0];
  if (existErrorMsgTag) {
    existErrorMsgTag.remove();
  }
}

/*in register.html */
function signIn() {
  registerPopup.style.display = "none";
  signInPopup.style.display = "block";
  clearValue();
  let existErrorMsgTag = document.getElementsByClassName("errorMsg")[0];
  if (existErrorMsgTag) {
    existErrorMsgTag.remove();
  }
  let existInformMsgTag = document.getElementsByClassName("successMsg")[0];
  if (existInformMsgTag) {
    existInformMsgTag.remove();
  }
}
function closeIconRegister() {
  registerPopup.style.display = "none";
  clearValue();
  let existInformMsgTag = document.getElementsByClassName("successMsg")[0];
  if (existInformMsgTag) {
    existInformMsgTag.remove();
  }
}

function validateEmail(email) {
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
    return true;
  } else {
    return false;
  }
}
function validatePhone(phoneNumber) {
  if (/[0][0-9]{9}/.test(phoneNumber)) {
    return true;
  } else {
    return false;
  }
}

function createInformMsgTag(tagName, tagClassName, messages) {
  let bottomPopupBoxParentNode = document.getElementById(tagName).parentNode;
  let bottomPopupBox = document.getElementById(tagName);
  let existErrorMsgTag = document.getElementsByClassName("errorMsg")[0];
  let existInformMsgTag = document.getElementsByClassName("successMsg")[0];
  if (existErrorMsgTag) {
    existErrorMsgTag.remove();
  }
  if (existInformMsgTag) {
    existInformMsgTag.remove();
  }
  let errorMsg = document.createElement("div");
  errorMsg.className = tagClassName;

  let errorMsgTag = document.createElement("p");
  errorMsg.appendChild(errorMsgTag);

  bottomPopupBoxParentNode.insertBefore(errorMsg, bottomPopupBox);
  errorMsgTag.innerHTML = messages.join("<br>");
}

function createNavLogInTag() {
  let navBtnHeader = document.getElementsByClassName("push")[0];
  let logInAndRegisterButton = document.getElementById("pushItems_2");
  logInAndRegisterButton.remove();

  let logOutButton = document.createElement("button");
  logOutButton.id = "pushItemsLogOut";
  logOutButton.className = "pushItemsLogOut";
  logOutButton.onclick = function () {
    deleteUserStatus(urlUser);
  };
  let logOutTag = document.createElement("p");
  logOutTag.id = "logOut";

  logOutButton.appendChild(logOutTag);
  navBtnHeader.appendChild(logOutButton);
  logOutTag.innerHTML = "登出系統";
}

signInToSystem = document.getElementById("signInToSystem");
signInToSystem.addEventListener("click", (outcome) => {
  let messages = [];
  sigInEmailBox = document.getElementById("sigInEmailBox").value;

  sigInPasswordBox = document.getElementById("sigInPasswordBox").value;

  if (validateEmail(sigInEmailBox) === false) {
    messages.push("信箱格式不正確");
  }
  if (sigInPasswordBox === "" || sigInPasswordBox == null) {
    messages.push("密碼不得為空");
  }
  if (messages.length > 0) {
    outcome.preventDefault();
    tagClassName = "errorMsg";
    createInformMsgTag("bottomPopupBoxForSingIn", tagClassName, messages);
  } else {
    logInToSystem(urlUser);
  }
});

function logInToSystem(urlUser) {
  singInInput = document.getElementById("sigInEmailBox").value;
  sigInPasswordBox = document.getElementById("sigInPasswordBox").value;
  fetch(urlUser, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: singInInput,
      password: sigInPasswordBox,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (String(Object.keys(data)) === "ok") {
        createNavLogInTag();
        // checkUserStatus(); //This method is to send a request again instead of refreah page.
        location.reload();

        signInPopup.style.display = "none";
        clearValue();
      } else {
        messages = [data["message"]];
        tagClassName = "errorMsg";
        createInformMsgTag("bottomPopupBoxForSingIn", tagClassName, messages);
      }
    })
    .catch((error) => {
      console.log(
        error,
        "Something went wrong when fetching data via API, Check JS function : logInToSystem"
      );
    });
}

// =============================
registerNewMeber = document.getElementById("registerNewMeber");
registerNewMeber.addEventListener("click", (outcome) => {
  let messages = [];
  registerName = document.getElementById("registerNameBox").value;
  registerEmail = document.getElementById("registerEmailBox").value;
  registerPassword = document.getElementById("registerPasswordBox").value;

  if (registerName === "" || registerName == null) {
    messages.push("姓名不得為空");
  }
  if (validateEmail(registerEmail) === false) {
    messages.push("信箱格式不正確");
  }
  if (registerPassword.length <= 6) {
    messages.push("密碼至少需 6 個字元");
  }
  if (messages.length > 0) {
    outcome.preventDefault();
    tagClassName = "errorMsg";
    createInformMsgTag("bottomPopupBoxForRegister", tagClassName, messages);
  } else {
    registerToSystem(urlUser);
  }
});
// =============================

function registerToSystem(urlUser) {
  fetch(urlUser, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (String(Object.keys(data)) === "ok") {
        // console.log("成功");
        messages = ["註冊成功"];
        tagClassName = "successMsg";
        createInformMsgTag("bottomPopupBoxForRegister", tagClassName, messages);
      } else {
        messages = [data["message"]];
        tagClassName = "errorMsg";
        createInformMsgTag("bottomPopupBoxForRegister", tagClassName, messages);
        // console.log(data["message"]);
      }
    });
}

function checkUserStatus(urlUser, urlCurrentBooking) {
  fetch(urlUser)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // The code below means the user already logged in system.
      if (String(data) !== "null") {
        createNavLogInTag();
        // In order to get the user name by this fetching API,so here,
        // I need to check which page are sending this API then response the user name to page.
        // The code below is all showing in the booking page.
        currentPageUrl = window.location.href;
        if (currentPageUrl === urlCurrentBooking) {
          userName = data["data"]["name"];
          firstSubTitleBookingPage =
            document.getElementsByClassName("firstSubTitle")[0];

          let firstSubTitleBookingPageTag = document.createElement("p");
          firstSubTitleBookingPage.appendChild(firstSubTitleBookingPageTag);
          firstSubTitleBookingPageTag.innerHTML = `您好，${userName}，待預定的行程如下:`;
        }
      }
    })
    .catch((error) => {
      console.log(
        error,
        "Something went wrong when fetching data via API, Check JS function : checkUserStatus()"
      );
    });
}

function deleteUserStatus(urlUser) {
  fetch(urlUser, {
    method: "DELETE",
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (String(Object.keys(data)) === "ok") {
        let navBtnHeader = document.getElementsByClassName("push")[0];
        let btnPushItemsLogOut = document.getElementById("pushItemsLogOut");
        btnPushItemsLogOut.remove();

        let logInAndRegisterButton = document.createElement("button");
        logInAndRegisterButton.id = "pushItems_2";
        logInAndRegisterButton.className = "pushItems_2";
        logInAndRegisterButton.onclick = function () {
          btnPushItems_2();
        };

        let logInTag = document.createElement("p");
        logInTag.id = "logInAndRegister";

        logInAndRegisterButton.appendChild(logInTag);
        navBtnHeader.appendChild(logInAndRegisterButton);
        logInTag.innerHTML = "登入/註冊";

        // checkUserStatus(); //This method is to send a request again instead of refreah page.
        location.reload();
        signInPopup.style.display = "none";
        clearEmailBoxInputForSignIN.value = "";
        clearEmailBoxInputForRegister.value = "";
        clearPasswordBoxInputForSignIN.value = "";
        clearPasswordBoxInputForRegister.value = "";
        clearNameBoxInput.value = "";
      }
    })
    .catch((error) => {
      console.log(
        error,
        "Something went wrong when fetching data via API, Check JS function : deleteUserStatus()"
      );
    });
}

checkUserStatus(urlUser, urlCurrentBooking);

function submitAttractionInfoBox(urlBooking) {
  // Date
  let date = document.getElementById("travelDate").value;
  let time = "";
  if (date === "") {
    dateOptionsForErrorMsgTag = document.getElementsByClassName(
      "dateOptionsForErrorMsg"
    )[0];
    if (dateOptionsForErrorMsgTag) {
      dateOptionsForErrorMsgTag.remove();
    }
    let dateOptions = document.getElementsByClassName("dateOptions")[0];
    let dateOptionsForErrorMsg = document.createElement("label");
    dateOptionsForErrorMsg.className = "dateOptionsForErrorMsg";
    dateOptions.appendChild(dateOptionsForErrorMsg).innerHTML = "日期不得為空";
  } else {
    dateOptionsForErrorMsgTag = document.getElementsByClassName(
      "dateOptionsForErrorMsg"
    )[0];
    if (dateOptionsForErrorMsgTag) {
      dateOptionsForErrorMsgTag.remove();
    }
  }
  // Time
  if (document.getElementById("morning").checked) {
    time = document.getElementById("morning").value;
    timeOptionsForErrorMsgTag = document.getElementsByClassName(
      "timeOptionsContainerForErrorMsg"
    )[0];
    if (timeOptionsForErrorMsgTag) {
      timeOptionsForErrorMsgTag.remove();
    }
  } else if (document.getElementById("afternoon").checked) {
    time = document.getElementById("afternoon").value;
    timeOptionsForErrorMsgTag = document.getElementsByClassName(
      "timeOptionsContainerForErrorMsg"
    )[0];
    if (timeOptionsForErrorMsgTag) {
      timeOptionsForErrorMsgTag.remove();
    }
  } else {
    timeOptionsForErrorMsgTag = document.getElementsByClassName(
      "timeOptionsContainerForErrorMsg"
    )[0];
    if (timeOptionsForErrorMsgTag) {
      timeOptionsForErrorMsgTag.remove();
    }
    let timeOptions = document.getElementsByClassName("timeOptions")[0];
    let timeOptionsContainerForErrorMsg = document.createElement("label");
    timeOptionsContainerForErrorMsg.className =
      "timeOptionsContainerForErrorMsg";
    timeOptions.appendChild(timeOptionsContainerForErrorMsg).innerHTML =
      "請選擇期間";
  }
  if (date !== "" && time !== "") {
    // 這邊應該要用booking POST 的API因為這邊就預定行程了
    attractionUrl = window.location.href;
    // attractionId = attractionUrl.substr(36);
    // testing purpose
    attractionId = attractionUrl.substr(33);

    let price = time.substring(4);
    let timeOfDay;
    if (price === "2000") {
      timeOfDay = "morning";
    } else {
      timeOfDay = "afternoon";
    }

    // This fetch is only for update or insert new data to database.
    fetch(urlBooking, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attractionId: attractionId,
        date: date,
        time: timeOfDay,
        price: price,
      }),
    })
      .then((response) => {
        if (response.status === 403) {
          return response.status;
        } else {
          return response.json();
        }
      })
      .then((data) => {
        if (data === 403) {
          btnPushItems_2();
        } else {
          location.replace(urlCurrentBooking);
          // console.log("here")
        }
      })
      .catch((error) => {
        console.log(
          error,
          "Something went wrong when fetching data via API, Check JS function : submitAttractionInfoBox()"
        );
      });
  }
}

// For 預定行程button
function bookingRecord(urlUser, urlCurrentBooking) {
  fetch(urlUser)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (String(data) === "null") {
        btnPushItems_2();
      } else {
        location.replace(urlCurrentBooking);
      }
    })
    .catch((error) => {
      console.log(
        error,
        "Something went wrong when fetching data via API, Check JS function : bookingRecord()"
      );
    });
}
// The function, membershipPage(urlUser, urlCurrentBooking), is the same logic as bookingRecord, but this function link to membershipt page, if user has logged in already.
function membershipPage(urlUser, urlCurrentBooking) {
  fetch(urlUser)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (String(data) === "null") {
        btnPushItems_2();
      } else {
        location.replace(urlCurrentBooking);
      }
    })
    .catch((error) => {
      console.log(
        error,
        "Something went wrong when fetching data via API, Check JS function : bookingRecord()"
      );
    });
}
