// ==UserScript==
// @name         codeFormatter
// @homepage     http://kmiasko.github.io/
// @version      0.0.1
// @description  codeFormatter - umożliwia zachowanie spacji w kodzie
// @author       kmiasko
// @match        http://www.wykop.pl/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  var textarea = document.querySelector('.arrow_box textarea');
  var button = document.querySelector('fieldset.buttons .submit[tabindex="2"]');
  var form = document.querySelector('form.reply');
  var contentRegex = /(?:```)([\s\S]*?)(?:```)/g;
  var space = '\u00A0';

  button.addEventListener('click', setTextarea);

  function setTextarea(e) {
    e.preventDefault();
    var fullText = textarea.value;
    var code = formatSend(fullText);
    textarea.value = code;
    button.click();
  }

  function format(match, code) {
    return code.split('\n').map(function(line) {
      if (line.length > 0) {
        line = line.replace(/ /g, space);
        line = '`' + line + '`';
        return line;
      }
    }).join('\n');
  }

  function formatSend(code) {
    return code.replace(contentRegex, format);
  }
})();
