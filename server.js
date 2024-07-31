const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const connection = require('./db'); // Ensure this path is correct
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());
// Login route



app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log("Received login attempt:", username, password);
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
  
    try {
      // Query to find user by username
      connection.query('SELECT * FROM demo_auth WHERE us_nm = ?', [username], async (err, results) => {
        if (err) {
          console.error('Database query error:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
  
        if (results.length === 0) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
  
        const user = results[0];
        //const hashedPassword = user.psd; // This should be the hashed password stored in your database
        const storedPassword = user.psd;
        // Compare the provided password with the hashed password
        try {
         // const match = await bcrypt.compare(password, hashedPassword);
  
          if (password === storedPassword) {
            res.status(200).json({ message: 'Login Successful' });
          } else {
            res.status(401).json({ message: 'Invalid credentials' });
          }
        } catch (compareErr) {
          console.error('Error comparing passwords:', compareErr);
          res.status(500).json({ message: 'Internal server error' });
        }
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

//////////////////////////////////////////////////////////////////////////////////

app.get("/api/getLoginData", (req, res) => {
    const sql = "SELECT * FROM demo_auth";
    connection.query(sql,(err, results) => {
      if (err) {
        console.error("Error fetching Entries: ", err);
        res.status(500).send("Error fetching Entries");
        return;
      }
      console.log(results);
      res.json(results);
    });
  });

//////////////////////////////////////////////////////////

// Register route
app.post('/api/register', async (req, res) => {
    const { username, password, email, phone, address, dob } = req.body;
    console.log("Received register attempt:", username, password, email, phone, address, dob);
  
    if (!username || !password || !email || !phone || !address || !dob) {
      return res.status(400).json({ message: 'All fields are required' });
    }

      try {
        const sql = "INSERT INTO demo_auth (us_nm, psd, email, mob, dob, addr) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [username, password, email, phone, dob,address];
        // Execute the query
        connection.query(sql, values, (err, result) => {
          if (err) {
            console.error("Error Register data:", err);
          } else {
            res.status(200).json({ message: 'Registration successfully' });
            console.log("Registration successfully");
          }
        });
  
    } catch (err) {
      console.error('Error during registration:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


// DELETE route to delete login data by ID
app.delete('/api/deleteLoginData/:id', (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters

  const query = 'DELETE FROM demo_auth WHERE log_id = ?';
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.status(200).json({ message: 'Data deleted successfully' });
  });
});



app.put('/api/updateLoginData/:id', (req, res) => {
  const { id } = req.params;
  const { us_nm, psd, mob, dob, addr } = req.body;

  const sql = 'UPDATE demo_auth SET us_nm = ?, psd = ?, mob = ?, dob = ?, addr = ? WHERE log_id = ?';
  connection.query(sql, [us_nm, psd, mob, dob, addr, id], (err, results) => {
    if (err) {
      console.error('Error updating data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ message: 'Data updated successfully', results });
  });
});



/////////////////////////////////////////////////////////////////////////
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
