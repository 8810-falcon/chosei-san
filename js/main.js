// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.8.2/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFm9XqOojiZcViSu-rC7r1M8v7PF6qP0E",
  authDomain: "nomikai-36234.firebaseapp.com",
  databaseURL: "https://nomikai-36234-default-rtdb.firebaseio.com",
  projectId: "nomikai-36234",
  storageBucket: "nomikai-36234.appspot.com",
  messagingSenderId: "1063040288133",
  appId: "1:1063040288133:web:909e5a99a3c175694830ec",
  measurementId: "G-NRV1BMMGEG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

//グローバル変数クエリパラメータ
let queryParam = location.search.replaceAll("?id=", "");

(function ($) {
  $(document).ready(function () {
    console.log(queryParam);
    //クエリパラメータが存在しない場合、初期画面に飛ばす
    if (queryParam.length == 0) {
      window.location.href = "start.html";
    }
    //デバイス判定
    if (!isSmartPhone()) {
      $("body").children().remove();
      const message = `
        <div class="ban-message">
            <h1 class="main-message">
                「調整ちゃん」はスマートフォン専用サイトです。
            </h1>
            <h3 class="detail-message">
                スマートフォンをご利用ください。
            </h3>
        </div>
        `;
      $("body").append(message);
    }

    let nameList = window.sessionStorage.getItem(["nameList"]);
    dispMemeber();

    //開発用にセッション削除
    $("#pay-mgr").on("click", function () {
      window.sessionStorage.clear();
      console.log("セッション削除");
    });

    //名前の入力&リスト追加
    $("#member-name-add").on("click", function () {
      const memberName = $("#member-name-input").val();
      if (memberName == null || memberName == "") {
        window.alert("追加する名前を入力してください");
        return;
      }
      if (findDuplicatedName(memberName)) {
        window.alert("出席者の名前が重複しています");
        return;
      }
      let sessionNameList = window.sessionStorage.getItem(["nameList"]);
      if (sessionNameList == null) {
        window.sessionStorage.setItem(
          ["nameList"],
          [JSON.stringify(memberName)]
        );
      } else {
        sessionNameList = sessionNameList
          .replaceAll('"', "")
          .replaceAll("[", "")
          .replaceAll("]", "");
        sessionNameList += "," + memberName;
        window.sessionStorage.setItem(
          ["nameList"],
          [JSON.stringify(sessionNameList)]
        );
      }
      //dispAddedMember();
      changeMemberData();
      dispMemeber();
      //input欄の削除
      $("#member-name-input").val("");
    });
    //追加された名前の削除
    $(document).on("click", ".delete-added-member", function () {
      const targetId = $(this).attr("id");
      $(`#${targetId}`).parent().remove();
      const targetIdNum = targetId.replaceAll("delete-added-member-", "");
      const deleteName = $(this).prev().text();
      deleteFromSession(deleteName);
      changeMemberData();
      dispMemeber();
    });
    //人数の割り出し
    $("#make-group").on("click", function () {
      if (
        $("#member-amount-input").val() == null ||
        $("#member-amount-input").val() == ""
      ) {
        window.alert("人数を入力してください");
        return;
      }
      if ($("#member-amount-input").val() < 2) {
        window.alert("2人以上で入力してください");
        return;
      }
      if (window.sessionStorage.getItem(["nameList"]) == null) {
        window.alert("出席者を入力してください");
        return;
      }
      const amount = $("#member-amount-input").val();
      makeGroup(amount);
    });
  });
})(jQuery);

//重複した名前のチェック
function findDuplicatedName(name) {
  let isDuplicated = false;
  const sessionNameList = window.sessionStorage.getItem(["nameList"]);
  if (sessionNameList == null) {
    return false;
  }
  const nameList = sessionNameList
    .replaceAll('"', "")
    .replaceAll("[", "")
    .replaceAll("]", "")
    .split(",");
  for (let i = 0; i < nameList.length; i++) {
    if (nameList[i] == name) {
      isDuplicated = true;
    }
  }
  return isDuplicated;
}

//追加したメンバーの制御用メソッド
function dispAddedMember() {
  //既存リストを削除
  $("#added-member-list").children().remove();
  //inputされた名前の追加表示
  if (window.sessionStorage.getItem(["nameList"]) == null) {
    return;
  }
  const dispList = window.sessionStorage
    .getItem(["nameList"])
    .replaceAll('"', "")
    .replaceAll("[", "")
    .replaceAll("]", "")
    .split(",");
  $("#current-member-amount").text(dispList.length);
  for (let i = 0; i < dispList.length; i++) {
    const listElem = `
            <li class="d-flex justify-content-between added-name-list">
                <div class="added-name" id="added-name-${i}">${dispList[i]}</div>
                <button type="button" class="delete-added-member" id="delete-added-member-${i}">削除</button>
            </li>
        `;
    $("#added-member-list").append(listElem);
  }
}

async function dispMemeber() {
  //既存リストを削除
  $("#added-member-list").children().remove();
  const nameList = await onValue(
    ref(database, queryParam + "/member"),
    (snapshot) => {
      if (snapshot.val() == null) {
        return;
      }
      const nameList = Object.values(snapshot.val()["memberList"]);
      console.log("nameList:" + nameList);
      $("#current-member-amount").text(nameList.length);
      for (let i = 0; i < nameList.length; i++) {
        const listElem = `
            <li class="d-flex justify-content-between added-name-list">
                <div class="added-name" id="added-name-${i}">${nameList[i]}</div>
                <button type="button" class="delete-added-member" id="delete-added-member-${i}">削除</button>
            </li>
        `;
        $("#added-member-list").append(listElem);
      }
    }
  );
}

//追加したメンバーの削除&制御用メソッド
function deleteFromSession(name) {
  const sessionNameList = window.sessionStorage.getItem(["nameList"]);
  console.log("sessionNameList:" + sessionNameList.length);
  const fixedNameList = sessionNameList
    .replaceAll('"', "")
    .replaceAll("[", "")
    .replaceAll("]", "")
    .split(",")
    .filter(function (item) {
      return item !== name;
    });
  if (fixedNameList == null || fixedNameList == "") {
    window.sessionStorage.clear();
    $("#current-member-amount").text("0");
    console.log("残りメンバー0");
  } else {
    console.log("残りメンバーが存在");
    if (fixedNameList == "") {
      window.sessionStorage.clear();
    } else {
      window.sessionStorage.setItem(
        ["nameList"],
        [JSON.stringify(fixedNameList)]
      );
    }
  }
}

//人数の割り出し制御
function makeGroup(amount) {
  //既存のグループ分けが存在する場合の分岐
  if ($(".group-wrapper").length) {
    const result = window.confirm(
      "既存のグループ分けは削除されますがよろしいですか？"
    );
    if (result == false) {
      return;
    }
  }
  $(".group-wrapper").remove();
  const sessionNameList = window.sessionStorage
    .getItem(["nameList"])
    .replaceAll("[", "")
    .replaceAll("]", "")
    .replaceAll('"', "")
    .split(",");
  const randomNameList = arrayShuffle(sessionNameList);
  let cursor = 0;
  let count = 0;
  if (count == 0) {
    const groupWrapper = `<div class="group-wrapper"></div>`;
    $(".seat-confirm-wrapper").after(groupWrapper);
  }
  while (cursor < randomNameList.length) {
    count++;
    const parentUl = `
    <div class="group-topic" id="group-topic-${count}">
        グループ${count}
    </div>
    <ul class="list-group list-group-flush random-name-list" id="parentUl-${count}"></ul>
    `;
    if (count == 1) {
      $(".group-wrapper").append(parentUl);
    } else {
      $(`#parentUl-${count - 1}`).after(parentUl);
    }
    for (let i = 0; i < amount; i++) {
      if (cursor < randomNameList.length) {
        const childLi = `
                <li class="list-group-item">
                    ${randomNameList[cursor]}
                </li>
                `;
        $(`#parentUl-${count}`).append(childLi);
        cursor++;
      }
    }
  }
}

//シャッフルロジック
function arrayShuffle(array) {
  for (var i = array.length - 1; 0 < i; i--) {
    var r = Math.floor(Math.random() * (i + 1));
    var tmp = array[i];
    array[i] = array[r];
    array[r] = tmp;
  }
  return array;
}

//スマホかどうかのデバイス判定
function isSmartPhone() {
  if (
    window.matchMedia &&
    window.matchMedia("(max-device-width: 640px)").matches
  ) {
    return true;
  } else {
    return false;
  }
}

//DBに参加者名を追加
async function changeMemberData() {
  let sessionNameList = window.sessionStorage.getItem(["nameList"]);
  console.log("sessionNameList:" + sessionNameList);
  if (sessionNameList == null || sessionNameList == "") {
    const nameList = [];
    await set(ref(database, queryParam + "/member"), {
      memberList: nameList,
    });
  } else {
    const nameList = sessionNameList
      .replaceAll(null, "")
      .replaceAll('"', "")
      .replaceAll("[", "")
      .replaceAll("]", "")
      .split(",");
    console.log(nameList);
    await set(ref(database, queryParam + "/member"), {
      memberList: nameList,
    });
  }
}
