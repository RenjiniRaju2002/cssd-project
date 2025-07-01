const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const dataDir = path.join(__dirname, 'src', 'data');

// List of all data files and their routes
const files = [
  'issueItemData',
  'receiveItemsData',
  'sterilizationProcessData',
  'workflowTrackingData',
  'surgeryReportFormData',
  'stockManagementData',
  'requestManagementData',
  'dashboardData'
];

files.forEach((file) => {
  const filePath = path.join(dataDir, `${file}.json`);
  const route = `/api/${file}`;

  // GET all
  app.get(route, (req, res) => {
    try {
      const data = fs.readFileSync(filePath);
      res.json(JSON.parse(data));
    } catch (err) {
      res.status(500).json({ error: 'Failed to read data.' });
    }
  });

  // POST (add new)
  app.post(route, (req, res) => {
    try {
      const data = JSON.parse(fs.readFileSync(filePath));
      data.push(req.body);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      res.status(201).json(req.body);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add data.' });
    }
  });

  // PUT (update by id)
  app.put(`${route}/:id`, (req, res) => {
    try {
      const data = JSON.parse(fs.readFileSync(filePath));
      const idx = data.findIndex(item => item.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Item not found.' });
      data[idx] = { ...data[idx], ...req.body };
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      res.json(data[idx]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update data.' });
    }
  });

  // DELETE (remove by id)
  app.delete(`${route}/:id`, (req, res) => {
    try {
      let data = JSON.parse(fs.readFileSync(filePath));
      const idx = data.findIndex(item => item.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Item not found.' });
      const removed = data.splice(idx, 1);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      res.json(removed[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete data.' });
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
}); 