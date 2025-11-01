"use strict";document.addEventListener("DOMContentLoaded",function(){
// ▼次の行を書き換えてください。▼
var a=location.origin+"https://adaptation-platform.nies.go.jp/template-parts/";
// ▲上の行を書き換えてください。 ▲
//const basePath = location.origin + "/aplat_internal/html/template-parts-internal/";
//console.log(location.origin);
// header.html を読みこむ
// footer.html を読みこむ
fetch(a+"header.html").then(function(a){return a.text()}).then(function(a){document.querySelector(".app-header").innerHTML=a}),fetch(a+"footer.html").then(function(a){return a.text()}).then(function(a){// document.body.insertAdjacentHTML("beforeend", data);
document.querySelector(".app-footer").innerHTML=a}),fetch(a+"menu.html").then(function(a){return a.text()}).then(function(a){document.querySelector(".app-sidebar").innerHTML=a}),fetch(a+"top-button.html").then(function(a){return a.text()}).then(function(a){document.querySelector(".app-footer").insertAdjacentHTML("beforebegin",a)})});//# sourceMappingURL=../../_cache/_maps/main.js.map

$(function(){
  // 画像を含む外部リンクのアイコンを削除
  $("a:has(img)").addClass("remove-icon");
});


//--------------------------------
//「NEW」マーク出力処理
//--------------------------------
(function() {

  // 設定
  const newPeriod = 14;        // NEWを表示する期間（日数）
  const newClassName = 'new'; // NEWマークのクラス名
  const newText = 'NEW';      // 表示するテキスト

  const today = new Date();
  today.setHours(0,0,0,0);

  document.querySelectorAll('[datetime]').forEach(el => {
    const dateStr = el.getAttribute('datetime');
    if (!dateStr) return;

    const targetDate = new Date(dateStr);
    if (isNaN(targetDate)) return;
    targetDate.setHours(0,0,0,0);

    const diffDays = (today - targetDate) / (1000 * 60 * 60 * 24);
    if (diffDays >= 0 && diffDays < newPeriod) {
      const newMark = document.createElement('span');
      newMark.className = newClassName;
      newMark.textContent = newText;

      const display = window.getComputedStyle(el).display;

      if (display === 'block' || display === 'inline-block' || display === 'list-item') {
        el.insertAdjacentElement('beforeend', newMark);
      } else {
        el.insertAdjacentElement('afterend', newMark);
      }
    }
  });
})();

document.addEventListener("DOMContentLoaded", function() {
    const fadeElements = document.querySelectorAll('.scroll-fade-in');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // 一度表示されたら監視をやめる
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.2 // 画像の20%が見えたら発火
    });

    fadeElements.forEach(element => {
        observer.observe(element);
    });
});