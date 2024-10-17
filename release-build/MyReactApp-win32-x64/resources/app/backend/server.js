const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'LEAP',
  password: 'admin',
  port: 5432,
});

// Endpoint to fetch data from 'sections' table
app.get('/api/sections', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sections');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// End point to get engagements
app.get('/api/engagements/:id', async (req, res) => {

  console.log('Attempting to engagements')
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM engagements WHERE sectionid = $1', [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// General Engagement Endpoint 
app.get('/api/engagements', async (req, res) => {

  try {
    const result = await pool.query('SELECT * FROM engagements');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Endpoint to get tactics
app.get('/api/tactics/:id', async (req, res) => {
  console.log('Attempting to retrieve tactics')
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM tactics WHERE engagementid = $1', [id]);

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Endpoint to fetch data from 'units' table

app.get('/api/units/sectionNullandAllianceSort', async (req, res) => {
  const sectionid = req.query.sectionid;
  const isFriendly = req.query.isFriendly
  try {
    const result = await pool.query('SELECT * FROM units WHERE (section = $1 OR section IS NULL) AND "isFriendly" = $2', [sectionid, isFriendly]);
    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/units/sectionSort', async (req, res) => {
  const sectionid = req.query.sectionid;
  try {
    const result = await pool.query('SELECT * FROM units WHERE section = $1 AND "isFriendly" = true', [sectionid]);
    res.json(result.rows);
  } catch (err) {
    console.error('sectionid: ', [sectionid]);
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


app.get('/api/units/enemyUnits', async (req, res) => {
  const sectionid = req.query.sectionid;
  try {
    const result = await pool.query('SELECT * FROM units WHERE section = $1 AND "isFriendly" = false AND "unit_health" != 0', [sectionid]);
    res.json(result.rows);
  } catch (err) {
    console.error('sectionid: ', [sectionid]);
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/units', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM units');
    res.json(result.rows);
  } catch (err) {
    console.error('sectionid: ', [sectionid]);
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// GET request to fetch a specific section by ID
app.get('/api/sections/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM sections WHERE sectionid = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Assuming sectionid is unique, return the first (and only) result
    } else {
      res.status(404).json({ message: 'Section not found' });
    }
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.delete('/api/sections/:id', async (req, res) => {
  const { id } = req.params;
  console.log("Deleting", id);
  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    const deleteQuery = 'DELETE FROM sections WHERE sectionid = $1';
    const result = await client.query(deleteQuery, [id]);
    await client.query('COMMIT');
    client.release();
    res.status(200).json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/sections', async (req, res) => {
  const { sectionid, isonline } = req.body; // Assuming body-parser or express.json() middleware is used

  try {
    // Insert into database
    const result = await pool.query('INSERT INTO sections (sectionid, isonline) VALUES ($1, $2) RETURNING *', [sectionid, isonline]);

    // Respond with the newly created section data
    res.status(201).json(result.rows[0]); // 201 status code for resource creation
  } catch (error) {
    console.error('Error creating new section:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to update the isonline status of a section
app.put('/api/sections/:id', async (req, res) => {
  const { id } = req.params;
  const { isonline } = req.body;

  try {
    const result = await pool.query('UPDATE sections SET isonline = $1 WHERE sectionid = $2 RETURNING *', [
      isonline,
      id,
    ]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Respond with updated section data
    } else {
      res.status(404).json({ message: 'Section not found' });
    }
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to create an engagement
app.post('/api/engagements', async (req, res) => {
  const {
    SectionID,
    FriendlyID,
    EnemyID,
    FriendlyBaseScore,
    EnemyBaseScore,
    FriendlyTacticsScore,
    EnemyTacticsScore,
    FriendlyTotalScore,
    EnemyTotalScore,
    isWin
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO engagements 
      (sectionid, friendlyid, enemyid, friendlybasescore, enemybasescore, 
       friendlytacticsscore, enemytacticsscore, friendlytotalscore, enemytotalscore, iswin) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        SectionID,
        FriendlyID,
        EnemyID,
        FriendlyBaseScore,
        EnemyBaseScore,
        FriendlyTacticsScore,
        EnemyTacticsScore,
        FriendlyTotalScore,
        EnemyTotalScore,
        isWin
      ]
    );

    res.json(result.rows[0]); // Respond with the newly created engagement data
  } catch (error) {
    console.error('Error creating new engagement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to make record tactics
app.post('/api/tactics', async (req, res) => {

  console.log("Attempting to store tactics record")
  const {
    FriendlyAwareness, EnemyAwareness,
    FriendlyLogistics, EnemyLogistics, FriendlyCoverage, EnemyCoverage,
    FriendlyGPS, EnemyGPS, FriendlyComms, EnemyComms, FriendlyFire,
    EnemyFire, FriendlyPattern, EnemyPattern
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO Tactics (FriendlyAwareness, EnemyAwareness, FriendlyLogistics, EnemyLogistics, FriendlyCoverage, EnemyCoverage,
       FriendlyGPS, EnemyGPS, FriendlyComms, EnemyComms, FriendlyFire, EnemyFire, FriendlyPattern, EnemyPattern)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        FriendlyAwareness, EnemyAwareness, FriendlyLogistics,
        EnemyLogistics, FriendlyCoverage, EnemyCoverage, FriendlyGPS, EnemyGPS,
        FriendlyComms, EnemyComms, FriendlyFire, EnemyFire, FriendlyPattern, EnemyPattern
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error recording tactics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/unitTactics/update', async (req, res) => {
  const {
    awareness,
    logistics,
    coverage,
    gps,
    comms,
    fire,
    pattern,
    ID
  } = req.body;

  try {
    // Check if the record exists
    const checkQuery = `
      SELECT * FROM unit_tactics WHERE "ID" = $1;
    `;
    const checkValues = [ID];
    const checkResult = await pool.query(checkQuery, checkValues);

    if (checkResult.rows.length === 0) {
      // Insert a new record if it doesn't exist
      const insertQuery = `
        INSERT INTO unit_tactics ("ID", awareness, logistics, coverage, gps, comms, fire, pattern)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      const insertValues = [
        ID,
        awareness,
        logistics,
        coverage,
        gps,
        comms,
        fire,
        pattern
      ];

      const insertResult = await pool.query(insertQuery, insertValues);
      res.status(201).json(insertResult.rows[0]); // Return the newly inserted record
    } else {
      // Update the existing record
      const updateQuery = `
        UPDATE unit_tactics
        SET awareness = $1,
            logistics = $2,
            coverage = $3,
            gps = $4,
            comms = $5,
            fire = $6,
            pattern = $7
        WHERE "ID" = $8
        RETURNING *;
      `;
      const updateValues = [
        awareness,
        logistics,
        coverage,
        gps,
        comms,
        fire,
        pattern,
        ID
      ];

      const updateResult = await pool.query(updateQuery, updateValues);
      res.status(200).json(updateResult.rows[0]); // Return the updated record
    }

  } catch (error) {
    console.error('Error updating unit tactics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET endpoint to fetch unit tactics by ID
app.get('/api/unitTactics/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Query to fetch unit tactic by ID
    const query = `
      SELECT * FROM unit_tactics WHERE "ID" = $1;
    `;
    const values = [id];

    const result = await pool.query(query, values);

    // Check if record exists
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Unit tactics not found' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error fetching unit tactics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.put('/api/units/update', async (req, res) => {
  const {
    parent_id,
    unit_id,
    unit_type,
    unit_health,
    role_type,
    unit_size,
    force_posture,
    force_readiness,
    force_skill,
    section_id,
    root
  } = req.body;

  console.log(parent_id, unit_id);
  try {
    // Update unit details
    const updateQuery = `
      UPDATE units
      SET unit_type = $1,
          unit_health = $2,
          role_type = $3,
          unit_size = $4,
          force_posture = $5,
          force_readiness = $6,
          force_skill = $7,
          section = $8,
          root = $9
      WHERE id = $10
      RETURNING *;
    `;
    const updateValues = [
      unit_type,
      unit_health,
      role_type,
      unit_size,
      force_posture,
      force_readiness,
      force_skill,
      section_id,
      root,
      unit_id,
    ];

    const updateResult = await pool.query(updateQuery, updateValues);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    // Append child to parent's children array
    const appendQuery = `
    UPDATE units
    SET children = array_append(children, (
      SELECT unit_id
      FROM units
      WHERE id = $1
    ))
    WHERE id = $2;
  `;

    const appendValues = [
      unit_id,  // Child unit_id to find the name
      parent_id // Parent unit_id
    ];

    await pool.query(appendQuery, appendValues);

    res.json(updateResult.rows[0]); // Return the updated unit details
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/units/remove', async (req, res) => {
  const { section, isFriendly } = req.body;
  console.log(`Received request to remove section: ${section} with isFriendly: ${isFriendly}`);

  try {
    // Update unit details
    const updateQuery = `
      UPDATE units
      SET children = '{}',
          unit_health = 100,
          root = false,
          section = null
      WHERE section = $1 AND "isFriendly" = $2
    `;
    const updateValues = [section, isFriendly];

    const updateResult = await pool.query(updateQuery, updateValues);

    if (updateResult.rowCount > 0) {
      console.log(`Successfully updated units for section: ${section} with isFriendly: ${isFriendly}`);
      res.status(200).json({ success: true });
    } else {
      console.log(`No units found for section: ${section} with isFriendly: ${isFriendly}`);
      res.status(404).json({ success: false, message: 'No units found' });
    }
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Endpoint to update the health of a unit
// app.put('/api/units', async (req, res) => {
//   const { id, health } = req.body; // Get id from request body

//   try {
//     const result = await pool.query('UPDATE units SET unit_health = $1 WHERE id = $2 RETURNING *', [
//       health,
//       id,
//     ]);

//     if (result.rows.length > 0) {
//       res.json(result.rows[0]); // Respond with updated unit data
//     } else {
//       res.status(404).json({ message: 'Unit not found' });
//     }
//   } catch (error) {
//     console.error('Error updating unit health:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


app.put('/api/units/health', async (req, res) => {
  const { id, newHealth } = req.body; // Ensure request body contains id and newHealth

  try {
    const result = await pool.query('UPDATE units SET unit_health = $1 WHERE id = $2 RETURNING *', [
      newHealth,
      id,
    ]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Respond with updated unit data
    } else {
      res.status(404).json({ message: 'Unit not found' });
    }
  } catch (error) {
    console.error('Error updating unit health:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to add a new unit
app.post('/api/newunit', async (req, res) => {
  const { unit_id, is_friendly } = req.body;

  console.log('Received request to create unit:', req.body); // Log the request body

  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO units (unit_id, "isFriendly", children) VALUES ($1, $2, $3) RETURNING *',
      [unit_id, is_friendly, '{}']
    );

    console.log('Unit created:', result.rows[0]); // Log the created unit

    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating unit:', error); // Log the error
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sectionlessunits', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, unit_id FROM units WHERE section IS NULL');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to delete a unit by its ID
app.delete('/api/units/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Deleting unit with id:', id);
  
  try {
    // Step 1: Delete from unit_tactics table
    const deleteTacticsQuery = 'DELETE FROM unit_tactics WHERE "ID" = $1';
    await pool.query(deleteTacticsQuery, [id]);
    
    // Step 2: Delete from units table
    const deleteUnitsQuery = 'DELETE FROM units WHERE id = $1';
    const deleteResult = await pool.query(deleteUnitsQuery, [id]);

    if (deleteResult.rowCount > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Unit not found' });
    }
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});