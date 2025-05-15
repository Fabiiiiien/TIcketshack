var express = require("express");
var router = express.Router();
const fs = require('fs')
const { Client } = require('pg');
const connectionString = process.env.CONNEXIONSTRING

const client = new Client({
  connectionString, ssl: {
    ca: fs.readFileSync('./ca.pem').toString(),
    },
});

client.connect().then(() => {
  console.log("Connected to PostgreSQL database");
}
).catch(err => {
  console.error("Connection error", err.stack);
}
);

router.get("/tickets", async (req, res) => {



  try {
    // Requête pour trouver les billets correspondants dans la table "tickets"
    const query = `
      SELECT * FROM tickets

    `;

    const result = await client.query(query);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});



router.get("/tickets/:departure/:arrival/:date", (req, res) => {
  const { departure, arrival, date } = req.params;

  if (!departure || !arrival || !date) {
    return res.status(400).send("Please provide departure, arrival, and date.");
  }

  const query = `
    SELECT * FROM tickets
    WHERE LOWER(departure) = LOWER($1)
    AND LOWER(arrival) = LOWER($2)
    AND date::date = $3
  `;
  const values = [departure, arrival, date];

  client.query(query, values)
    .then(result => {
      if (result.rows.length === 0) {
        res.status(404).send("No tickets found.");
      } else {
        res.json(result.rows);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Server error");
    });
});





module.exports = router;
