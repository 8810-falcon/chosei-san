// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
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

(function ($) {
  $(document).ready(function () {
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

    //ページ遷移
    $("#input-complete").click(function () {
      const password = $("#password-input").val();
      if (password == null || password == "") {
        window.alert("パスワードを入力してください");
      } else {
        const date = new Date();
        const timeStamp = date.getTime();
        let randomNum = "";
        for (let i = 0; i < 5; i++) {
          randomNum += Math.floor(Math.random() * 9) + 1;
        }
        const queryParam = timeStamp + randomNum;
        console.log(queryParam);
        //ページ遷移時にクエリパラメータとパスワードをdb格納
        setNomikaiData(queryParam, password);
      }
    });
  });
})(jQuery);

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

//飲み会データ登録メソッド
async function setNomikaiData(queryParam, password) {
  await set(ref(database, queryParam), {
    password: password,
  });
  //登録後にページ遷移
  window.location.href = "index.html" + "?id=" + queryParam;
}
