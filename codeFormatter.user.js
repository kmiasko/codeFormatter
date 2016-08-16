// ==UserScript==
// @name         codeFormatter
// @homepage     http://kmiasko.github.io/
// @version      0.0.1
// @description  codeFormatter - umożliwia zachowanie spacji w kodzie
// @author       kmiasko
// @match        http://www.wykop.pl/*
// @grant        none
// @require      https://cdn.rawgit.com/kmiasko/highlight.js/master/build/highlight.pack.js
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  function injectCSS() {
    var head = document.querySelector('head');
    var link = document.createElement('link');
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.6.0/styles/default.min.css";
    link.type = "text/css";
    head.appendChild(link);
  }

  injectCSS();
  hljs.initHighlightingOnLoad();

  var button = document.querySelector('fieldset.buttons .submit[tabindex="2"]');
  var contentRegex = /(?:```)([\s\S]*?)(?:```)/g;
  var codeRegex = /(?:<code>)(.*)(?:<\/code>)/g;
  var space = '\u00A0';


  if (button) {
    button.addEventListener('click', setTextarea);
  }

  function setTextarea(e) {
    var textarea = document.querySelector('.arrow_box textarea');
    e.preventDefault();
    var fullText = textarea.value;
    var code = formatSend(fullText);
    textarea.value = code;
  }

  function format(match, code) {
    var ret = code.split('\n').map(function(line) {
      if (line.length > 0) {
        line = line.replace(/ /g, space);
        line = '`' + line + '`';
        return line;
      }
    }).join('\n');
    return ('\\`\\`\\`' + ret + '\\`\\`\\`');
  }

  function formatSend(code) {
    var t = code.replace(contentRegex, format);
    return t;
  }

  function getCode(html) {
    var trashHTML = html.match(contentRegex);
    var properHTML = trashHTML.map(function(h) {
      var tmp1 = h.replace(codeRegex, function(match, line) {
        return line;
      });

      // remove ``` from the beginning and the end

      var tmp2 = tmp1.slice(3);
      var tmp3 = tmp2.slice(0, tmp2.length - 3);

      // change <br> to ::break::
      var textWithBreaks = tmp3.replace(/<br>/g, '#-#-#');

      // format withi higlight.js
      var formattedTextWithBreaks = hljs.highlightAuto(htmlDecode(textWithBreaks)).value;

      // get back to <br>
      return formattedTextWithBreaks.replace(/#-#-#/g, '<br>');
    });
    return properHTML;
  }

  function htmlDecode(input){
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.textContent;
  }

  function formatComments() {
    var comments = document.querySelectorAll('[class^="wblock lcontrast dC"]');
    comments.forEach(function(comment) {
      var commentText = comment.querySelector('.text');
      var formattedComment = commentText.innerHTML.replace(contentRegex, function(match, code) { return getCode(match); });
      commentText.innerHTML = formattedComment;
    });
  }

  function ob() {
    if (document.querySelector('.pager')) return;

    formatComments();

    var target = document.querySelector('[class^="entry iC single replyOn"] .sub');
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var observer = new MutationObserver(function(mutations) {
      console.log(mutations);
      formatComments();
    });
    var config = { childList: true, characterData: true };

    observer.observe(target, config);
  }

  ob();
})();