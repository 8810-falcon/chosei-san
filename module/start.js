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
        window.location.href = "index.html" + "?id=" + queryParam;
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
