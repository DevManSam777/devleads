const express = require('express');
const router = express.Router();
const hitlistController = require('../controllers/hitlistController');
const businessController = require('../controllers/businessController');

// Hitlist routes
router.get('/', hitlistController.getHitlists);
router.get('/:id', hitlistController.getHitlistById);
router.post('/', hitlistController.createHitlist);
router.put('/:id', hitlistController.updateHitlist);
router.delete('/:id', hitlistController.deleteHitlist);

// Business routes (nested under hitlists)
router.get('/:hitlistId/businesses', businessController.getBusinessesByHitlist);
router.post('/:hitlistId/businesses', businessController.createBusiness);
router.put('/businesses/:id', businessController.updateBusiness);
router.delete('/businesses/:id', businessController.deleteBusiness);

module.exports = router;