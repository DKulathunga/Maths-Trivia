How to run the Maths-Trivia project locally (WAMP)

Prerequisites:

- WAMP installed and running (Apache + MySQL). Tray icon should be green.

1. Start WAMP and confirm services are running.

2. Create the database and tables.

- Option A (phpMyAdmin):

  - Open `http://localhost/phpmyadmin/`.
  - Click the `SQL` tab, open the file `sql/schema.sql` in an editor, paste its contents into phpMyAdmin, and run it.

- Option B (CLI):

  - Open PowerShell and run:
    ```powershell
    mysql -u root -p
    ```
  - Paste the contents of `sql/schema.sql` and run.

- Option C (automatic):
  - Open `http://localhost/projects/Maths-Trivia/php/setup_db.php` in your browser. The script will create the database and tables.

3. Confirm `php/db_connect.php` has correct DB credentials (defaults assume `root` without password):

   - `servername = "localhost"`
   - `username = "root"`
   - `password = ""`
   - `dbname = "fruit_math_db"`

4. Open the app in your browser:

   - `http://localhost/projects/Maths-Trivia/` or `http://localhost/projects/Maths-Trivia/index.php`

5. Test:
   - Register a new user and log in.
   - Play a game; on end, the score should be saved to the `scores` table.
   - Open `php/get_leaderboard.php` or the leaderboard UI to verify entries.

Troubleshooting:

- If DB connection fails, edit `php/db_connect.php` to match your MySQL credentials.
- Ensure `mysqli` extension is enabled in PHP (WAMP settings).
- Check Apache/PHP logs via WAMP tray for errors.
