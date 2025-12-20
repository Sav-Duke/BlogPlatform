const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('prisma/dev.db');

db.serialize(() => {
  db.run('ALTER TABLE posts ADD COLUMN scheduledTaskId TEXT;', (err) => {
    if (err) {
      console.error('Error:', err.message);
      db.close();
    } else {
      console.log('Column scheduledTaskId added successfully.');
      db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_scheduledTaskId ON posts(scheduledTaskId);', (err2) => {
        if (err2) {
          console.error('Error creating unique index:', err2.message);
        } else {
          console.log('Unique index on scheduledTaskId created successfully.');
        }
        db.close();
      });
    }
  });
});
