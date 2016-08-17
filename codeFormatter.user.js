// ==UserScript==
// @name         codeFormatter
// @homepage     http://kmiasko.github.io/
// @version      0.0.2
// @description  codeFormatter - umożliwia zachowanie spacji w kodzie oraz koloruje składnię JS na wykop.pl
// @author       kmiasko
// @match        http://www.wykop.pl/*
// @grant        none
// @require      https://cdn.rawgit.com/kmiasko/highlight.js/master/build/highlight.pack.js
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  // add hilight.js style to head
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

  // submit button
  var button = document.querySelector('fieldset.buttons .submit[tabindex="2"]');

  // get whole code
  var contentRegex = /(?:```)([\s\S]*?)(?:```)/g;

  // strip wykop code tags
  var codeRegex = /(?:<code>)(.*)(?:<\/code>)/g;

  // &;nbsp
  var space = '\u00A0';


  if (button) {
    button.addEventListener('click', setTextarea);
  }

  // convert text from textarea to wykop `code`
  // and sub it
  function setTextarea(e) {
    e.preventDefault();
    var textarea = document.querySelector('.arrow_box textarea');
    var fullText = textarea.value;
    var code = formatSend(fullText);
    textarea.value = code;
  }

  function format(match, code) {
    // replace space with unicode &;nbsp
    var ret = code.split('\n').map(function(line) {
      if (line.length > 0) {
        line = line.replace(/ /g, space);
        line = '`' + line + '`';
        return line;
      }
    }).join('\n');

    // add codeFormatter "tag"
    return ('\\`\\`\\`' + ret + '\\`\\`\\`');
  }

  function formatSend(code) {
    return code.replace(contentRegex, format);
  }

  function getCode(html) {
    var trashHTML = html.match(contentRegex);
    var properHTML = trashHTML.map(function(h) {

      // clean <code>
      var clean = h.replace(codeRegex, function(match, line) {
        return line;
      });

      // remove ``` from the beginning and the end
      var tmp = clean.slice(3, clean.length - 3);

      // change <br> to ::break::
      var textWithBreaks = tmp.replace(/<br>/g, '#-#-#');

      // format withi higlight.js
      var formattedTextWithBreaks = hljs.highlightAuto(htmlDecode(textWithBreaks)).value;

      // get back to <br>
      return formattedTextWithBreaks.replace(/#-#-#/g, '<br>');
    });
    return properHTML;
  }

  // clean escaped html entities added by wykop
  function htmlDecode(input){
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.textContent;
  }

  // main formatting func
  function formatComments() {

    // get all comments
    var comments = document.querySelectorAll('[class^="wblock lcontrast dC"]');
    comments.forEach(function(comment) {
      // comment contents
      var commentText = comment.querySelector('.text');
      // do the magic
      var formattedComment = commentText.innerHTML.replace(contentRegex, function(match, code) { return getCode(match); });
      // put comment with formatted code
      commentText.innerHTML = formattedComment;
    });
  }

  function ob() {
    if (document.querySelector('.pager')) return;

    // initial format after document load
    formatComments();

    // comment list (ul)
    var target = document.querySelector('[class^="entry iC single replyOn"] .sub');

    // observer reacting to comment list change
    // formating new comments on change and on comment post
    // FIX - edit comment
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var observer = new MutationObserver(function(mutations) {
      formatComments();
    });
    var config = { childList: true, characterData: true };
    observer.observe(target, config);
  }

  ob();
})();