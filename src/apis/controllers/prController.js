const prService = require('../../services/prService');

class PrController {
    async createPr(req, res) {
        try {
          const pr = await prService.createPr(req.body);
          res.status(201).json({ message: 'Performance reviews create successfully', pr });
        } catch (error) {
          res.status(400).json({ message: 'Performance reviews create failed', error: error.message });
        }
      }

    async getPr(req, res) {
        try {
            const pr = await prService.getAllPerformance_reviews();
            res.status(200).json(pr);
        } catch (error) {
            res.status(400).json({ message: 'Failed to get performance reviews', error: error.message });
        }
    }

    async getPrById(req, res) {
        try {
            const pr = await prService.getPerformance_reviewsById(req.params.id);
            res.status(200).json(pr);
        } catch (error) {
            res.status(400).json({ message: 'Failed to get performance reviews', error: error.message });
        }
    }

    async getPrByMultipleFields(req, res) {
        try {
            const pr = await prService.getPrByMultipleFields(req.body.fields);
            res.status(200).json(pr);
        } catch (error) {
            res.status(400).json({ message: 'Failed to get performance reviews', error: error.message });
        }
    }

    async getPrByUserId(req, res) {
        try {
            const pr = await prService.getPerformance_reviewsByUserId(req.params.user_id);
            res.status(200).json(pr);
        } catch (error) {
            res.status(400).json({ message: 'Failed to get performance reviews', error: error.message });
        }
    }

    async getPrByReviewerId(req, res) {
        try {
            const pr = await prService.getPerformance_reviewsByReviewerId(req.params.reviewer_id);
            res.status(200).json(pr);
        } catch (error) {
            res.status(400).json({ message: 'Failed to get performance reviews', error: error.message });
        }
    }

    async getMonthlyStats(req, res) {
        try {
            const year = parseInt(req.params.year);
            const month = parseInt(req.params.month);
            const stats = await prService.getMonthlyPerformanceStats(year, month);
            res.status(200).json(stats);
        } catch (error) {
            res.status(400).json({ message: 'Failed to get monthly stats', error: error.message });
        }
    }

    async getQuarterlyStats(req, res) {
        try {
            const year = parseInt(req.params.year);
            const quarter = parseInt(req.params.quarter);
            const stats = await prService.getQuarterlyPerformanceStats(year, quarter);
            res.status(200).json(stats);
        } catch (error) {
            res.status(400).json({ message: 'Failed to get quarterly stats', error: error.message });
        }
    }

    async getYearlyStats(req, res) {
        try {
            const year = parseInt(req.params.year);
            const stats = await prService.getYearlyPerformanceStats(year);
            res.status(200).json(stats);
        } catch (error) {
            res.status(400).json({ message: 'Failed to get yearly stats', error: error.message });
        }
    }

    async updatePr(req, res) {
        try {
            const pr = await prService.updatePerformance_reviews(req.params.id, req.body);
            res.status(200).json(pr);
        } catch (error) {
            res.status(400).json({ message: 'Failed to update performance reviews', error: error.message });
        }
    }

    async deletePr(req, res) {
        try {
            await prService.deletePerformance_reviews(req.params.id);
            res.status(200).json({ message: 'Performance reviews deleted successfully' });
        } catch (error) {
            res.status(400).json({ message: 'Failed to delete performance reviews', error: error.message });
        }
    }
}

module.exports = PrController;