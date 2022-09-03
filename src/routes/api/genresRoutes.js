const express = require('express');
const router = express.Router();
const genresController = require('../../controllers/api/genresController');



/* /api/genres */
router.get('/', genresController.list);
router.get('/name/:name', genresController.name);
router.get('/:id', genresController.detail);


module.exports = router;