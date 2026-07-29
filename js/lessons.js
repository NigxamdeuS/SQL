/**
 * PostgreSQL SQL講義データ
 * -----------------------------------------------
 * 講義を追加するときは、この配列の末尾にオブジェクトを追加するだけです。
 *
 * category の種類:
 *   basic     … 基本操作
 *   join      … 結合
 *   aggregate … 集計
 *   pg        … PostgreSQL特有の構文
 *   types     … データ型
 *   functions … 関数・演算子
 *   advanced  … 高度なクエリ
 *   ddl       … テーブル定義
 *   admin     … トランザクション・管理
 */

const CATEGORY_LABELS = {
  basic: "基本操作",
  join: "結合",
  aggregate: "集計",
  pg: "PostgreSQL特有",
  types: "データ型",
  functions: "関数・演算子",
  advanced: "高度なクエリ",
  ddl: "テーブル定義",
  admin: "トランザクション・管理",
};

const lessons = [
  /* ========== 基本操作 ========== */
  {
    id: "lesson1",
    number: 1,
    category: "basic",
    title: "SELECT",
    sections: [
      {
        heading: "SELECTとは？",
        description:
          "<code>SELECT</code> は、テーブルからデータを取得するために使います。PostgreSQLでも最も基本となる文です。",
        code: "SELECT *\nFROM employees;",
        meaning: [
          "employeesテーブルから",
          "すべての列のデータを取得する",
        ],
      },
    ],
  },
  {
    id: "lesson2",
    number: 2,
    category: "basic",
    title: "WHERE",
    sections: [
      {
        heading: "WHEREとは？",
        description:
          "<code>WHERE</code> は、条件に一致するデータだけを取得するために使います。",
        code: "SELECT *\nFROM employees\nWHERE salary >= 300000;",
        meaning: "給料が300000円以上の社員だけ取得する",
      },
    ],
  },
  {
    id: "lesson3",
    number: 3,
    category: "basic",
    title: "比較演算子",
    sections: [
      {
        heading: "比較演算子とは？",
        description:
          "比較演算子は、列の値と指定した値を比較するときに使います。",
        extraHtml: `<ul>
  <li><code>=</code>：等しい</li>
  <li><code>&lt;&gt;</code> または <code>!=</code>：等しくない</li>
  <li><code>&gt;</code>：より大きい</li>
  <li><code>&gt;=</code>：以上</li>
  <li><code>&lt;</code>：より小さい</li>
  <li><code>&lt;=</code>：以下</li>
</ul>`,
        code: "SELECT *\nFROM employees\nWHERE salary > 300000;",
        meaning: "給料が300000円より高い社員を取得する",
        point:
          "PostgreSQLでは <code>!=</code> も <code>&lt;&gt;</code> も使えます。",
      },
    ],
  },
  {
    id: "lesson4",
    number: 4,
    category: "basic",
    title: "AND・OR",
    sections: [
      {
        heading: "ANDとは？",
        description:
          "<code>AND</code> は、複数の条件をすべて満たすデータを取得するときに使います。",
        code: "SELECT *\nFROM employees\nWHERE department = '営業'\n  AND salary >= 300000;",
        meaning: ["部署が営業", "給料が300000円以上"],
        meaningOutro: "の両方を満たす社員を取得します。",
      },
      {
        heading: "ORとは？",
        description:
          "<code>OR</code> は、複数の条件のうち、どれかを満たすデータを取得します。",
        code: "SELECT *\nFROM employees\nWHERE department = '営業'\n   OR department = '開発';",
        meaning: ["部署が営業", "または部署が開発"],
        meaningOutro: "のいずれかを満たす社員を取得します。",
      },
    ],
  },
  {
    id: "lesson5",
    number: 5,
    category: "basic",
    title: "IN",
    sections: [
      {
        heading: "INとは？",
        description:
          "<code>IN</code> は、複数の値の中に一致するものがあるかを調べるために使います。",
        code: "SELECT *\nFROM employees\nWHERE department\nIN ('営業', '開発', '総務');",
        meaning: "営業、開発、総務のいずれかに所属する社員を取得する",
      },
    ],
  },
  {
    id: "lesson6",
    number: 6,
    category: "basic",
    title: "BETWEEN",
    sections: [
      {
        heading: "BETWEENとは？",
        description:
          "<code>BETWEEN</code> は、指定した範囲内のデータを取得するために使います。",
        code: "SELECT *\nFROM employees\nWHERE salary\nBETWEEN 300000 AND 400000;",
        meaning: "給料が300000円以上400000円以下の社員を取得する",
        point: "<code>BETWEEN</code> は両端の値を含みます（以上・以下）。",
      },
    ],
  },
  {
    id: "lesson7",
    number: 7,
    category: "basic",
    title: "LIKE・ILIKE",
    badge: "PG",
    sections: [
      {
        heading: "LIKEとは？",
        description:
          "<code>LIKE</code> は、文字列の一部を使って検索するために使います。<code>%</code> は任意の文字列、<code>_</code> は任意の1文字を表します。",
        code: "SELECT *\nFROM employees\nWHERE employee_name LIKE '田%';",
        meaning: "「田」から始まる社員名を取得する",
      },
      {
        heading: "ILIKEとは？（PostgreSQL専用）",
        description:
          "<code>ILIKE</code> は PostgreSQL 独自の演算子です。<code>LIKE</code> と同様のパターン検索を、大文字・小文字を区別せずに行います。MySQL や SQL Server にはありません。",
        code: "SELECT *\nFROM employees\nWHERE email ILIKE '%@gmail.com';",
        meaning:
          "メールアドレスが @gmail.com で終わる社員を、大文字小文字を気にせず取得する",
        point:
          "標準SQLの <code>LIKE</code> は大文字小文字を区別します（ロケールによる）。区別したくないときは PostgreSQL では <code>ILIKE</code> が便利です。",
      },
    ],
  },
  {
    id: "lesson8",
    number: 8,
    category: "basic",
    title: "IS NULL・IS NOT NULL",
    sections: [
      {
        heading: "IS NULLとは？",
        description:
          "<code>IS NULL</code> は、値が登録されていない（NULLの）データを取得するときに使います。<code>= NULL</code> では判定できません。",
        code: "SELECT *\nFROM employees\nWHERE department_id IS NULL;",
        meaning: "部署が登録されていない社員を取得する",
      },
      {
        heading: "IS NOT NULLとは？",
        description:
          "<code>IS NOT NULL</code> は、値が登録されているデータを取得するときに使います。",
        code: "SELECT *\nFROM employees\nWHERE department_id IS NOT NULL;",
        meaning: "部署が登録されている社員を取得する",
      },
    ],
  },
  {
    id: "lesson9",
    number: 9,
    category: "basic",
    title: "ORDER BY",
    sections: [
      {
        heading: "ORDER BYとは？",
        description:
          "<code>ORDER BY</code> は、取得したデータを並び替えるために使います。",
        code: "SELECT *\nFROM employees\nORDER BY salary DESC;",
        meaning: ["salaryの値を基準にする", "給料が高い順に並べる"],
        point:
          "<code>ASC</code> は昇順、<code>DESC</code> は降順です。<code>ASC</code> は省略できます。PostgreSQLでは <code>NULLS FIRST</code> / <code>NULLS LAST</code> で NULL の並び位置も指定できます。",
      },
    ],
  },
  {
    id: "lesson10",
    number: 10,
    category: "basic",
    title: "LIMIT",
    badge: "PG",
    sections: [
      {
        heading: "LIMITとは？",
        description:
          "<code>LIMIT</code> は、取得するデータの件数を制限するために使います。PostgreSQL・MySQL などでよく使われます（標準SQLでは <code>FETCH FIRST</code>）。",
        code: "SELECT *\nFROM employees\nORDER BY salary DESC\nLIMIT 3;",
        meaning: ["給料が高い順に並べる", "先頭の3件だけ取得する"],
      },
    ],
  },
  {
    id: "lesson11",
    number: 11,
    category: "basic",
    title: "OFFSET",
    sections: [
      {
        heading: "OFFSETとは？",
        description:
          "<code>OFFSET</code> は、先頭から指定した件数を飛ばして取得するために使います。",
        code: "SELECT *\nFROM employees\nORDER BY employee_id\nLIMIT 2\nOFFSET 2;",
        meaning: [
          "employee_idの昇順に並べる",
          "最初の2件を飛ばす",
          "その次の2件を取得する",
        ],
        point:
          "<code>LIMIT</code> と <code>OFFSET</code> は、一覧画面のページ分割などで利用されます。",
      },
    ],
  },
  {
    id: "lesson12",
    number: 12,
    category: "basic",
    title: "INSERT",
    sections: [
      {
        heading: "INSERTとは？",
        description:
          "<code>INSERT</code> は、テーブルに新しい行（レコード）を追加するために使います。",
        code: "INSERT INTO employees (employee_name, department, salary)\nVALUES ('山田太郎', '営業', 320000);",
        meaning: [
          "employeesテーブルに",
          "名前・部署・給料の値を持つ新しい社員を1件追加する",
        ],
        point:
          "PostgreSQLでは <code>RETURNING</code> を付けると、追加した行の内容をその場で取得できます（講義29参照）。",
      },
    ],
  },
  {
    id: "lesson13",
    number: 13,
    category: "basic",
    title: "UPDATE",
    sections: [
      {
        heading: "UPDATEとは？",
        description:
          "<code>UPDATE</code> は、テーブル内の既存データを変更するために使います。<code>WHERE</code> を忘れると全行が更新されるので注意が必要です。",
        code: "UPDATE employees\nSET salary = 350000\nWHERE employee_id = 1;",
        meaning: [
          "employee_id が 1 の社員について",
          "給料を 350000 に変更する",
        ],
        point:
          "<code>WHERE</code> を省略すると全行が更新されます。PostgreSQLでは <code>RETURNING</code> で更新後の行も取得できます。",
      },
    ],
  },
  {
    id: "lesson14",
    number: 14,
    category: "basic",
    title: "DELETE",
    sections: [
      {
        heading: "DELETEとは？",
        description:
          "<code>DELETE</code> は、テーブルから行を削除するために使います。<code>WHERE</code> を忘れると全行が削除されるので注意が必要です。",
        code: "DELETE FROM employees\nWHERE employee_id = 5;",
        meaning: [
          "employeesテーブルから",
          "employee_id が 5 の社員を削除する",
        ],
        point:
          "<code>WHERE</code> を省略すると全行が削除されます。PostgreSQLでは <code>RETURNING</code> で削除した行の内容も取得できます。",
      },
    ],
  },
  {
    id: "lesson15",
    number: 15,
    category: "basic",
    title: "DISTINCT",
    sections: [
      {
        heading: "DISTINCTとは？",
        description:
          "<code>DISTINCT</code> は、重複する行を除いて取得するために使います。",
        code: "SELECT DISTINCT department\nFROM employees;",
        meaning: [
          "employeesテーブルから部署を取得する",
          "同じ部署名は1回だけ表示する",
        ],
      },
    ],
  },

  /* ========== 結合 ========== */
  {
    id: "lesson16",
    number: 16,
    category: "join",
    title: "INNER JOIN",
    sections: [
      {
        heading: "INNER JOINとは？",
        description:
          "<code>INNER JOIN</code> は、複数のテーブルを結合し、両方に一致するデータだけを取得するために使います。",
        code: "SELECT employees.employee_name, departments.department_name\nFROM employees\nINNER JOIN departments\n  ON employees.department_id = departments.department_id;",
        meaning: [
          "employees と departments を結合する",
          "department_id が一致する行だけを取得する",
          "社員名と部署名を表示する",
        ],
      },
    ],
  },
  {
    id: "lesson17",
    number: 17,
    category: "join",
    title: "AS（エイリアス）",
    sections: [
      {
        heading: "AS（エイリアス）とは？",
        description:
          "<code>AS</code> は、テーブル名や列名に別名（エイリアス）を付けるために使います。",
        code: "SELECT e.employee_name AS 社員名,\n       d.department_name AS 部署名\nFROM employees AS e\nINNER JOIN departments AS d\n  ON e.department_id = d.department_id;",
        meaning: [
          "employees を e、departments を d と省略する",
          "結果の列名を「社員名」「部署名」として表示する",
        ],
        point:
          "<code>AS</code> は省略できます（例：<code>employees e</code>）。",
      },
    ],
  },
  {
    id: "lesson18",
    number: 18,
    category: "join",
    title: "JOINとWHERE",
    sections: [
      {
        heading: "JOINとWHEREとは？",
        description:
          "テーブルを結合したあと、<code>WHERE</code> でさらに条件を絞り込めます。結合条件は <code>ON</code>、絞り込み条件は <code>WHERE</code> に書くのが基本です。",
        code: "SELECT e.employee_name, d.department_name, e.salary\nFROM employees AS e\nINNER JOIN departments AS d\n  ON e.department_id = d.department_id\nWHERE e.salary >= 300000;",
        meaning: [
          "社員と部署を結合する",
          "給料が300000円以上の社員だけに絞り込む",
        ],
      },
    ],
  },
  {
    id: "lesson19",
    number: 19,
    category: "join",
    title: "JOINとORDER BY",
    sections: [
      {
        heading: "JOINとORDER BYとは？",
        description:
          "結合した結果を、<code>ORDER BY</code> で並び替えることができます。",
        code: "SELECT e.employee_name, d.department_name, e.salary\nFROM employees AS e\nINNER JOIN departments AS d\n  ON e.department_id = d.department_id\nORDER BY e.salary DESC;",
        meaning: [
          "社員と部署を結合する",
          "給料が高い順に並べて表示する",
        ],
      },
    ],
  },
  {
    id: "lesson20",
    number: 20,
    category: "join",
    title: "LEFT JOIN",
    sections: [
      {
        heading: "LEFT JOINとは？",
        description:
          "<code>LEFT JOIN</code> は、左側のテーブルの全行を残しつつ、右側のテーブルを結合します。右側に一致がなくても左側は表示され、右側は NULL になります。",
        code: "SELECT e.employee_name, d.department_name\nFROM employees AS e\nLEFT JOIN departments AS d\n  ON e.department_id = d.department_id;",
        meaning: [
          "employees（左）の全社員を取得する",
          "部署が紐づく社員は部署名も表示する",
          "部署が未登録の社員は部署名が NULL になる",
        ],
      },
    ],
  },
  {
    id: "lesson21",
    number: 21,
    category: "join",
    title: "LEFT JOINとIS NULL",
    sections: [
      {
        heading: "LEFT JOINとIS NULLとは？",
        description:
          "<code>LEFT JOIN</code> と <code>IS NULL</code> を組み合わせると、「右側に一致しないデータ」だけを取り出せます。",
        code: "SELECT e.employee_name\nFROM employees AS e\nLEFT JOIN departments AS d\n  ON e.department_id = d.department_id\nWHERE d.department_id IS NULL;",
        meaning: [
          "社員と部署を LEFT JOIN する",
          "部署側が NULL の行だけ残す",
          "＝ どの部署にも属していない社員を取得する",
        ],
      },
    ],
  },
  {
    id: "lesson22",
    number: 22,
    category: "join",
    title: "RIGHT JOIN・FULL JOIN",
    sections: [
      {
        heading: "RIGHT JOINとは？",
        description:
          "<code>RIGHT JOIN</code> は右側のテーブルを基準に結合します。<code>LEFT JOIN</code> の左右を入れ替えたものと同等です。",
        code: "SELECT e.employee_name, d.department_name\nFROM employees AS e\nRIGHT JOIN departments AS d\n  ON e.department_id = d.department_id;",
        meaning: [
          "departments（右）の全部署を残す",
          "社員がいない部署も表示される（社員名は NULL）",
        ],
      },
      {
        heading: "FULL OUTER JOINとは？",
        description:
          "<code>FULL OUTER JOIN</code>（または <code>FULL JOIN</code>）は、左右どちらかにあれば行を残します。PostgreSQL は対応していますが、MySQL は標準では未対応です。",
        code: "SELECT e.employee_name, d.department_name\nFROM employees AS e\nFULL OUTER JOIN departments AS d\n  ON e.department_id = d.department_id;",
        meaning: [
          "両方のテーブルの行をできるだけ残す",
          "相手側に一致がなければ NULL になる",
        ],
      },
    ],
  },
  {
    id: "lesson23",
    number: 23,
    category: "join",
    title: "CROSS JOIN",
    sections: [
      {
        heading: "CROSS JOINとは？",
        description:
          "<code>CROSS JOIN</code> は、2つのテーブルのすべての組み合わせ（直積）を作ります。",
        code: "SELECT e.employee_name, s.shift_name\nFROM employees AS e\nCROSS JOIN shifts AS s;",
        meaning: [
          "全社員と全シフトの組み合わせを作る",
          "行数は「社員数 × シフト数」になる",
        ],
      },
    ],
  },
  {
    id: "lesson24",
    number: 24,
    category: "join",
    title: "3テーブルJOIN",
    sections: [
      {
        heading: "3テーブルJOINとは？",
        description:
          "<code>JOIN</code> は3つ以上のテーブルをつなげることもできます。",
        code: "SELECT e.employee_name,\n       d.department_name,\n       p.project_name\nFROM employees AS e\nINNER JOIN departments AS d\n  ON e.department_id = d.department_id\nINNER JOIN projects AS p\n  ON e.employee_id = p.employee_id;",
        meaning: [
          "社員・部署・プロジェクトの3テーブルを結合する",
          "社員名、部署名、プロジェクト名をまとめて取得する",
        ],
      },
    ],
  },
  {
    id: "lesson25",
    number: 25,
    category: "join",
    title: "LATERAL JOIN",
    badge: "PG",
    sections: [
      {
        heading: "LATERAL JOINとは？（PostgreSQLの強み）",
        description:
          "<code>LATERAL</code> は、左側の行ごとに右側のサブクエリを実行できる結合です。相関サブクエリを JOIN の形で書けます。PostgreSQL でよく使われる応用構文です。",
        code: "SELECT e.employee_name, r.recent_project\nFROM employees AS e\nLEFT JOIN LATERAL (\n  SELECT p.project_name AS recent_project\n  FROM projects AS p\n  WHERE p.employee_id = e.employee_id\n  ORDER BY p.started_at DESC\n  LIMIT 1\n) AS r ON true;",
        meaning: [
          "社員ごとに",
          "その社員の最新プロジェクトを1件だけ取得する",
          "プロジェクトがなければ recent_project は NULL",
        ],
      },
    ],
  },

  /* ========== 集計 ========== */
  {
    id: "lesson26",
    number: 26,
    category: "aggregate",
    title: "GROUP BY",
    sections: [
      {
        heading: "GROUP BYとは？",
        description:
          "<code>GROUP BY</code> は、同じ値ごとに行をグループ化し、集計するために使います。",
        code: "SELECT department, COUNT(*)\nFROM employees\nGROUP BY department;",
        meaning: ["部署ごとにグループ化する", "各部署の社員数を数える"],
      },
    ],
  },
  {
    id: "lesson27",
    number: 27,
    category: "aggregate",
    title: "COUNT",
    sections: [
      {
        heading: "COUNTとは？",
        description:
          "<code>COUNT</code> は、行の件数を数える集計関数です。<code>COUNT(*)</code> はすべての行、<code>COUNT(列名)</code> は NULL 以外の件数を数えます。",
        code: "SELECT COUNT(*)\nFROM employees\nWHERE department = '営業';",
        meaning: ["営業部署の社員について", "件数を数える"],
      },
    ],
  },
  {
    id: "lesson28",
    number: 28,
    category: "aggregate",
    title: "SUM・AVG・MAX・MIN",
    sections: [
      {
        heading: "SUMとは？",
        description: "<code>SUM</code> は、数値列の合計を求める集計関数です。",
        code: "SELECT department, SUM(salary)\nFROM employees\nGROUP BY department;",
        meaning: ["部署ごとにグループ化する", "各部署の給料の合計を求める"],
      },
      {
        heading: "AVG・MAX・MINとは？",
        description:
          "<code>AVG</code> は平均、<code>MAX</code> は最大、<code>MIN</code> は最小を求めます。",
        code: "SELECT AVG(salary), MAX(salary), MIN(salary)\nFROM employees;",
        meaning: [
          "全社員の給料の平均・最大・最小を一度に取得する",
        ],
      },
    ],
  },
  {
    id: "lesson29",
    number: 29,
    category: "aggregate",
    title: "HAVING",
    sections: [
      {
        heading: "HAVINGとは？",
        description:
          "<code>HAVING</code> は、<code>GROUP BY</code> でグループ化したあとに条件で絞り込むために使います。<code>WHERE</code> はグループ化前、<code>HAVING</code> はグループ化後です。",
        code: "SELECT department, COUNT(*)\nFROM employees\nGROUP BY department\nHAVING COUNT(*) >= 3;",
        meaning: [
          "部署ごとに社員数を集計する",
          "社員数が3人以上の部署だけを残す",
        ],
        point:
          "集計関数の結果で絞り込むときは <code>WHERE</code> ではなく <code>HAVING</code> を使います。",
      },
    ],
  },
  {
    id: "lesson30",
    number: 30,
    category: "aggregate",
    title: "FILTER句",
    badge: "PG",
    sections: [
      {
        heading: "FILTER句とは？（PostgreSQL）",
        description:
          "<code>FILTER (WHERE …)</code> は、集計関数ごとに条件を付けて集計する PostgreSQL の便利な書き方です。<code>CASE</code> を使わずに条件付き集計ができます。",
        code: "SELECT\n  COUNT(*) AS 全件数,\n  COUNT(*) FILTER (WHERE department = '営業') AS 営業人数,\n  COUNT(*) FILTER (WHERE department = '開発') AS 開発人数\nFROM employees;",
        meaning: [
          "全社員数を数える",
          "営業・開発の人数も同じクエリで条件付き集計する",
        ],
      },
    ],
  },
  {
    id: "lesson31",
    number: 31,
    category: "aggregate",
    title: "STRING_AGG・ARRAY_AGG",
    badge: "PG",
    sections: [
      {
        heading: "STRING_AGGとは？（PostgreSQL）",
        description:
          "<code>STRING_AGG</code> は、グループ内の文字列を区切り文字で連結する集計関数です。MySQL の <code>GROUP_CONCAT</code> に近い役割です。",
        code: "SELECT department,\n       STRING_AGG(employee_name, ', ' ORDER BY employee_name)\nFROM employees\nGROUP BY department;",
        meaning: [
          "部署ごとに社員名をカンマ区切りでつなげる",
          "名前は五十音（文字列）順に並べる",
        ],
      },
      {
        heading: "ARRAY_AGGとは？（PostgreSQL）",
        description:
          "<code>ARRAY_AGG</code> は、グループ内の値を配列（array）にまとめます。",
        code: "SELECT department,\n       ARRAY_AGG(employee_name ORDER BY salary DESC)\nFROM employees\nGROUP BY department;",
        meaning: [
          "部署ごとに社員名を配列にする",
          "給料が高い順に並べて格納する",
        ],
      },
    ],
  },

  /* ========== PostgreSQL特有の構文 ========== */
  {
    id: "lesson32",
    number: 32,
    category: "pg",
    title: "RETURNING",
    badge: "PG",
    sections: [
      {
        heading: "RETURNINGとは？（PostgreSQLの定番）",
        description:
          "<code>RETURNING</code> は、<code>INSERT</code> / <code>UPDATE</code> / <code>DELETE</code> の直後に、変更した行の内容を返す句です。別途 <code>SELECT</code> しなくてよいため、アプリ開発で非常によく使います。多くのRDBでは非対応です。",
        code: "INSERT INTO employees (employee_name, department, salary)\nVALUES ('佐藤花子', '開発', 380000)\nRETURNING employee_id, employee_name;",
        meaning: [
          "新しい社員を追加する",
          "追加された行の employee_id と名前をその場で返す",
        ],
      },
      {
        heading: "UPDATE / DELETE での RETURNING",
        description:
          "更新・削除でも同じように使えます。",
        code: "UPDATE employees\nSET salary = salary * 1.1\nWHERE department = '営業'\nRETURNING employee_name, salary;",
        meaning: [
          "営業部署の給料を1.1倍にする",
          "更新後の名前と給料を返す",
        ],
      },
    ],
  },
  {
    id: "lesson33",
    number: 33,
    category: "pg",
    title: "ON CONFLICT（UPSERT）",
    badge: "PG",
    sections: [
      {
        heading: "ON CONFLICTとは？（PostgreSQL）",
        description:
          "<code>ON CONFLICT</code> は、一意制約に違反した場合の動作を指定する PostgreSQL の UPSERT 構文です。「あれば更新、なければ挿入」を1文で書けます。",
        code: "INSERT INTO employees (employee_id, employee_name, salary)\nVALUES (1, '山田太郎', 400000)\nON CONFLICT (employee_id)\nDO UPDATE SET\n  employee_name = EXCLUDED.employee_name,\n  salary = EXCLUDED.salary\nRETURNING *;",
        meaning: [
          "employee_id = 1 を挿入しようとする",
          "既にあれば名前と給料を更新する",
          "EXCLUDED は挿入しようとした側の値",
          "結果の行を RETURNING で返す",
        ],
        point:
          "<code>DO NOTHING</code> にすると、衝突時は何もしません。",
      },
    ],
  },
  {
    id: "lesson34",
    number: 34,
    category: "pg",
    title: "DISTINCT ON",
    badge: "PG",
    sections: [
      {
        heading: "DISTINCT ONとは？（PostgreSQL専用）",
        description:
          "<code>DISTINCT ON (列)</code> は、指定した列の値が同じ行のうち、最初の1行だけを残します。「グループごとに最新1件」などの取得でよく使います。標準SQLにはありません。",
        code: "SELECT DISTINCT ON (department)\n  department, employee_name, salary\nFROM employees\nORDER BY department, salary DESC;",
        meaning: [
          "部署ごとに1行だけ残す",
          "ORDER BY で給料が高い行が先に来るので",
          "各部署の最高給与の社員が得られる",
        ],
        point:
          "<code>DISTINCT ON</code> の列は、<code>ORDER BY</code> の先頭と一致させる必要があります。",
      },
    ],
  },
  {
    id: "lesson35",
    number: 35,
    category: "pg",
    title: "NULLS FIRST / LAST",
    badge: "PG",
    sections: [
      {
        heading: "NULLS FIRST / LASTとは？",
        description:
          "PostgreSQLでは、<code>ORDER BY</code> のときに NULL を先頭にするか末尾にするかを明示できます。",
        code: "SELECT employee_name, department_id\nFROM employees\nORDER BY department_id NULLS FIRST;",
        meaning: [
          "department_id で並べる",
          "NULL（部署未設定）を先頭に持ってくる",
        ],
        point:
          "デフォルトは昇順で NULLS LAST、降順で NULLS FIRST です（PostgreSQL）。",
      },
    ],
  },
  {
    id: "lesson36",
    number: 36,
    category: "pg",
    title: "FETCH FIRST",
    sections: [
      {
        heading: "FETCH FIRSTとは？",
        description:
          "<code>FETCH FIRST n ROWS ONLY</code> は、<code>LIMIT</code> の標準SQL版です。PostgreSQL では両方使えます。",
        code: "SELECT *\nFROM employees\nORDER BY salary DESC\nFETCH FIRST 3 ROWS ONLY;",
        meaning: ["給料が高い順に", "先頭3件だけ取得する"],
        point:
          "実務の PostgreSQL では <code>LIMIT</code> の方が短くてよく使われます。",
      },
    ],
  },
  {
    id: "lesson37",
    number: 37,
    category: "pg",
    title: "ドル引用符 $$?$$",
    badge: "PG",
    sections: [
      {
        heading: "ドル引用符とは？（PostgreSQL）",
        description:
          "PostgreSQLでは、文字列を <code>'…'</code> の代わりに <code>$$…$$</code> や <code>$tag$…$tag$</code> で囲めます。中にシングルクォートがあってもエスケープ不要です。関数定義や長いSQLでよく使います。",
        code: "SELECT $$\nこれは '引用符' を含む文章です\n$$ AS message;",
        meaning: [
          "シングルクォートをエスケープせずに",
          "複数行の文字列リテラルを書く",
        ],
      },
    ],
  },

  /* ========== データ型 ========== */
  {
    id: "lesson38",
    number: 38,
    category: "types",
    title: "SERIAL・IDENTITY",
    badge: "PG",
    sections: [
      {
        heading: "SERIALとは？（PostgreSQL）",
        description:
          "<code>SERIAL</code> は、自動採番の整数列を簡単に作る PostgreSQL の仕組みです（内部的にはシーケンスを使います）。",
        code: "CREATE TABLE employees (\n  employee_id SERIAL PRIMARY KEY,\n  employee_name TEXT NOT NULL\n);",
        meaning: [
          "employee_id が自動で 1, 2, 3… と増える",
          "主キーとして使う",
        ],
      },
      {
        heading: "GENERATED … AS IDENTITY",
        description:
          "近年の PostgreSQL では、標準SQL寄りの <code>GENERATED BY DEFAULT AS IDENTITY</code>（または <code>ALWAYS</code>）も推奨されます。",
        code: "CREATE TABLE employees (\n  employee_id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,\n  employee_name TEXT NOT NULL\n);",
        meaning: ["標準的な書き方で自動採番列を定義する"],
      },
    ],
  },
  {
    id: "lesson39",
    number: 39,
    category: "types",
    title: "BOOLEAN",
    badge: "PG",
    sections: [
      {
        heading: "BOOLEANとは？",
        description:
          "PostgreSQL の <code>BOOLEAN</code> 型は真偽値を格納します。<code>TRUE</code> / <code>FALSE</code> / <code>NULL</code> を取れます。",
        code: "SELECT *\nFROM employees\nWHERE is_active = TRUE;",
        meaning: "在籍フラグが真の社員だけ取得する",
        point:
          "PostgreSQLでは <code>WHERE is_active</code> と書いても <code>= TRUE</code> と同じ意味になります。",
      },
    ],
  },
  {
    id: "lesson40",
    number: 40,
    category: "types",
    title: "配列（ARRAY）",
    badge: "PG",
    sections: [
      {
        heading: "配列型とは？（PostgreSQLの特徴）",
        description:
          "PostgreSQL は列に配列を直接持てます。他の多くのRDBにはない強力な機能です。",
        code: "SELECT employee_name, skills\nFROM employees\nWHERE skills @> ARRAY['PostgreSQL'];",
        meaning: [
          "skills 配列に 'PostgreSQL' を含む社員を取得する",
          "@> は「含む（包含）」演算子",
        ],
      },
      {
        heading: "配列の作成とアクセス",
        description: "配列リテラルや添字アクセスもできます。",
        code: "SELECT ARRAY[1, 2, 3] AS nums,\n       (ARRAY['a', 'b', 'c'])[2] AS second;",
        meaning: [
          "整数配列 [1,2,3] を作る",
          "文字配列の2番目（b）を取り出す（1始まり）",
        ],
      },
    ],
  },
  {
    id: "lesson41",
    number: 41,
    category: "types",
    title: "JSON・JSONB",
    badge: "PG",
    sections: [
      {
        heading: "JSON / JSONBとは？（PostgreSQL）",
        description:
          "PostgreSQL は JSON をネイティブに扱えます。<code>JSON</code> は入力そのまま保存、<code>JSONB</code> はバイナリ形式で保存し、検索・インデックスに向いています。実務ではほぼ <code>JSONB</code> を使います。",
        code: "SELECT profile ->> 'city' AS city\nFROM employees\nWHERE profile @> '{\"level\": \"senior\"}'::jsonb;",
        meaning: [
          "profile（JSONB）から city を文字列として取り出す",
          "level が senior の人だけに絞り込む",
        ],
        point:
          "<code>-></code> は JSON のまま、<code>->></code> はテキストとして取り出します。",
      },
    ],
  },
  {
    id: "lesson42",
    number: 42,
    category: "types",
    title: "UUID",
    badge: "PG",
    sections: [
      {
        heading: "UUIDとは？",
        description:
          "<code>UUID</code> は世界中で一意になりやすい識別子です。PostgreSQL では専用型があり、<code>gen_random_uuid()</code>（標準）などで生成できます。",
        code: "CREATE TABLE users (\n  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  email TEXT UNIQUE NOT NULL\n);",
        meaning: [
          "主キーに UUID を使う",
          "行追加時に自動でランダムUUIDを入れる",
        ],
      },
    ],
  },
  {
    id: "lesson43",
    number: 43,
    category: "types",
    title: "TEXT・VARCHAR・CHAR",
    sections: [
      {
        heading: "文字列型の使い分け（PostgreSQL）",
        description:
          "PostgreSQLでは <code>TEXT</code> と <code>VARCHAR</code> の性能差はほとんどありません。長さ制限が要らなければ <code>TEXT</code> がよく使われます。",
        code: "CREATE TABLE notes (\n  title VARCHAR(100),\n  body TEXT\n);",
        meaning: [
          "タイトルは最大100文字",
          "本文は長さ制限なしの TEXT",
        ],
        point:
          "<code>CHAR(n)</code> は空白埋めされるため、PostgreSQLではあまり使いません。",
      },
    ],
  },
  {
    id: "lesson44",
    number: 44,
    category: "types",
    title: "NUMERIC・INTEGER",
    sections: [
      {
        heading: "数値型とは？",
        description:
          "整数は <code>SMALLINT</code> / <code>INTEGER</code> / <code>BIGINT</code>、正確な小数（金額など）は <code>NUMERIC</code>（別名 <code>DECIMAL</code>）を使います。<code>REAL</code> / <code>DOUBLE PRECISION</code> は概数です。",
        code: "CREATE TABLE products (\n  product_id INTEGER GENERATED BY DEFAULT AS IDENTITY,\n  price NUMERIC(10, 2)\n);",
        meaning: [
          "商品IDは整数の自動採番",
          "価格は小数第2位までの正確な数値",
        ],
      },
    ],
  },
  {
    id: "lesson45",
    number: 45,
    category: "types",
    title: "TIMESTAMP・TIMESTAMPTZ",
    badge: "PG",
    sections: [
      {
        heading: "日時型とは？（PostgreSQL）",
        description:
          "<code>TIMESTAMP</code> はタイムゾーンなし、<code>TIMESTAMPTZ</code>（<code>TIMESTAMP WITH TIME ZONE</code>）はタイムゾーン付きです。PostgreSQL ではサーバーやセッションのタイムゾーンを考慮したいとき <code>TIMESTAMPTZ</code> が推奨されることが多いです。",
        code: "SELECT NOW(),\n       CURRENT_TIMESTAMP,\n       CURRENT_DATE;",
        meaning: [
          "NOW() / CURRENT_TIMESTAMP は現在日時（TIMESTAMPTZ）",
          "CURRENT_DATE は今日の日付",
        ],
      },
    ],
  },
  {
    id: "lesson46",
    number: 46,
    category: "types",
    title: "ENUM",
    badge: "PG",
    sections: [
      {
        heading: "ENUM型とは？（PostgreSQL）",
        description:
          "<code>CREATE TYPE … AS ENUM</code> で、取りうる値を制限した独自の型を作れます。",
        code: "CREATE TYPE order_status AS ENUM\n  ('pending', 'paid', 'shipped', 'cancelled');\n\nCREATE TABLE orders (\n  order_id SERIAL PRIMARY KEY,\n  status order_status NOT NULL DEFAULT 'pending'\n);",
        meaning: [
          "注文ステータス用のENUM型を作る",
          "orders.status には定義した値しか入れられない",
        ],
      },
    ],
  },

  /* ========== 関数・演算子 ========== */
  {
    id: "lesson47",
    number: 47,
    category: "functions",
    title: "COALESCE・NULLIF",
    sections: [
      {
        heading: "COALESCEとは？",
        description:
          "<code>COALESCE</code> は、引数を左から見て最初の非NULL値を返します。NULLの代わりにデフォルト値を出すときに使います。",
        code: "SELECT employee_name,\n       COALESCE(nickname, employee_name) AS display_name\nFROM employees;",
        meaning: [
          "ニックネームがあればそれを使う",
          "なければ本名を表示名にする",
        ],
      },
      {
        heading: "NULLIFとは？",
        description:
          "<code>NULLIF(a, b)</code> は、a と b が等しければ NULL、異なれば a を返します。ゼロ除算回避などによく使います。",
        code: "SELECT total / NULLIF(quantity, 0) AS unit_price\nFROM order_items;",
        meaning: [
          "quantity が 0 のときは NULL にして割り算エラーを避ける",
        ],
      },
    ],
  },
  {
    id: "lesson48",
    number: 48,
    category: "functions",
    title: "CASE",
    sections: [
      {
        heading: "CASEとは？",
        description:
          "<code>CASE</code> は、条件に応じて返す値を切り替える式です。",
        code: "SELECT employee_name,\n       CASE\n         WHEN salary >= 400000 THEN '高'\n         WHEN salary >= 300000 THEN '中'\n         ELSE '初'\n       END AS salary_rank\nFROM employees;",
        meaning: [
          "給料に応じて「高・中・初」の区分を付ける",
        ],
      },
    ],
  },
  {
    id: "lesson49",
    number: 49,
    category: "functions",
    title: "CASTと :: 演算子",
    badge: "PG",
    sections: [
      {
        heading: "型変換とは？",
        description:
          "型を変換するには標準の <code>CAST(値 AS 型)</code> か、PostgreSQL 独自の短い書き方 <code>値::型</code> を使います。",
        code: "SELECT '100'::INTEGER AS n,\n       CAST('2024-01-15' AS DATE) AS d,\n       salary::TEXT\nFROM employees;",
        meaning: [
          "文字列を整数・日付に変換する",
          "給料をテキスト型として扱う",
        ],
        point:
          "実務の PostgreSQL では <code>::</code> の方がよく見かけます。",
      },
    ],
  },
  {
    id: "lesson50",
    number: 50,
    category: "functions",
    title: "文字列連結 ||",
    sections: [
      {
        heading: "|| 演算子とは？",
        description:
          "PostgreSQL（標準SQL）では、文字列の連結に <code>||</code> を使います。MySQL の <code>CONCAT</code> に相当します。",
        code: "SELECT employee_name || '（' || department || '）' AS label\nFROM employees;",
        meaning: ["名前と部署を「名前（部署）」の形につなげる"],
        point:
          "どちらかが NULL だと結果も NULL になります。避けたいときは <code>CONCAT</code> や <code>COALESCE</code> を使います。",
      },
    ],
  },
  {
    id: "lesson51",
    number: 51,
    category: "functions",
    title: "正規表現（~・~*）",
    badge: "PG",
    sections: [
      {
        heading: "正規表現演算子とは？（PostgreSQL）",
        description:
          "PostgreSQL は正規表現マッチを演算子で書けます。<code>~</code> は区別あり、<code>~*</code> は区別なし、<code>!~</code> / <code>!~*</code> は不一致です。",
        code: "SELECT *\nFROM employees\nWHERE email ~* '^[A-Z0-9._%+-]+@example\\.com$';",
        meaning: [
          "example.com 宛のメールアドレス形式に合う行を取得する",
          "~* なので大文字小文字を区別しない",
        ],
      },
    ],
  },
  {
    id: "lesson52",
    number: 52,
    category: "functions",
    title: "日付関数（INTERVAL等）",
    badge: "PG",
    sections: [
      {
        heading: "INTERVAL・DATE_TRUNC・EXTRACT",
        description:
          "PostgreSQL では日付・時刻の計算が豊富です。<code>INTERVAL</code> で期間を足し引き、<code>DATE_TRUNC</code> で切り捨て、<code>EXTRACT</code> で部品を取り出せます。",
        code: "SELECT\n  CURRENT_DATE + INTERVAL '7 days' AS next_week,\n  DATE_TRUNC('month', NOW()) AS month_start,\n  EXTRACT(YEAR FROM hired_at) AS hired_year\nFROM employees;",
        meaning: [
          "今日から7日後を求める",
          "今月の初日（時刻付き）を求める",
          "入社日から年だけ取り出す",
        ],
      },
    ],
  },
  {
    id: "lesson53",
    number: 53,
    category: "functions",
    title: "TO_CHAR・TO_DATE",
    sections: [
      {
        heading: "TO_CHAR / TO_DATEとは？",
        description:
          "<code>TO_CHAR</code> は日時や数値を書式付き文字列に、<code>TO_DATE</code> / <code>TO_TIMESTAMP</code> は文字列を日時に変換します。",
        code: "SELECT TO_CHAR(NOW(), 'YYYY年MM月DD日 HH24:MI') AS labeled,\n       TO_DATE('2024/04/01', 'YYYY/MM/DD') AS d;",
        meaning: [
          "現在日時を日本語っぽい表示にする",
          "文字列を日付型に変換する",
        ],
      },
    ],
  },
  {
    id: "lesson54",
    number: 54,
    category: "functions",
    title: "GENERATE_SERIES",
    badge: "PG",
    sections: [
      {
        heading: "GENERATE_SERIESとは？（PostgreSQLの便利関数）",
        description:
          "<code>GENERATE_SERIES</code> は、連番や連続した日付を生成する集合を返す関数です。テストデータ作成やカレンダー生成でよく使います。",
        code: "SELECT *\nFROM GENERATE_SERIES(1, 5);\n\nSELECT *\nFROM GENERATE_SERIES(\n  DATE '2024-01-01',\n  DATE '2024-01-05',\n  INTERVAL '1 day'\n);",
        meaning: [
          "1から5までの整数を生成する",
          "2024-01-01〜01-05の日付を1日刻みで生成する",
        ],
      },
    ],
  },
  {
    id: "lesson55",
    number: 55,
    category: "functions",
    title: "UNNEST",
    badge: "PG",
    sections: [
      {
        heading: "UNNESTとは？",
        description:
          "<code>UNNEST</code> は、配列を行の集合に展開します。配列型とセットで使う PostgreSQL らしい関数です。",
        code: "SELECT employee_name, skill\nFROM employees,\n     UNNEST(skills) AS skill;",
        meaning: [
          "skills 配列の各要素を1行に展開する",
          "社員名とスキルの組み合わせ一覧になる",
        ],
      },
    ],
  },
  {
    id: "lesson56",
    number: 56,
    category: "functions",
    title: "ANY・ALL・SOME",
    sections: [
      {
        heading: "ANY / ALLとは？",
        description:
          "<code>= ANY (配列)</code> は「配列のいずれかに等しい」、<code>> ALL (配列)</code> は「配列のすべてより大きい」などを表します。PostgreSQL では配列との組み合わせでよく使います。",
        code: "SELECT *\nFROM employees\nWHERE department = ANY(ARRAY['営業', '開発']);",
        meaning: [
          "部署が営業または開発の社員を取得する",
          "IN ('営業','開発') とほぼ同じ意味",
        ],
      },
    ],
  },

  /* ========== 高度なクエリ ========== */
  {
    id: "lesson57",
    number: 57,
    category: "advanced",
    title: "サブクエリ",
    sections: [
      {
        heading: "サブクエリとは？",
        description:
          "サブクエリは、SQLの中に書く別の <code>SELECT</code> です。条件や一覧の元データとして使います。",
        code: "SELECT employee_name, salary\nFROM employees\nWHERE salary > (\n  SELECT AVG(salary) FROM employees\n);",
        meaning: [
          "全体の平均給料を先に求める",
          "それより高い給料の社員だけ取得する",
        ],
      },
    ],
  },
  {
    id: "lesson58",
    number: 58,
    category: "advanced",
    title: "EXISTS",
    sections: [
      {
        heading: "EXISTSとは？",
        description:
          "<code>EXISTS</code> は、サブクエリに1行でもあれば真になります。「関連データがあるか」の判定に向いています。",
        code: "SELECT e.employee_name\nFROM employees AS e\nWHERE EXISTS (\n  SELECT 1\n  FROM projects AS p\n  WHERE p.employee_id = e.employee_id\n);",
        meaning: [
          "プロジェクトを1件でも持っている社員を取得する",
        ],
      },
    ],
  },
  {
    id: "lesson59",
    number: 59,
    category: "advanced",
    title: "UNION・INTERSECT・EXCEPT",
    sections: [
      {
        heading: "UNIONとは？",
        description:
          "<code>UNION</code> は結果を縦に結合し重複を除きます。<code>UNION ALL</code> は重複も残します。",
        code: "SELECT employee_name FROM employees\nUNION\nSELECT customer_name FROM customers;",
        meaning: ["社員名と顧客名を1つの名前一覧にまとめる（重複除去）"],
      },
      {
        heading: "INTERSECT / EXCEPT（PostgreSQL）",
        description:
          "<code>INTERSECT</code> は共通部分、<code>EXCEPT</code> は差集合です。PostgreSQL は両方サポートしています。",
        code: "SELECT department_id FROM employees\nEXCEPT\nSELECT department_id FROM departments;",
        meaning: [
          "employees にあるが departments にない department_id を出す",
        ],
      },
    ],
  },
  {
    id: "lesson60",
    number: 60,
    category: "advanced",
    title: "CTE（WITH）",
    sections: [
      {
        heading: "CTE（WITH句）とは？",
        description:
          "CTE（Common Table Expression）は、<code>WITH</code> で一時的な結果に名前を付け、あとから参照できる書き方です。読みやすい長いクエリに向きます。",
        code: "WITH high_salary AS (\n  SELECT *\n  FROM employees\n  WHERE salary >= 400000\n)\nSELECT department, COUNT(*)\nFROM high_salary\nGROUP BY department;",
        meaning: [
          "まず高給与の社員を high_salary として切り出す",
          "そのあと部署ごとに人数を集計する",
        ],
      },
    ],
  },
  {
    id: "lesson61",
    number: 61,
    category: "advanced",
    title: "WITH RECURSIVE",
    badge: "PG",
    sections: [
      {
        heading: "WITH RECURSIVEとは？",
        description:
          "<code>WITH RECURSIVE</code> は、再帰的に行をたどる CTE です。組織図・カテゴリの親子・グラフ構造などで使います。PostgreSQL でよく出る応用です。",
        code: "WITH RECURSIVE org AS (\n  SELECT employee_id, employee_name, manager_id, 1 AS depth\n  FROM employees\n  WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.employee_id, e.employee_name, e.manager_id, o.depth + 1\n  FROM employees AS e\n  INNER JOIN org AS o\n    ON e.manager_id = o.employee_id\n)\nSELECT * FROM org ORDER BY depth, employee_id;",
        meaning: [
          "最上位（上司なし）から開始する",
          "部下を再帰的にたどって階層 depth を付ける",
        ],
      },
    ],
  },
  {
    id: "lesson62",
    number: 62,
    category: "advanced",
    title: "ウィンドウ関数（OVER）",
    sections: [
      {
        heading: "ウィンドウ関数とは？",
        description:
          "ウィンドウ関数は、行をまとめずに（GROUP BY せずに）順位や累計などを計算します。<code>OVER (PARTITION BY … ORDER BY …)</code> で範囲を指定します。",
        code: "SELECT employee_name,\n       department,\n       salary,\n       ROW_NUMBER() OVER (\n         PARTITION BY department\n         ORDER BY salary DESC\n       ) AS rank_in_dept\nFROM employees;",
        meaning: [
          "部署ごとに給料が高い順で番号を振る",
          "行は消えず、順位列が追加される",
        ],
      },
    ],
  },
  {
    id: "lesson63",
    number: 63,
    category: "advanced",
    title: "RANK・DENSE_RANK・NTILE",
    sections: [
      {
        heading: "RANK系とは？",
        description:
          "<code>ROW_NUMBER</code> は一意の連番、<code>RANK</code> は同率で番号が飛び、<code>DENSE_RANK</code> は同率でも飛びません。<code>NTILE(n)</code> は n 個のグループに分けます。",
        code: "SELECT employee_name,\n       salary,\n       RANK() OVER (ORDER BY salary DESC) AS r,\n       DENSE_RANK() OVER (ORDER BY salary DESC) AS dr\nFROM employees;",
        meaning: [
          "給料の高い順に RANK と DENSE_RANK を付ける",
        ],
      },
    ],
  },
  {
    id: "lesson64",
    number: 64,
    category: "advanced",
    title: "LAG・LEAD",
    sections: [
      {
        heading: "LAG / LEADとは？",
        description:
          "<code>LAG</code> は前の行、<code>LEAD</code> は次の行の値を同じ結果セット内で参照できます。時系列の差分計算に便利です。",
        code: "SELECT hired_at,\n       salary,\n       LAG(salary) OVER (ORDER BY hired_at) AS prev_salary,\n       salary - LAG(salary) OVER (ORDER BY hired_at) AS diff\nFROM employees;",
        meaning: [
          "入社日順に並べる",
          "直前の行の給料との差分を計算する",
        ],
      },
    ],
  },
  {
    id: "lesson65",
    number: 65,
    category: "advanced",
    title: "JSONB演算子まとめ",
    badge: "PG",
    sections: [
      {
        heading: "よく使う JSONB 演算子",
        description:
          "PostgreSQL の JSONB で頻出の演算子です。",
        extraHtml: `<ul>
  <li><code>-&gt;</code>：キーで JSON 値を取得</li>
  <li><code>-&gt;&gt;</code>：キーでテキスト取得</li>
  <li><code>#&gt;</code> / <code>#&gt;&gt;</code>：パスで取得</li>
  <li><code>@&gt;</code>：左が右を含む</li>
  <li><code>?</code>：キーが存在する</li>
  <li><code>?&amp;</code> / <code>?|</code>：キーをすべて / いずれか含む</li>
</ul>`,
        code: "SELECT data -> 'user' ->> 'name' AS name\nFROM events\nWHERE data ? 'user'\n  AND data @> '{\"type\": \"signup\"}'::jsonb;",
        meaning: [
          "user キーがある行に絞る",
          "type が signup の JSON を含む行だけ",
          "user.name を文字列で取り出す",
        ],
      },
    ],
  },

  /* ========== テーブル定義 ========== */
  {
    id: "lesson66",
    number: 66,
    category: "ddl",
    title: "CREATE TABLE",
    sections: [
      {
        heading: "CREATE TABLEとは？",
        description:
          "<code>CREATE TABLE</code> は、新しいテーブルを作る文です。",
        code: "CREATE TABLE employees (\n  employee_id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,\n  employee_name TEXT NOT NULL,\n  department TEXT,\n  salary INTEGER CHECK (salary >= 0),\n  hired_at DATE DEFAULT CURRENT_DATE\n);",
        meaning: [
          "社員テーブルを定義する",
          "主キー・NOT NULL・CHECK・DEFAULT を付ける",
        ],
      },
    ],
  },
  {
    id: "lesson67",
    number: 67,
    category: "ddl",
    title: "制約（PK・FK・UNIQUE・CHECK）",
    sections: [
      {
        heading: "制約とは？",
        description:
          "制約は、不正なデータが入らないようにするルールです。",
        extraHtml: `<ul>
  <li><code>PRIMARY KEY</code>：主キー（一意＋NOT NULL）</li>
  <li><code>FOREIGN KEY</code>：他テーブルとの参照整合性</li>
  <li><code>UNIQUE</code>：重複禁止</li>
  <li><code>CHECK</code>：条件チェック</li>
  <li><code>NOT NULL</code>：NULL禁止</li>
</ul>`,
        code: "CREATE TABLE projects (\n  project_id SERIAL PRIMARY KEY,\n  employee_id INTEGER NOT NULL\n    REFERENCES employees (employee_id)\n    ON DELETE CASCADE,\n  project_name TEXT NOT NULL UNIQUE\n);",
        meaning: [
          "projects は employees を参照する",
          "社員が削除されたら関連プロジェクトも削除（CASCADE）",
        ],
      },
    ],
  },
  {
    id: "lesson68",
    number: 68,
    category: "ddl",
    title: "ALTER TABLE",
    sections: [
      {
        heading: "ALTER TABLEとは？",
        description:
          "<code>ALTER TABLE</code> は、既存テーブルの構造を変更します。",
        code: "ALTER TABLE employees\n  ADD COLUMN email TEXT,\n  ALTER COLUMN salary SET NOT NULL,\n  ADD CONSTRAINT employees_email_unique UNIQUE (email);",
        meaning: [
          "email 列を追加する",
          "salary を NOT NULL にする",
          "email に UNIQUE 制約を付ける",
        ],
      },
    ],
  },
  {
    id: "lesson69",
    number: 69,
    category: "ddl",
    title: "DROP・TRUNCATE",
    sections: [
      {
        heading: "DROP TABLEとは？",
        description:
          "<code>DROP TABLE</code> はテーブル定義ごと削除します。データも消えます。",
        code: "DROP TABLE IF EXISTS temp_logs;",
        meaning: [
          "temp_logs があれば削除する",
          "なくてもエラーにしない（IF EXISTS）",
        ],
      },
      {
        heading: "TRUNCATEとは？",
        description:
          "<code>TRUNCATE</code> はテーブルの全行を高速に削除します。<code>DELETE</code> より速いことが多いですが、条件指定はできません。",
        code: "TRUNCATE TABLE temp_logs RESTART IDENTITY;",
        meaning: [
          "全行を削除する",
          "SERIAL などの採番を初期化する",
        ],
        point:
          "PostgreSQLの <code>RESTART IDENTITY</code> は、関連シーケンスをリセットします。",
      },
    ],
  },
  {
    id: "lesson70",
    number: 70,
    category: "ddl",
    title: "INDEX",
    sections: [
      {
        heading: "INDEXとは？",
        description:
          "インデックスは、検索を速くするためのデータ構造です。PostgreSQL のデフォルトは B-Tree です。",
        code: "CREATE INDEX idx_employees_department\n  ON employees (department);\n\nCREATE INDEX idx_employees_profile\n  ON employees USING GIN (profile);",
        meaning: [
          "department 列に通常のB-Treeインデックスを作る",
          "JSONB の profile に GIN インデックスを作る（包含検索向け）",
        ],
        point:
          "GIN は配列・JSONB の検索でよく使う PostgreSQL のインデックスタイプです。",
      },
    ],
  },
  {
    id: "lesson71",
    number: 71,
    category: "ddl",
    title: "VIEW",
    sections: [
      {
        heading: "VIEWとは？",
        description:
          "<code>VIEW</code> は、よく使う <code>SELECT</code> に名前を付けて仮想テーブルとして扱える仕組みです。",
        code: "CREATE VIEW v_employee_dept AS\nSELECT e.employee_name, d.department_name, e.salary\nFROM employees AS e\nINNER JOIN departments AS d\n  ON e.department_id = d.department_id;\n\nSELECT * FROM v_employee_dept\nWHERE salary >= 300000;",
        meaning: [
          "結合結果をビューとして保存する",
          "あとは通常のテーブルのように SELECT できる",
        ],
      },
    ],
  },
  {
    id: "lesson72",
    number: 72,
    category: "ddl",
    title: "SCHEMA",
    badge: "PG",
    sections: [
      {
        heading: "SCHEMAとは？（PostgreSQL）",
        description:
          "スキーマは、テーブルなどをまとめる名前空間です。PostgreSQL ではデフォルトで <code>public</code> スキーマが使われます。",
        code: "CREATE SCHEMA app;\n\nCREATE TABLE app.employees (\n  employee_id SERIAL PRIMARY KEY,\n  employee_name TEXT NOT NULL\n);\n\nSET search_path TO app, public;",
        meaning: [
          "app スキーマを作る",
          "その中に employees を作る",
          "検索パスを変えて app を優先する",
        ],
      },
    ],
  },

  /* ========== トランザクション・管理 ========== */
  {
    id: "lesson73",
    number: 73,
    category: "admin",
    title: "トランザクション",
    sections: [
      {
        heading: "トランザクションとは？",
        description:
          "トランザクションは、複数のSQLを「すべて成功」か「すべて取り消し」でまとめる仕組みです。",
        code: "BEGIN;\n\nUPDATE accounts SET balance = balance - 1000 WHERE id = 1;\nUPDATE accounts SET balance = balance + 1000 WHERE id = 2;\n\nCOMMIT;",
        meaning: [
          "送金処理をまとめて実行する",
          "問題なければ COMMIT で確定",
        ],
        point:
          "途中でやめるときは <code>ROLLBACK;</code> です。PostgreSQL の psql では <code>BEGIN</code> / <code>COMMIT</code> / <code>ROLLBACK</code> が基本です。",
      },
    ],
  },
  {
    id: "lesson74",
    number: 74,
    category: "admin",
    title: "SAVEPOINT",
    sections: [
      {
        heading: "SAVEPOINTとは？",
        description:
          "<code>SAVEPOINT</code> は、トランザクション内の途中地点を作る機能です。一部だけ戻したいときに使います。",
        code: "BEGIN;\nUPDATE employees SET salary = 500000 WHERE employee_id = 1;\nSAVEPOINT sp1;\nUPDATE employees SET salary = 0 WHERE employee_id = 2;\nROLLBACK TO SAVEPOINT sp1;\nCOMMIT;",
        meaning: [
          "1人目の更新は残す",
          "2人目の更新だけ SAVEPOINT まで戻す",
          "最後に COMMIT する",
        ],
      },
    ],
  },
  {
    id: "lesson75",
    number: 75,
    category: "admin",
    title: "EXPLAIN・EXPLAIN ANALYZE",
    badge: "PG",
    sections: [
      {
        heading: "EXPLAINとは？（PostgreSQLの定番）",
        description:
          "<code>EXPLAIN</code> は、SQLがどのように実行されるか（実行計画）を表示します。<code>EXPLAIN ANALYZE</code> は実際に実行して計測します。チューニングの基本ツールです。",
        code: "EXPLAIN ANALYZE\nSELECT *\nFROM employees\nWHERE department = '営業';",
        meaning: [
          "この SELECT の実行計画と実測時間を表示する",
          "Seq Scan や Index Scan などが分かる",
        ],
        point:
          "本番で重い更新系に <code>ANALYZE</code> を付けると実際に実行されるので注意してください。",
      },
    ],
  },
  {
    id: "lesson76",
    number: 76,
    category: "admin",
    title: "FOR UPDATE・SKIP LOCKED",
    badge: "PG",
    sections: [
      {
        heading: "行ロックとは？",
        description:
          "<code>SELECT … FOR UPDATE</code> は、取得した行を更新用にロックします。同時更新の競合を防ぐときに使います。",
        code: "BEGIN;\nSELECT *\nFROM jobs\nWHERE status = 'pending'\nORDER BY job_id\nLIMIT 1\nFOR UPDATE SKIP LOCKED;\n\n-- ここで処理して status を更新\nCOMMIT;",
        meaning: [
          "未処理ジョブを1件取る",
          "他セッションがロック中の行は飛ばす（SKIP LOCKED）",
          "キュー処理でよく使う PostgreSQL の書き方",
        ],
      },
    ],
  },
  {
    id: "lesson77",
    number: 77,
    category: "admin",
    title: "COPY",
    badge: "PG",
    sections: [
      {
        heading: "COPYとは？（PostgreSQL）",
        description:
          "<code>COPY</code> は、テーブルとファイル（または標準入出力）の間で大量データを高速にやり取りするコマンドです。CSV一括取り込みで定番です。",
        code: "COPY employees (employee_name, department, salary)\nFROM '/tmp/employees.csv'\nWITH (FORMAT csv, HEADER true, ENCODING 'UTF8');",
        meaning: [
          "CSVファイルから社員データを一括投入する",
          "1行目はヘッダーとして読み飛ばす",
        ],
        point:
          "クライアント側から送る場合は <code>\\copy</code>（psql）やアプリの COPY プロトコルを使います。",
      },
    ],
  },
  {
    id: "lesson78",
    number: 78,
    category: "admin",
    title: "COMMENT ON",
    badge: "PG",
    sections: [
      {
        heading: "COMMENT ONとは？",
        description:
          "PostgreSQL では、テーブルや列にコメント（説明）をDB上に残せます。",
        code: "COMMENT ON TABLE employees IS '社員マスタ';\nCOMMENT ON COLUMN employees.salary IS '月給（円）';",
        meaning: [
          "テーブルと列に説明文を付ける",
          "\\d+ などで確認できる",
        ],
      },
    ],
  },
  {
    id: "lesson79",
    number: 79,
    category: "admin",
    title: "VACUUM・ANALYZE",
    badge: "PG",
    sections: [
      {
        heading: "VACUUM / ANALYZEとは？（PostgreSQL特有の運用）",
        description:
          "PostgreSQL は更新・削除で出た不要領域を <code>VACUUM</code> で回収します。<code>ANALYZE</code> は統計情報を更新し、実行計画の精度を上げます。通常はオートバキュームが動きます。",
        code: "VACUUM (VERBOSE) employees;\nANALYZE employees;",
        meaning: [
          "employees の不要領域を整理する",
          "統計情報を更新してプランナーを助ける",
        ],
      },
    ],
  },
  {
    id: "lesson80",
    number: 80,
    category: "admin",
    title: "情報スキーマ・システムカタログ",
    badge: "PG",
    sections: [
      {
        heading: "メタデータ参照とは？",
        description:
          "テーブル一覧や列情報は、標準の <code>information_schema</code> か、PostgreSQL 独自の <code>pg_catalog</code> から調べられます。",
        code: "SELECT table_name\nFROM information_schema.tables\nWHERE table_schema = 'public';\n\nSELECT column_name, data_type\nFROM information_schema.columns\nWHERE table_name = 'employees';",
        meaning: [
          "public スキーマのテーブル一覧を出す",
          "employees の列名とデータ型を確認する",
        ],
        point:
          "psql では <code>\\dt</code>（テーブル一覧）、<code>\\d employees</code>（定義）が便利です。",
      },
    ],
  },
];
