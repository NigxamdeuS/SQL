/**
 * エラー検索辞典 UI
 */
(function () {
  "use strict";

  var input = document.getElementById("errorInput");
  var results = document.getElementById("errorResults");
  var searchBtn = document.getElementById("errorSearch");
  var sampleBtn = document.getElementById("errorSample");
  var clearBtn = document.getElementById("errorClear");

  if (!input || !results || typeof ERROR_DICTIONARY === "undefined") return;

  var SAMPLE = 'column "employee_name" does not exist';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function scoreEntry(query, entry) {
    var q = query.toLowerCase();
    var score = 0;
    var hit = 0;
    entry.patterns.forEach(function (p) {
      if (q.indexOf(p.toLowerCase()) !== -1) {
        hit++;
        score += 10 + p.length;
      }
    });
    if (entry.title && q.indexOf(entry.title.toLowerCase()) !== -1) score += 5;
    if (hit === 0) return 0;
    // 全パターン一致を優遇
    if (hit === entry.patterns.length) score += 20;
    return score;
  }

  function search(query) {
    var q = String(query || "").trim();
    if (!q) {
      results.innerHTML = '<div class="error-empty">エラー文を貼り付けて「検索」を押してください。</div>';
      return;
    }

    var ranked = ERROR_DICTIONARY.map(function (entry) {
      return { entry: entry, score: scoreEntry(q, entry) };
    })
      .filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 5);

    if (!ranked.length) {
      results.innerHTML =
        '<div class="error-empty">一致する登録がありませんでした。キーワードを短く（例: does not exist / syntax error）して再検索してください。</div>';
      return;
    }

    results.innerHTML = ranked.map(function (item) {
      var e = item.entry;
      var causes = e.causes.map(function (c) {
        return "<li>" + escapeHtml(c) + "</li>";
      }).join("");
      return (
        '<article class="error-card">' +
        "<h3>" + escapeHtml(e.title) + "</h3>" +
        '<p class="error-match">マッチ例: ' + escapeHtml(e.matchHint) + "</p>" +
        "<h4>考えられる原因</h4>" +
        "<ul>" + causes + "</ul>" +
        "<h4>確認例</h4>" +
        "<pre>" + escapeHtml(e.checkSql) + "</pre>" +
        "</article>"
      );
    }).join("");
  }

  if (searchBtn) searchBtn.addEventListener("click", function () { search(input.value); });
  if (sampleBtn) {
    sampleBtn.addEventListener("click", function () {
      input.value = SAMPLE;
      search(SAMPLE);
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      input.value = "";
      results.innerHTML = "";
    });
  }

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      search(input.value);
    }
  });
})();
