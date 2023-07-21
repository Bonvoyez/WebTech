const sqlite = require('sqlite3').verbose();
let db = my_database('./gallery.db');
const defaultDB = my_database('./defaultGallery.db')

var express = require("express");
var app = express();
var cors = require('cors');

app.use(cors());
app.use(express.json());

app.get('/receive', function(req, res) {
	db.all(`SELECT * FROM gallery`, function(err, rows) {
		if(err) {
			return res.status(500).json({error: err.message});
		}
		return res.status(200).json(rows);
    });
});

app.get('/receive/:id', function(req, res) {
	db.all(`SELECT * FROM gallery WHERE id=` + req.params.id, function(err, rows) {
		if(err) {
			return res.status(500).json({error: err.message});
		}
		return res.status(200).json(rows);
    });
});

app.delete('/reset', function(req, res) {
  db.run("DELETE FROM gallery", function(err) {
    if (err) {
      return res.status(500).json({error: "Failed to delete data from gallery"});
    }
    defaultDB.all(`SELECT * FROM gallery`, function(err, rows) {
      if (err) {
        return res.status(500).json({error: "Failed to retrieve data from defaultDB"});
      }
      db.serialize(function() {
        db.run("BEGIN TRANSACTION");
        var count = 0;
        rows.forEach(function(row) {
          db.run(
            `INSERT INTO gallery (author, alt, tags, image, description) VALUES (?, ?, ?, ?, ?)`,
            [row.author, row.alt, row.tags, row.image, row.description],
            function(err) {
              if (err) {
                return res.status(500).json({ error: "Failed to insert data into gallery" });
              }
              count++;
              if (count === rows.length) {
                db.run("COMMIT", function(err) {
                  if (err) {
                    return res.status(500).json({ error: "Failed to commit transaction" });
                  }
                  res.status(200).end();
                });
              }
            }
          );
        });
      });
    });
  });
});

app.delete('/delete/:id', function(req, res) {
	db.run("DELETE FROM gallery WHERE id=" + req.params.id, function(err) {
		if(err) {
			return res.status(500).json({error: err.message});
		}
	});
	res.status(204).end();
});

app.post('/submit', function(req, res) {
	let item = req.body;
    db.run(`INSERT INTO gallery (author, alt, tags, image, description) VALUES (?, ?, ?, ?, ?)`,
		[item.author, item.alt, item.tags, item.image,  item.description], function(err){
		if(err) {
			return res.status(500).json({error: err.message});
		}		
	});
    res.status(201).end();
});

app.put('/item/:id', function(req, res)
{
	let item = req.body;
	db.run(`UPDATE gallery SET author=?, alt=?, tags=?, image=?, description=? WHERE id=` + req.params.id,
            [item.author, item.alt, item.tags, item.image,  item.description], function(err){
		if(err) {
			return res.status(500).json({error: err.message});
		}
	});
	res.status(200).end();
});

app.listen(3000);
console.log("Your Web server should be up and running, waiting for requests to come in. Try http://localhost:3000/hello");


function my_database(filename) {
	// Conncect to db by opening filename, create filename if it does not exist:
	var db = new sqlite.Database(filename, (err) => {
  		if (err) {
			console.error(err.message);
  		}
  		console.log('Connected to the phones database.');
	});
	// Create our phones table if it does not exist already:
	db.serialize(() => {
		db.run(`
        	CREATE TABLE IF NOT EXISTS gallery
        	 (
                    id INTEGER PRIMARY KEY,
                    author CHAR(100) NOT NULL,
                    alt CHAR(100) NOT NULL,
                    tags CHAR(256) NOT NULL,
                    image char(2048) NOT NULL,
                    description CHAR(1024) NOT NULL
		 )
		`);
		db.all(`select count(*) as count from gallery`, function(err, result) {
			if (result[0].count == 0) {
				db.run(`INSERT INTO gallery (author, alt, tags, image, description) VALUES (?, ?, ?, ?, ?)`, [
        			"Tim Berners-Lee",
        			"Image of Berners-Lee",
        			"html,http,url,cern,mit",
        			"https://upload.wikimedia.org/wikipedia/commons/9/9d/Sir_Tim_Berners-Lee.jpg",
        			"The internet and the Web aren't the same thing."
    				]);
				db.run(`INSERT INTO gallery (author, alt, tags, image, description) VALUES (?, ?, ?, ?, ?)`, [
        			"Grace Hopper",
        			"Image of Grace Hopper at the UNIVAC I console",
        			"programming,linking,navy",
        			"https://upload.wikimedia.org/wikipedia/commons/3/37/Grace_Hopper_and_UNIVAC.jpg",
				"Grace was very curious as a child; this was a lifelong trait. At the age of seven, she decided to determine how an alarm clock worked and dismantled seven alarm clocks before her mother realized what she was doing (she was then limited to one clock)."
    				]);
				console.log('Inserted dummy photo entry into empty database');
			} else {
				console.log("Database already contains", result[0].count, " item(s) at startup.");
			}
		});
	});
	return db;
}
