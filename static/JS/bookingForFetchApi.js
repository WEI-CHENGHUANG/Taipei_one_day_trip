// let urlThankYou = "http://13.210.218.205:4000//thankyou?number="
// let urlForBookingSumbit = "http://13.210.218.205:4000//api/orders"
// let urlBookingInBookingJS = "http://13.210.218.205:4000//api/booking";

let fields = {
  number: {
    // css selector
    element: "#card-number",
    placeholder: "**** **** **** ****",
  },
  expirationDate: {
    // DOM object
    element: document.getElementById("card-expiration-date"),
    placeholder: "MM / YY",
  },
  ccv: {
    element: "#card-ccv",
    placeholder: "ccv",
  },
};
TPDirect.card.setup({
  fields: fields,
  styles: {
    // Style all elements
    input: {
      color: "gray",
    },
    // Styling ccv field
    "input.ccv": {
      "font-size": "16px",
    },
    // Styling expiration-date field
    "input.expiration-date": {
      "font-size": "16px",
    },
    // Styling card-number field
    "input.card-number": {
      "font-size": "16px",
    },
    // style focus state
    ":focus": {
      // 'color': 'black'
    },
    // style valid state
    ".valid": {
      color: "green",
    },
    // style invalid state
    ".invalid": {
      color: "red",
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    "@media screen and (max-width: 400px)": {
      input: {
        color: "orange",
      },
    },
  },
});

function createContactMsgTag(tagClassName, newErrorMsgTagClassName) {
  let bookingWholeMidInfoContactNametag =
    document.getElementsByClassName(tagClassName)[0];
  let contactInfoExistErrorMsgTag = document.getElementsByClassName(
    newErrorMsgTagClassName
  )[0];

  if (contactInfoExistErrorMsgTag) {
    contactInfoExistErrorMsgTag.remove();
  }
  let contactInfoTag = document.createElement("label");
  contactInfoTag.className = newErrorMsgTagClassName;
  bookingWholeMidInfoContactNametag.appendChild(contactInfoTag);
  contactInfoTag.innerHTML = "Invalid";
}
function removeErrorMsg(contactErrorMsg) {
  let contactInfoExistErrorMsgTag =
    document.getElementsByClassName(contactErrorMsg)[0];
  if (contactInfoExistErrorMsgTag) {
    contactInfoExistErrorMsgTag.remove();
  }
}

function onSubmit(urlForBookingSumbit) {
  // This is to check the contact info
  let responseMsg = [];
  checkContactNmae = document.getElementsByClassName("contactNameBox")[0].value;
  checkContactEmail =
    document.getElementsByClassName("bookingEmailBox")[0].value;
  checkContactPhone = document.getElementsByClassName("mobileBox")[0].value;

  if (checkContactNmae === "") {
    responseMsg.push("Invalid");
    createContactMsgTag(
      "bookingWholeMidInfoContactName",
      "contactNameErrorMsg"
    );
  } else {
    removeErrorMsg("contactNameErrorMsg");
  }

  if (validateEmail(checkContactEmail) === false) {
    responseMsg.push("Invalid");
    createContactMsgTag("bookingWholeMidInfoeamil", "contactEmailErrorMsg");
  } else {
    removeErrorMsg("contactEmailErrorMsg");
  }

  if (validatePhone(checkContactPhone) === false) {
    responseMsg.push("Invalid");
    createContactMsgTag("bookingWholeMidInfoMobile", "contactPhoneErrorMsg");
  } else {
    removeErrorMsg("contactPhoneErrorMsg");
  }

  if (responseMsg.length > 0) {
    return;
  }

  // // 取得 TapPay Fields 的 status
  const tappayStatus = TPDirect.card.getTappayFieldsStatus();
  // console.log(tappayStatus)
  // 確認是否可以 getPrime
  if (tappayStatus.canGetPrime === false) {
    getInnerBookingWholeBottomInfo = document.getElementsByClassName(
      "innerBookingWholeBottomInfo"
    )[0];
    let creditCardErrorMsgDiv = document.createElement("div");
    let creditCardErrorMsgP = document.createElement("p");
    creditCardErrorMsgDiv.className = "creditCardErrorMsgDiv";
    creditCardErrorMsgP.className = "creditCardErrorMsgP";
    creditCardErrorMsgDiv.append(creditCardErrorMsgP);
    getInnerBookingWholeBottomInfo.appendChild(creditCardErrorMsgDiv);
    creditCardErrorMsgP.innerHTML = "卡片號碼不正確";
    return;
  }

  removeErrorMsg("creditCardErrorMsgDiv");

  // Get prime
  TPDirect.card.getPrime((result) => {
    if (result.status !== 0) {
      // alert('get prime error ' + result.msg)
      getInnerBookingWholeBottomInfo = document.getElementsByClassName(
        "innerBookingWholeBottomInfo"
      )[0];
      let creditCardErrorMsgDiv = document.createElement("div");
      let creditCardErrorMsgP = document.createElement("p");
      creditCardErrorMsgDiv.className = "creditCardErrorMsgDiv";
      creditCardErrorMsgP.className = "creditCardErrorMsgP";
      creditCardErrorMsgDiv.append(creditCardErrorMsgP);
      getInnerBookingWholeBottomInfo.appendChild(creditCardErrorMsgDiv);
      creditCardErrorMsgP.innerHTML = result.msg;
      return;
    }
    removeErrorMsg("creditCardErrorMsgDiv");
    // alert('get prime 成功，prime: ' + result.card.prime)
    let price = document
      .getElementsByClassName("bookingExpenses")[0]
      .getElementsByClassName("two")[0]
      .textContent.substring(4);
    let subtitleName = document.getElementsByClassName(
      "bookingDetailDescription"
    )[0].textContent;
    let attractionId = document.getElementsByTagName("img")[0].alt;
    let attractionImg = document.getElementsByTagName("img")[0].src;
    let attractionAddress = document
      .getElementsByClassName("bookingLocation")[0]
      .getElementsByClassName("two")[0].textContent;
    let travelDate = document
      .getElementsByClassName("bookingDate")[0]
      .getElementsByClassName("two")[0]
      .textContent.substring(5);
    let travelTime = document
      .getElementsByClassName("bookingTime")[0]
      .getElementsByClassName("two")[0].textContent;
    let contactName =
      document.getElementsByClassName("contactNameBox")[0].value;
    let contactEmail =
      document.getElementsByClassName("bookingEmailBox")[0].value;
    let contactPhone = document.getElementsByClassName("mobileBox")[0].value;
    console.log(result.card.prime);
    fetch(urlForBookingSumbit, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prime: result.card.prime,
        order: {
          price: price,
          trip: {
            attraction: {
              id: attractionId,
              name: subtitleName,
              address: attractionAddress,
              image: attractionImg,
            },
            date: travelDate,
            time: travelTime,
          },
          contact: {
            name: contactName,
            email: contactEmail,
            phone: contactPhone,
          },
        },
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data["data"]["status"] === 1) {
          // Here should send an API to delete the booking info in database.
          let fullUrl = urlThankYou + data["data"]["number"];
          location.replace(fullUrl);
        } else {
          // here should send the failed info into front page to customer.
          let fullUrl = urlThankYou + data["data"]["number"];
          location.replace(fullUrl);
        }
      })
      .catch((error) => {
        if (error.status === 403) {
          removeErrorMsg("creditCardErrorMsgDiv");
          getInnerBookingWholeBottomInfo = document.getElementsByClassName(
            "innerBookingWholeBottomInfo"
          )[0];
          let creditCardErrorMsgDiv = document.createElement("div");
          let creditCardErrorMsgP = document.createElement("p");
          creditCardErrorMsgDiv.className = "creditCardErrorMsgDiv";
          creditCardErrorMsgP.className = "creditCardErrorMsgP";
          creditCardErrorMsgDiv.append(creditCardErrorMsgP);
          getInnerBookingWholeBottomInfo.appendChild(creditCardErrorMsgDiv);
          creditCardErrorMsgP.innerHTML = "這個行程您已預訂";
        } else {
          console.log(error);
        }
      });
  });
}

// =================================================================================
// 1. check the user log-in status.
// 這個是為了當使用者直接type URL to booking page
// 或是當使用者以登入 並再點選 預定行程按鈕準備前往booking page時 會在頁面再次做檢查

function checkunconfirmOrder(urlBookingInBookingJS) {
  fetch(urlBookingInBookingJS)
    .then((response) => {
      if (response.status === 403) {
        return response.status;
      } else {
        return response.json();
      }
    })
    .then((data) => {
      console.log(data);
      if (data === 403) {
        // This condition means that users hasn't logged in.
        // console.log("I am in step one")
        // // get the exist tag first
        mainBodyFromBookingPage = document.getElementById(
          "forInsertingPurpose"
        );
        newFooter = document.getElementById("forNewFooter");

        // // Now, creating a new page to reminder user they haven't logged in yet.
        let askLoginInfo = document.createElement("div");
        askLoginInfo.className = "newWholeMainBody";
        let askLoginInfoTag = document.createElement("p");
        askLoginInfoTag.className = "askLoginContent";
        askLoginInfo.appendChild(askLoginInfoTag);
        mainBodyFromBookingPage.appendChild(askLoginInfo);
        askLoginInfoTag.innerHTML =
          "Hi there, You have not logged in. " +
          "<br />" +
          "<br />" +
          "Please, click on the top right log-in button.";
        // The default CSS display has been setting as none, so I have to change it after creating this tag.
        askLoginInfo.style.display = "flex";
        // Old Footer
        footerBox = document.getElementsByClassName("footerBox")[0];
        footerBox.style.display = "none";
        // New Footer
        newFooterForAskLoginInfo = document.getElementsByClassName(
          "newFooterForAskLoginInfo"
        )[0];
        newFooterForAskLoginInfo.style.display = "flex";
      } else if (
        data === null ||
        data === "you havn't had any booking attractions yet."
      ) {
        // console.log("I am in step two")
        // // 已登入 沒有預定資訊
        wholeMainBodyFromBookingPage =
          document.getElementsByClassName("wholeMainBody")[0];
        wholeMainBodyFromBookingPage.style.display = "flex";

        bookingWholeTopInfo = document.getElementsByClassName(
          "bookingWholeTopInfo"
        )[0];
        bookingWholeTopInfo.style.display = "none";
        bookingWholeMidInfo = document.getElementsByClassName(
          "bookingWholeMidInfo"
        )[0];
        bookingWholeMidInfo.style.display = "none";
        bookingWholeBottomInfo = document.getElementsByClassName(
          "bookingWholeBottomInfo"
        )[0];
        bookingWholeBottomInfo.style.display = "none";
        submitButtonForPayment = document.getElementsByClassName(
          "submitButtonForPayment"
        )[0];
        submitButtonForPayment.style.display = "none";

        firstSubTitle = document.getElementsByClassName("firstSubTitle")[0];
        let newFooterForBookingPage = document.createElement("p");
        newFooterForBookingPage.className = "remiderInfo";
        firstSubTitle.appendChild(newFooterForBookingPage);
        newFooterForBookingPage.innerHTML =
          "<br />" + "目前沒有任何待預訂的行程";

        // Old Footer
        footerBox = document.getElementsByClassName("footerBox")[0];
        footerBox.style.display = "none";
        // New Footer
        newFooterForAskLoginInfo = document.getElementsByClassName(
          "newFooterForAskLoginInfo"
        )[0];
        newFooterForAskLoginInfo.style.display = "flex";
      } else {
        // 有預定資訊 並顯示出來
        wholeMainBodyFromBookingPage =
          document.getElementsByClassName("wholeMainBody")[0];
        wholeMainBodyFromBookingPage.style.display = "flex";
        // the code below is to fill in the attraction info.
        // 台北一日遊content
        bookingDetailsTitle = document.getElementsByClassName(
          "bookingDetailsTitle"
        )[0];
        let bookingDetailDescription = document.createElement("label");
        bookingDetailDescription.className = "bookingDetailDescription";
        bookingDetailsTitle.appendChild(bookingDetailDescription);
        bookingDetailDescription.innerHTML = data["data"]["attraction"]["name"];
        // Picture bookingAttractionPic
        bookingAttractionPic = document.getElementsByClassName(
          "bookingAttractionPic"
        )[0];
        let bookingPicture = document.createElement("img");
        bookingPicture.src = data["data"]["attraction"]["image"][0];
        bookingPicture.alt = data["data"]["attraction"]["id"];
        bookingAttractionPic.appendChild(bookingPicture);
        // Date
        bookingDate = document.getElementsByClassName("bookingDate")[0];
        let bookingDateTag = document.createElement("label");
        bookingDateTag.className = "two";
        bookingDate.appendChild(bookingDateTag);
        bookingDateTag.innerHTML = data["data"]["date"].substr(0, 17);
        // Time
        bookingTime = document.getElementsByClassName("bookingTime")[0];
        let bookingTimeTag = document.createElement("label");
        bookingTimeTag.className = "two";
        bookingTime.appendChild(bookingTimeTag);
        bookingTimeTag.innerHTML = data["data"]["time"];
        // Expense
        bookingExpenses = document.getElementsByClassName("bookingExpenses")[0];
        let bookingExpensesTag = document.createElement("label");
        bookingExpensesTag.className = "two";
        bookingExpenses.appendChild(bookingExpensesTag);
        let dollarUSLocale = Intl.NumberFormat("en-US");

        bookingExpensesTag.innerHTML =
          "新台幣 " + dollarUSLocale.format(data["data"]["price"]);
        // Location
        bookingLocation = document.getElementsByClassName("bookingLocation")[0];
        let bookingLocationTag = document.createElement("label");
        bookingLocationTag.className = "two";
        bookingLocation.appendChild(bookingLocationTag);
        bookingLocationTag.innerHTML = data["data"]["attraction"]["address"];
        // total amout of payment
        totalAmountPayment =
          document.getElementsByClassName("totalAmountPayment")[0];
        let totalAmountPaymentTag = document.createElement("label");
        totalAmountPayment.appendChild(totalAmountPaymentTag);
        totalAmountPaymentTag.innerHTML =
          "總價：新台幣" + dollarUSLocale.format(data["data"]["price"]) + "元";

        // The default of old Footer style is flex.
        // New Footer
        newFooterForAskLoginInfo = document.getElementsByClassName(
          "newFooterForAskLoginInfo"
        )[0];
        newFooterForAskLoginInfo.style.display = "none";
      }
    })
    .catch((error) => {
      console.log(
        error,
        "Something went wrong when fetching data via API, Check JS function :checkunconfirmOrder"
      );
    });
}
checkunconfirmOrder(urlBookingInBookingJS);

function deleteBookedAttraction(urlBookingInBookingJS) {
  fetch(urlBookingInBookingJS, {
    method: "DELETE",
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // console.log(data)
      checkunconfirmOrder(urlBookingInBookingJS);
    });
}
