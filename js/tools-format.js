/**
 * SQL整形ツール（PostgreSQL向け・ルールベース）
 */
(function () {
  "use strict";

  var input = document.getElementById("formatInput");
  var output = document.getElementById("formatOutput");
  var runBtn = document.getElementById("formatRun");
  var sampleBtn = document.getElementById("formatSample");
  var clearBtn = document.getElementById("formatClear");
  var copyBtn = document.getElementById("formatCopy");

  if (!input || !output) return;

  var SAMPLE =
    "select employee_name, salary, case when salary >= 500000 then 'A' when salary >= 350000 then 'B' else 'C' end as salary_rank from employees order by salary desc;";

  var PLACEHOLDER =
    '<span class="insert-placeholder">左側にSQLを貼って「整形する」を押すと、ここに整形結果が表示されます。</span>';

  function stashStrings(sql) {
    var strings = [];
    var out = String(sql).replace(/'([^']|'')*'/g, function (m) {
      strings.push(m);
      return "\u0000S" + (strings.length - 1) + "\u0000";
    });
    return { text: out, strings: strings };
  }

  function restoreStrings(text, strings) {
    return text.replace(/\u0000S(\d+)\u0000/g, function (_, i) {
      return strings[Number(i)];
    });
  }

  function upperKeywords(s) {
    var list = [
      "FULL OUTER JOIN",
      "LEFT OUTER JOIN",
      "RIGHT OUTER JOIN",
      "INNER JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "FULL JOIN",
      "CROSS JOIN",
      "UNION ALL",
      "GROUP BY",
      "ORDER BY",
      "PARTITION BY",
      "INSERT INTO",
      "DELETE FROM",
      "ON CONFLICT",
      "DO UPDATE",
      "DO NOTHING",
      "FILTER",
      "WINDOW",
      "OVER",
      "SELECT",
      "FROM",
      "WHERE",
      "HAVING",
      "LIMIT",
      "OFFSET",
      "UNION",
      "EXCEPT",
      "INTERSECT",
      "JOIN",
      "ON",
      "USING",
      "WITH",
      "AS",
      "ASC",
      "DESC",
      "VALUES",
      "UPDATE",
      "SET",
      "RETURNING",
      "DISTINCT",
      "NULL",
      "NOT",
      "AND",
      "OR",
      "IN",
      "BETWEEN",
      "LIKE",
      "ILIKE",
      "EXISTS",
      "CASE",
      "WHEN",
      "THEN",
      "ELSE",
      "END",
      "IS",
      "TRUE",
      "FALSE",
    ];
    list.forEach(function (kw) {
      var re = new RegExp("\\b" + kw.replace(/ /g, "\\s+") + "\\b", "gi");
      s = s.replace(re, kw);
    });
    return s;
  }

  function readWord(s, from) {
    var m = s.slice(from).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    return m ? m[0] : "";
  }

  /** CASE ... END を整形（ネスト対応） */
  function formatCaseBlocks(s) {
    var result = "";
    var i = 0;

    while (i < s.length) {
      var word = readWord(s, i);
      if (word && word.toUpperCase() === "CASE") {
        var start = i;
        i += word.length;
        var depth = 1;
        while (i < s.length && depth > 0) {
          var w = readWord(s, i);
          if (w) {
            var up = w.toUpperCase();
            if (up === "CASE") depth++;
            else if (up === "END") {
              depth--;
              i += w.length;
              if (depth === 0) break;
              continue;
            }
            i += w.length;
          } else {
            i++;
          }
        }
        result += reshapeCase(s.slice(start, i));
        continue;
      }
      result += s.charAt(i);
      i++;
    }
    return result;
  }

  function reshapeCase(block) {
    var inner = block.replace(/^CASE\b/i, "").replace(/\bEND\b\s*$/i, "").trim();
    inner = inner.replace(/\s+/g, " ");

    var indices = [];
    var re = /\bWHEN\b/gi;
    var m;
    while ((m = re.exec(inner))) indices.push(m.index);

    var elseMatch = inner.match(/\bELSE\b/i);
    var elseIndex = elseMatch ? elseMatch.index : -1;
    var parts = [];
    var elsePart = "";

    for (var n = 0; n < indices.length; n++) {
      var from = indices[n];
      var to =
        n + 1 < indices.length
          ? indices[n + 1]
          : elseIndex >= 0
            ? elseIndex
            : inner.length;
      var chunk = inner.slice(from, to).trim();
      chunk = chunk
        .replace(/\bWHEN\b\s+/i, "WHEN ")
        .replace(/\s+\bTHEN\b\s+/i, " THEN ");
      parts.push(chunk);
    }

    if (elseIndex >= 0) {
      elsePart = inner
        .slice(elseIndex)
        .trim()
        .replace(/\bELSE\b\s+/i, "ELSE ");
    }

    // SELECT 配下で見やすいインデント
    var out = "CASE";
    parts.forEach(function (p) {
      out += "\n        " + p;
    });
    if (elsePart) out += "\n        " + elsePart;
    out += "\n    END";
    return out;
  }

  function stashParens(s) {
    var parts = [];
    var out = "";
    var i = 0;
    while (i < s.length) {
      if (s.charAt(i) === "(") {
        var start = i;
        var depth = 0;
        while (i < s.length) {
          if (s.charAt(i) === "(") depth++;
          else if (s.charAt(i) === ")") {
            depth--;
            if (depth === 0) {
              i++;
              break;
            }
          }
          i++;
        }
        parts.push(s.slice(start, i));
        out += "\u0000P" + (parts.length - 1) + "\u0000";
        continue;
      }
      out += s.charAt(i);
      i++;
    }
    return { text: out, parts: parts };
  }

  function restoreParens(text, parts) {
    // 内側から復元できるように複数回
    var prev;
    do {
      prev = text;
      text = text.replace(/\u0000P(\d+)\u0000/g, function (_, i) {
        return parts[Number(i)];
      });
    } while (text !== prev);
    return text;
  }

  function formatSpecialParens(s) {
    // OVER (...)
    s = s.replace(/\bOVER\s*\(([\s\S]*?)\)/gi, function (_, inner) {
      var t = inner.replace(/\s+/g, " ").trim();
      if (/\bPARTITION\s+BY\b/i.test(t) || /\bORDER\s+BY\b/i.test(t)) {
        t = t.replace(/\bPARTITION\s+BY\b/gi, "\n        PARTITION BY");
        t = t.replace(/\bORDER\s+BY\b/gi, "\n        ORDER BY");
        t = t.replace(/\bROWS\b/gi, "\n        ROWS");
        t = t.replace(/\bRANGE\b/gi, "\n        RANGE");
        return "OVER (" + t + "\n    )";
      }
      return "OVER (" + t + ")";
    });

    // FILTER (WHERE ...)
    s = s.replace(/\bFILTER\s*\(\s*WHERE\s+([\s\S]*?)\)/gi, function (_, inner) {
      var t = inner.replace(/\s+/g, " ").trim();
      t = t.replace(/\s+\bAND\b\s+/gi, "\n        AND ");
      t = t.replace(/\s+\bOR\b\s+/gi, "\n        OR ");
      return "FILTER (\n        WHERE " + t + "\n    )";
    });

    // IN (a, b, c) が長いとき
    s = s.replace(/\bIN\s*\(([\s\S]*?)\)/gi, function (full, inner) {
      var t = inner.replace(/\s+/g, " ").trim();
      if (t.indexOf(",") === -1 || t.length < 48) return "IN (" + t + ")";
      return (
        "IN (\n        " +
        t
          .split(",")
          .map(function (x) {
            return x.trim();
          })
          .join(",\n        ") +
        "\n    )"
      );
    });

    return s;
  }

  function formatSql(sql) {
    var packed = stashStrings(String(sql || "").trim());
    var s = packed.text.replace(/\s+/g, " ").trim();
    if (!s) return "";

    s = upperKeywords(s);
    s = s.replace(/\s*(>=|<=|<>|!=|=|>|<)\s*/g, " $1 ");

    // CASE を先に整形
    s = formatCaseBlocks(s);

    // CASEブロック退避
    var caseBlocks = [];
    s = s.replace(/CASE\n[\s\S]*?\n    END/g, function (m) {
      caseBlocks.push(m);
      return "\u0000C" + (caseBlocks.length - 1) + "\u0000";
    });

    // 括弧退避（カンマ改行が括弧内を壊さないように）
    var parenPack = stashParens(s);
    s = parenPack.text;

    // 主要句の前で改行
    var mains = [
      "WITH",
      "SELECT",
      "FROM",
      "WHERE",
      "GROUP BY",
      "HAVING",
      "WINDOW",
      "ORDER BY",
      "LIMIT",
      "OFFSET",
      "UNION ALL",
      "UNION",
      "EXCEPT",
      "INTERSECT",
      "RETURNING",
      "VALUES",
      "SET",
      "FULL OUTER JOIN",
      "LEFT OUTER JOIN",
      "RIGHT OUTER JOIN",
      "INNER JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "FULL JOIN",
      "CROSS JOIN",
    ];
    mains.forEach(function (kw) {
      var re = new RegExp("\\s+(" + kw.replace(/ /g, "\\s+") + ")\\b", "g");
      s = s.replace(re, "\n" + kw);
    });

    s = s.replace(/\s+\bJOIN\b/g, "\nJOIN");
    s = s.replace(/\s+\bON\b\s+/g, "\n    ON ");
    s = s.replace(/\s+\bAND\b\s+/g, "\n    AND ");
    s = s.replace(/\s+\bOR\b\s+/g, "\n    OR ");
    s = s.replace(/\s+\bUSING\b\s+/g, "\n    USING ");
    s = s.replace(/\s+\bEXISTS\b\s*/g, "\n    EXISTS ");

    // SELECT / DISTINCT
    s = s.replace(/\bSELECT\b\s+/g, "SELECT\n    ");
    s = s.replace(/\bDISTINCT\b\s+/g, "DISTINCT ");
    s = s.replace(/,(?!\n)/g, ",\n    ");

    s = s.replace(/\bWITH\b\s+/g, "WITH\n    ");

    // 括弧復元 → OVER / FILTER / IN 整形
    s = restoreParens(s, parenPack.parts);
    s = formatSpecialParens(s);

    // CASE 復元
    s = s.replace(/\u0000C(\d+)\u0000/g, function (_, i) {
      return caseBlocks[Number(i)];
    });

    // 行末スペース除去
    s = s
      .split("\n")
      .map(function (line) {
        return line.replace(/\s+$/g, "");
      })
      .filter(function (line) {
        return line.trim() !== "";
      })
      .join("\n");

    // FROM / JOIN の簡易 AS
    s = s.replace(
      /\nFROM\s+(\S+)\s+(\w+)(?=\s|\n|$)/,
      function (_, table, alias) {
        if (
          /^(AS|WHERE|INNER|LEFT|RIGHT|FULL|CROSS|JOIN|GROUP|ORDER|LIMIT|OFFSET|UNION|HAVING|WINDOW)$/i.test(
            alias
          )
        ) {
          return "\nFROM " + table + " " + alias;
        }
        return "\nFROM " + table + " AS " + alias;
      }
    );
    s = s.replace(
      /\n((?:INNER|LEFT|RIGHT|FULL OUTER|LEFT OUTER|RIGHT OUTER|FULL|CROSS) JOIN)\s+(\S+)\s+(\w+)(?=\s|\n|$)/,
      function (_, join, table, alias) {
        if (
          /^(AS|ON|USING|WHERE|INNER|LEFT|RIGHT|FULL|CROSS|JOIN|GROUP|ORDER|LIMIT)$/i.test(
            alias
          )
        ) {
          return "\n" + join + " " + table + " " + alias;
        }
        return "\n" + join + " " + table + " AS " + alias;
      }
    );

    s = restoreStrings(s, packed.strings);
    if (!/;\s*$/.test(s)) s += ";";
    return s;
  }

  function highlight(sql) {
    var tokens = [];
    function stash(html) {
      tokens.push(html);
      return "\u0000" + (tokens.length - 1) + "\u0000";
    }
    var text = String(sql);
    text = text.replace(/'([^']|'')*'/g, function (m) {
      return stash(
        '<span class="str">' +
          m.replace(/&/g, "&amp;").replace(/</g, "&lt;") +
          "</span>"
      );
    });
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    text = text.replace(
      /\b(WITH|SELECT|FROM|WHERE|AND|OR|GROUP|BY|HAVING|ORDER|LIMIT|OFFSET|UNION|ALL|EXCEPT|INTERSECT|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|JOIN|ON|USING|INSERT|INTO|VALUES|UPDATE|SET|DELETE|RETURNING|AS|ASC|DESC|DISTINCT|NULL|NOT|IN|BETWEEN|LIKE|ILIKE|EXISTS|CASE|WHEN|THEN|ELSE|END|IS|TRUE|FALSE|OVER|PARTITION|WINDOW|FILTER|ROWS|RANGE)\b/gi,
      function (m) {
        return '<span class="kw">' + m.toUpperCase() + "</span>";
      }
    );
    return text.replace(/\u0000(\d+)\u0000/g, function (_, i) {
      return tokens[Number(i)];
    });
  }

  function render() {
    var sql = formatSql(input.value);
    if (!sql) {
      output.innerHTML = PLACEHOLDER;
      delete output.dataset.raw;
      if (copyBtn) copyBtn.disabled = true;
      return;
    }
    output.innerHTML = highlight(sql);
    output.dataset.raw = sql;
    if (copyBtn) copyBtn.disabled = false;
  }

  function copyText(text, btn) {
    if (!text) return;
    function ok() {
      var prev = btn.textContent;
      btn.textContent = "コピー済み";
      btn.classList.add("is-ok");
      setTimeout(function () {
        btn.textContent = prev;
        btn.classList.remove("is-ok");
      }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(function () {
        window.prompt("コピーしてください", text);
      });
    } else {
      window.prompt("コピーしてください", text);
    }
  }

  if (runBtn) runBtn.addEventListener("click", render);
  if (sampleBtn) {
    sampleBtn.addEventListener("click", function () {
      input.value = SAMPLE;
      render();
      input.focus();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      input.value = "";
      output.innerHTML = PLACEHOLDER;
      delete output.dataset.raw;
      if (copyBtn) copyBtn.disabled = true;
      input.focus();
    });
  }
  if (copyBtn) {
    copyBtn.disabled = true;
    copyBtn.addEventListener("click", function () {
      copyText(output.dataset.raw || "", copyBtn);
    });
  }

  input.addEventListener("paste", function () {
    setTimeout(render, 0);
  });
})();
