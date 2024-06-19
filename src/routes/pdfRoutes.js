// routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const PdfData = require('../models/pdfData');


router.post('/parse-pdf', pdfController.parseAndSavePdf);


// router.get('/autocomplete', async (req, res) => {
//     try {
//       const query = req.query.q; 
  
//       // Perform search using the $search aggregation stage
//       const results = await PdfData.aggregate([
//         {
//           $search: {
//             index: "default123", 
//             autocomplete: {
//               query: query,
//               path: {
//                 wildcard: "*" 
//               }, 
//               fuzzy: {
//                 maxEdits: 2 
//               }
//             }
//           }
//         },
//         {
//           $project: {
//             _id: 1,
//             skills: 1,
//             title: 1,
//             text: 1,
//           }
//         },
//         {
//           $limit: 10 
//         }
//       ]);
  
//       res.json(results); // Send the search results as JSON response
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });

router.get('/search', async (req, res) => {
    try {
      const query = req.query.q; 
  
      
      const results = await PdfData.aggregate([
        {
          $search: {
            index: "default", 
            text: {
              query: query,
              path: {
                wildcard: "*" 
              }
            }
          }
        },
        {
          $project: {
            title: 1,
            text: 1,
            skills: 1,
            score: { $meta: "searchScore" } 
          }
        }
      ]);
  
      res.json(results); 
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/resume/:id', async (req, res) => {
    try {
      const resume = await PdfData.findById(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      res.json(resume);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;
