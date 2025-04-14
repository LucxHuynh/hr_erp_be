const express = require('express');
const PrController = require('../controllers/prController');

const router = express.Router();
const prController = new PrController();

router.post('/createPr', prController.createPr);
router.delete('/deletePr', prController.deletePr);
router.put('/updatePr', prController.updatePr);
router.get('/performance-reviews', prController.getPr);
router.get('/search/:id', prController.getPrById);
router.get('/search/user/:user_id', prController.getPrByUserId);
router.get('/search/reviewer/:reviewer_id', prController.getPrByReviewerId);
router.get('/search/monthly/:year/:month', prController.getPrByReviewerId);
router.get('/search/quarterly/:year/:quarter', prController.getPrByReviewerId);
router.get('/search/yearly/:year', prController.getPrByReviewerId);

module.exports = router;