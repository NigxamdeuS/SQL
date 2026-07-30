/**
 * PostgreSQL よくあるエラー辞典
 * patterns: 小文字で照合するキーワード（すべて含むと加点）
 */
var ERROR_DICTIONARY = [
  {
    id: "col-not-exist",
    title: "列が存在しない",
    patterns: ["does not exist", "column"],
    matchHint: 'column "..." does not exist',
    causes: [
      "列名のスペルミス",
      "テーブル別名の指定漏れ（例: e.name と書くべきところを name）",
      "大文字小文字をダブルクォートで区別している",
      "JOIN先の列を別名なしで参照している",
    ],
    checkSql:
      "SELECT column_name\nFROM information_schema.columns\nWHERE table_name = 'employees';",
  },
  {
    id: "table-not-exist",
    title: "テーブルが存在しない",
    patterns: ["does not exist", "relation"],
    matchHint: 'relation "..." does not exist',
    causes: [
      "テーブル名のスペルミス",
      "schema の指定漏れ（例: public.employees）",
      "まだ CREATE TABLE していない",
      "検索パス（search_path）が違う",
    ],
    checkSql:
      "SELECT table_schema, table_name\nFROM information_schema.tables\nWHERE table_schema NOT IN ('pg_catalog', 'information_schema')\nORDER BY 1, 2;",
  },
  {
    id: "syntax-error",
    title: "構文エラー",
    patterns: ["syntax error"],
    matchHint: "syntax error at or near ...",
    causes: [
      "カンマや括弧の付け忘れ・余分なカンマ",
      "予約語を識別子として使っている（必要なら \"order\" のように引用）",
      "句の順番が違う（WHERE のあとに JOIN など）",
      "文字列のシングルクォート閉じ忘れ",
    ],
    checkSql: "-- エラー位置の直前の句を見直し、括弧とカンマを数える",
  },
  {
    id: "ambiguous-column",
    title: "列名が曖昧",
    patterns: ["ambiguous"],
    matchHint: 'column reference "..." is ambiguous',
    causes: [
      "複数テーブルに同名列があり、どのテーブルか不明",
      "別名（e. / d.）を付け忘れている",
    ],
    checkSql:
      "SELECT e.employee_id, d.department_id\nFROM employees AS e\nINNER JOIN departments AS d\n  ON e.department_id = d.department_id;",
  },
  {
    id: "null-value-not-allowed",
    title: "NULL を入れられない",
    patterns: ["null value", "violates not-null"],
    matchHint: "null value in column ... violates not-null constraint",
    causes: [
      "NOT NULL 列に値を渡していない",
      "INSERT の列リストと VALUES の対応がずれている",
      "空文字と NULL を混同している",
    ],
    checkSql:
      "SELECT column_name, is_nullable\nFROM information_schema.columns\nWHERE table_name = 'employees';",
  },
  {
    id: "unique-violation",
    title: "一意制約違反",
    patterns: ["unique", "duplicate key"],
    matchHint: "duplicate key value violates unique constraint",
    causes: [
      "すでに同じ主キー / UNIQUE 値が存在する",
      "UPSERT（ON CONFLICT）が必要",
      "シーケンスが実データより遅れている",
    ],
    checkSql:
      "SELECT *\nFROM employees\nWHERE employee_id = 1;\n\n-- シーケンス補正例:\n-- SELECT setval(pg_get_serial_sequence('employees','employee_id'), (SELECT MAX(employee_id) FROM employees));",
  },
  {
    id: "fk-violation",
    title: "外部キー制約違反",
    patterns: ["foreign key"],
    matchHint: "violates foreign key constraint",
    causes: [
      "参照先に存在しない ID を入れようとしている",
      "親行を先に削除して子が残っている",
      "型や値の不一致（文字列と数値など）",
    ],
    checkSql:
      "SELECT conname, pg_get_constraintdef(oid)\nFROM pg_constraint\nWHERE contype = 'f'\n  AND conrelid = 'employees'::regclass;",
  },
  {
    id: "check-violation",
    title: "CHECK 制約違反",
    patterns: ["check constraint"],
    matchHint: "violates check constraint",
    causes: [
      "CHECK で禁止されている値を入れている",
      "範囲外の数値・不正なステータス値",
    ],
    checkSql:
      "SELECT conname, pg_get_constraintdef(oid)\nFROM pg_constraint\nWHERE contype = 'c'\n  AND conrelid = 'employees'::regclass;",
  },
  {
    id: "permission-denied",
    title: "権限がない",
    patterns: ["permission denied"],
    matchHint: "permission denied for table/schema/...",
    causes: [
      "ログイン中のロールに権限がない",
      "GRANT されていない",
      "間違ったユーザーで接続している",
    ],
    checkSql:
      "SELECT current_user, session_user;\n\nSELECT grantee, privilege_type\nFROM information_schema.role_table_grants\nWHERE table_name = 'employees';",
  },
  {
    id: "division-by-zero",
    title: "ゼロ除算",
    patterns: ["division by zero"],
    matchHint: "division by zero",
    causes: [
      "分母が 0 の計算がある",
      "NULLIF / CASE で 0 を避けていない",
    ],
    checkSql:
      "SELECT amount / NULLIF(quantity, 0) AS unit_price\nFROM order_items;",
  },
  {
    id: "invalid-input-syntax",
    title: "型変換できない",
    patterns: ["invalid input syntax"],
    matchHint: "invalid input syntax for type ...",
    causes: [
      "数値列に文字を入れている",
      "日付形式が合っていない",
      "空文字を数値・日付にキャストしている",
    ],
    checkSql:
      "SELECT '2024-01-01'::date;\nSELECT NULLIF(trim(col), '')::integer FROM some_table;",
  },
  {
    id: "datatype-mismatch",
    title: "データ型が合わない",
    patterns: ["datatype mismatch", "type mismatch"],
    matchHint: "datatype mismatch / UNION types ... cannot be matched",
    causes: [
      "UNION の列の型が揃っていない",
      "比較演算の左右の型が違う",
      "明示的な CAST が必要",
    ],
    checkSql:
      "SELECT id::text AS key FROM a\nUNION ALL\nSELECT code::text AS key FROM b;",
  },
  {
    id: "group-by-error",
    title: "GROUP BY 不足",
    patterns: ["must appear in the group by", "not in aggregate"],
    matchHint: "must appear in the GROUP BY clause or be used in an aggregate function",
    causes: [
      "SELECT にある非集計列が GROUP BY にない",
      "集計と明細列を混ぜている",
    ],
    checkSql:
      "SELECT department_id, COUNT(*)\nFROM employees\nGROUP BY department_id;",
  },
  {
    id: "subquery-returns-more",
    title: "スカラサブクエリが複数行",
    patterns: ["more than one row returned by a subquery"],
    matchHint: "more than one row returned by a subquery used as an expression",
    causes: [
      "単一行を想定した場所で複数行が返っている",
      "IN / EXISTS / ANY を使うべき",
      "LIMIT 1 や集計が必要",
    ],
    checkSql:
      "SELECT *\nFROM employees e\nWHERE e.department_id IN (\n  SELECT d.department_id FROM departments d WHERE d.budget > 1000000\n);",
  },
  {
    id: "on-conflict-no-constraint",
    title: "ON CONFLICT の対象がない",
    patterns: ["no unique or exclusion constraint", "on conflict"],
    matchHint: "there is no unique or exclusion constraint matching the ON CONFLICT specification",
    causes: [
      "ON CONFLICT に書いた列に UNIQUE / PK がない",
      "制約名の指定ミス",
    ],
    checkSql:
      "SELECT indexname, indexdef\nFROM pg_indexes\nWHERE tablename = 'employees';",
  },
  {
    id: "cannot-drop",
    title: "依存があるため削除できない",
    patterns: ["cannot drop", "because other objects depend"],
    matchHint: "cannot drop ... because other objects depend on it",
    causes: [
      "ビューや外部キーが依存している",
      "CASCADE が必要か、先に依存側を削除する",
    ],
    checkSql:
      "SELECT dependent_ns.nspname, dependent_view.relname\nFROM pg_depend\nJOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid\nJOIN pg_class AS dependent_view ON pg_rewrite.ev_class = dependent_view.oid\nJOIN pg_namespace dependent_ns ON dependent_ns.oid = dependent_view.relnamespace\nLIMIT 20;",
  },
  {
    id: "current-transaction-aborted",
    title: "トランザクションが中断中",
    patterns: ["current transaction is aborted"],
    matchHint: "current transaction is aborted, commands ignored until end of transaction block",
    causes: [
      "直前のエラー後に ROLLBACK していない",
      "同じトランザクション内で失敗したまま続きを実行している",
    ],
    checkSql: "ROLLBACK;",
  },
  {
    id: "deadlock",
    title: "デッドロック",
    patterns: ["deadlock detected"],
    matchHint: "deadlock detected",
    causes: [
      "複数トランザクションが同じ行を違う順でロックしている",
      "更新順を統一する、ロック時間を短くする",
    ],
    checkSql:
      "SELECT pid, state, query\nFROM pg_stat_activity\nWHERE state <> 'idle'\nORDER BY query_start;",
  },
  {
    id: "could-not-serialize",
    title: "直列化失敗",
    patterns: ["could not serialize"],
    matchHint: "could not serialize access due to ...",
    causes: [
      "SERIALIZABLE / REPEATABLE READ での競合",
      "トランザクションを再実行する設計が必要",
    ],
    checkSql: "-- 失敗したトランザクションを ROLLBACK し、処理をリトライする",
  },
  {
    id: "connection-refused",
    title: "接続できない",
    patterns: ["connection refused", "could not connect"],
    matchHint: "could not connect to server / Connection refused",
    causes: [
      "PostgreSQL が起動していない",
      "ホスト・ポートが違う",
      "firewall / pg_hba.conf の設定",
    ],
    checkSql: "-- サーバ側: pg_isready -h localhost -p 5432",
  },
  {
    id: "password-auth-failed",
    title: "認証失敗",
    patterns: ["password authentication failed"],
    matchHint: "password authentication failed for user ...",
    causes: [
      "ユーザー名またはパスワード違い",
      "pg_hba.conf の認証方式",
    ],
    checkSql: "-- 接続文字列の user / password / host を再確認",
  },
  {
    id: "too-many-clients",
    title: "接続数上限",
    patterns: ["too many clients", "remaining connection slots"],
    matchHint: "sorry, too many clients already",
    causes: [
      "接続プールなしで接続を開きすぎ",
      "max_connections 到達",
      "接続のクローズ漏れ",
    ],
    checkSql:
      "SHOW max_connections;\nSELECT count(*) FROM pg_stat_activity;",
  },
  {
    id: "operator-does-not-exist",
    title: "演算子が使えない",
    patterns: ["operator does not exist"],
    matchHint: "operator does not exist: ...",
    causes: [
      "型に合わない演算子（text と int の比較など）",
      "CAST が必要",
      "JSONB 演算子の書き方ミス",
    ],
    checkSql:
      "SELECT '10'::integer > 5;\nSELECT data ->> 'name' FROM docs;",
  },
  {
    id: "function-does-not-exist",
    title: "関数が存在しない",
    patterns: ["function", "does not exist"],
    matchHint: "function ... does not exist",
    causes: [
      "関数名のスペルミス",
      "引数の型が違うオーバーロードを呼んでいる",
      "拡張（extension）が未導入",
    ],
    checkSql:
      "SELECT proname, pg_get_function_identity_arguments(oid)\nFROM pg_proc\nWHERE proname ILIKE '%sum%'\nLIMIT 20;",
  },
  {
    id: "permission-schema",
    title: "スキーマ権限",
    patterns: ["permission denied for schema"],
    matchHint: "permission denied for schema ...",
    causes: [
      "スキーマへの USAGE 権限がない",
      "検索パスにスキーマがない",
    ],
    checkSql:
      "SHOW search_path;\nGRANT USAGE ON SCHEMA public TO my_user;",
  },
  {
    id: "cannot-insert-view",
    title: "ビューへ直接書けない",
    patterns: ["cannot insert into view", "not updatable"],
    matchHint: "cannot insert into view / view is not automatically updatable",
    causes: [
      "複雑なビューは自動更新できない",
      "INSTEAD OF トリガーか、元テーブルへ書く",
    ],
    checkSql:
      "SELECT table_name, is_updatable\nFROM information_schema.views\nWHERE table_schema = 'public';",
  },
  {
    id: "string-data-right-truncation",
    title: "文字列が長すぎる",
    patterns: ["value too long", "right truncation"],
    matchHint: "value too long for type character varying(...)",
    causes: [
      "VARCHAR(n) の長さを超えている",
      "列定義の見直し、または値の切り詰め",
    ],
    checkSql:
      "SELECT column_name, character_maximum_length\nFROM information_schema.columns\nWHERE table_name = 'employees';",
  },
  {
    id: "date-out-of-range",
    title: "日付が範囲外",
    patterns: ["date/time field value out of range", "out of range"],
    matchHint: "date/time field value out of range",
    causes: [
      "存在しない日付（2月30日など）",
      "ロケール・形式の解釈違い（MDY / DMY）",
    ],
    checkSql:
      "SHOW datestyle;\nSELECT to_date('2024-02-29', 'YYYY-MM-DD');",
  },
  {
    id: "infinite-recursion",
    title: "再帰が深すぎる",
    patterns: ["infinite recursion", "recursive query"],
    matchHint: "recursive query ... exceeded ... / infinite recursion",
    causes: [
      "再帰 CTE の終了条件がない",
      "循環参照を検出していない",
    ],
    checkSql:
      "WITH RECURSIVE t AS (\n  SELECT 1 AS n\n  UNION ALL\n  SELECT n + 1 FROM t WHERE n < 10\n)\nSELECT * FROM t;",
  },
  {
    id: "canceling-statement",
    title: "クエリがキャンセルされた",
    patterns: ["canceling statement due to"],
    matchHint: "canceling statement due to statement timeout / user request",
    causes: [
      "statement_timeout に到達",
      "手動キャンセル、または重いフルスキャン",
    ],
    checkSql:
      "SHOW statement_timeout;\nEXPLAIN (ANALYZE, BUFFERS)\nSELECT * FROM employees WHERE salary > 300000;",
  },
  {
    id: "could-not-determine-type",
    title: "型を決められない",
    patterns: ["could not determine data type"],
    matchHint: "could not determine data type of parameter / column",
    causes: [
      "NULL だけの式で型が不明",
      "プレースホルダの型指定が必要",
    ],
    checkSql: "SELECT NULL::integer AS id;",
  },
  {
    id: "window-function-error",
    title: "ウィンドウ関数の位置が不正",
    patterns: ["window functions are not allowed"],
    matchHint: "window functions are not allowed in WHERE / HAVING",
    causes: [
      "WHERE でウィンドウ関数を使っている",
      "サブクエリまたは CTE で先に計算する",
    ],
    checkSql:
      "SELECT *\nFROM (\n  SELECT name, RANK() OVER (ORDER BY salary DESC) AS rnk\n  FROM employees\n) t\nWHERE rnk <= 3;",
  },
  {
    id: "aggregate-not-allowed",
    title: "集計関数の位置が不正",
    patterns: ["aggregate functions are not allowed"],
    matchHint: "aggregate functions are not allowed in WHERE",
    causes: [
      "WHERE で SUM/COUNT などを使っている",
      "集計後の条件は HAVING を使う",
    ],
    checkSql:
      "SELECT department_id, COUNT(*)\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) >= 5;",
  },
  {
    id: "there-is-no-parameter",
    title: "プレースホルダ不足",
    patterns: ["there is no parameter", "bind message supplies"],
    matchHint: "there is no parameter $n",
    causes: [
      "プレースホルダ数とバインド値が一致しない",
      "動的SQLの組み立てミス",
    ],
    checkSql: "-- アプリ側のパラメータ数と SQL の $1,$2,... を照合",
  },
  {
    id: "json-error",
    title: "JSON / JSONB エラー",
    patterns: ["invalid input syntax for type json", "jsonb"],
    matchHint: "invalid input syntax for type json / cannot cast",
    causes: [
      "JSON として不正な文字列",
      "->>'key' と ->'key' の取り違え",
      "配列アクセスの書き方ミス",
    ],
    checkSql:
      "SELECT '{\"name\": \"田中\"}'::jsonb ->> 'name';",
  },
  {
    id: "array-error",
    title: "配列エラー",
    patterns: ["malformed array", "array"],
    matchHint: "malformed array literal / cannot access element",
    causes: [
      "配列リテラルの書き方が違う",
      "添字は 1 始まり",
      "ANY / @> の使い分け",
    ],
    checkSql:
      "SELECT ARRAY[1,2,3] AS nums;\nSELECT * FROM employees WHERE department_id = ANY(ARRAY[1,2,3]);",
  },
  {
    id: "lock-not-available",
    title: "ロック取得できない",
    patterns: ["could not obtain lock", "lock timeout"],
    matchHint: "could not obtain lock on row / canceling statement due to lock timeout",
    causes: [
      "他トランザクションが行をロック中",
      "長いトランザクションが残っている",
    ],
    checkSql:
      "SELECT pid, locktype, relation::regclass, mode, granted\nFROM pg_locks\nWHERE NOT granted;",
  },
  {
    id: "role-not-exist",
    title: "ロールが存在しない",
    patterns: ["role", "does not exist"],
    matchHint: 'role "..." does not exist',
    causes: [
      "ユーザー名のスペルミス",
      "CREATE ROLE していない",
    ],
    checkSql: "SELECT rolname FROM pg_roles ORDER BY 1;",
  },
  {
    id: "database-not-exist",
    title: "データベースが存在しない",
    patterns: ["database", "does not exist"],
    matchHint: 'database "..." does not exist',
    causes: [
      "DB名のスペルミス",
      "別クラスタ / 別ポートに接続している",
    ],
    checkSql: "-- psql -l でデータベース一覧を確認",
  },
  {
    id: "column-specified-more",
    title: "列が重複指定",
    patterns: ["specified more than once"],
    matchHint: "column ... specified more than once",
    causes: [
      "INSERT / UPDATE で同じ列を複数回書いている",
      "SELECT の別名がぶつかり CREATE TABLE AS で失敗",
    ],
    checkSql:
      "INSERT INTO employees (employee_id, employee_name)\nVALUES (1, '田中');",
  },
  {
    id: "insert-has-more-expressions",
    title: "INSERT の列数不一致",
    patterns: ["insert has more expressions", "insert has more target columns"],
    matchHint: "INSERT has more expressions than target columns",
    causes: [
      "列リストと VALUES の個数が違う",
      "カンマの余分・不足",
    ],
    checkSql:
      "INSERT INTO employees (employee_id, employee_name, salary)\nVALUES (1, '田中', 300000);",
  },
  {
    id: "cannot-coerce",
    title: "型を変換できない",
    patterns: ["cannot cast", "cannot coerce"],
    matchHint: "cannot cast type ... to ...",
    causes: [
      "互換のない型同士の CAST",
      "段階的な変換（text 経由など）が必要",
    ],
    checkSql: "SELECT '123'::text::integer;",
  },
  {
    id: "permission-sequence",
    title: "シーケンス権限",
    patterns: ["permission denied for sequence"],
    matchHint: "permission denied for sequence ...",
    causes: [
      "SERIAL / IDENTITY 利用にシーケンス権限が必要",
      "USAGE, SELECT を GRANT する",
    ],
    checkSql:
      "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO my_user;",
  },
  {
    id: "duplicate-table",
    title: "テーブルが既にある",
    patterns: ["already exists", "relation"],
    matchHint: 'relation "..." already exists',
    causes: [
      "同名テーブルが既にある",
      "CREATE TABLE IF NOT EXISTS を検討",
      "別名や DROP が必要",
    ],
    checkSql:
      "SELECT to_regclass('public.employees');",
  },
  {
    id: "not-null-violation-update",
    title: "UPDATE で NOT NULL 違反",
    patterns: ["null value", "not-null constraint"],
    matchHint: "null value in column ... violates not-null constraint",
    causes: [
      "SET で NULL を入れている",
      "DEFAULT なしの必須列を空にしている",
    ],
    checkSql:
      "UPDATE employees\nSET employee_name = '田中'\nWHERE employee_id = 1;",
  },
  {
    id: "invalid-regular-expression",
    title: "正規表現が不正",
    patterns: ["invalid regular expression"],
    matchHint: "invalid regular expression",
    causes: [
      "~ 演算子のパターンが不正",
      "エスケープ不足",
    ],
    checkSql: "SELECT 'abc' ~ '^[a-z]+$';",
  },
  {
    id: "character-not-in-repertoire",
    title: "エンコーディングエラー",
    patterns: ["character", "encoding", "repertoire"],
    matchHint: "character ... is not in repertoire / encoding error",
    causes: [
      "クライアントとサーバの文字コード不一致",
      "不正なバイト列を text に入れている",
    ],
    checkSql: "SHOW client_encoding;\nSHOW server_encoding;",
  },
  {
    id: "permission-denied-database",
    title: "DB 作成・接続権限",
    patterns: ["permission denied to create database", "not permitted to log in"],
    matchHint: "permission denied to create database / not permitted to log in",
    causes: [
      "CREATEROLE / CREATEDB 属性がない",
      "ロールに LOGIN がない",
    ],
    checkSql:
      "SELECT rolname, rolsuper, rolcreatedb, rolcanlogin\nFROM pg_roles\nWHERE rolname = current_user;",
  },
  {
    id: "undefined-column-order",
    title: "ORDER BY の列がない",
    patterns: ["column", "does not exist"],
    matchHint: "ORDER BY / SELECT の別名まわりで column does not exist",
    causes: [
      "SELECT 別名を WHERE で使っている（WHERE では別名不可）",
      "ORDER BY は別名可、WHERE は不可",
    ],
    checkSql:
      "SELECT employee_name AS name\nFROM employees\nORDER BY name;",
  },
  {
    id: "cannot-use-aggregate",
    title: "DISTINCT と ORDER BY",
    patterns: ["for select distinct", "order by expressions must appear"],
    matchHint: "for SELECT DISTINCT, ORDER BY expressions must appear in select list",
    causes: [
      "DISTINCT 時、ORDER BY の式が SELECT リストにない",
    ],
    checkSql:
      "SELECT DISTINCT department_id\nFROM employees\nORDER BY department_id;",
  },
];
