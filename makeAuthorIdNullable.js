const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('prisma/dev.db');

db.serialize(() => {
  db.run('PRAGMA foreign_keys=off;');
  db.run('BEGIN TRANSACTION;');
  db.run(`CREATE TABLE comments_new AS SELECT * FROM comments;`);
  db.run(`DROP TABLE comments;`);
  db.run(`CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT 0,
    postId TEXT NOT NULL,
    authorId TEXT,
    parentId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE CASCADE
  );`);
  db.run(`INSERT INTO comments (id, content, approved, postId, authorId, parentId, createdAt, updatedAt) SELECT id, content, approved, postId, authorId, parentId, createdAt, updatedAt FROM comments_new;`);
  db.run('DROP TABLE comments_new;');
  db.run('COMMIT;');
  db.run('PRAGMA foreign_keys=on;');
  db.close();
  console.log('comments table altered: authorId is now nullable.');
});
