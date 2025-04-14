const Performance_reviews = require("../models/performance_reviews");

const prService = {
  createPr: async (PrData) => {
    const pr = await Performance_reviews.create(PrData);
    return pr;
  },

  getAllPerformance_reviews: async () => {
    const pr = await Performance_reviews.findAll();
    return pr;
  },

  getPerformance_reviewsById: async (id) => {
    const pr = await Performance_reviews.findByPk(id);
    return pr;
  },

  getPerformance_reviewsByUserId: async (user_id) => {
    const pr = await Performance_reviews.findAll({ where: { user_id } });
    return pr;
  },

  getPerformance_reviewsByReviewerId: async (reviewer_id) => {
    const pr = await Performance_reviews.findAll({ where: { reviewer_id } });
    return pr;
  },

  getMonthlyPerformanceStats: async (year, month) => {
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59); // Ngày cuối tháng
        const stats = await PerformanceReview.findAll({
            where: {
                createdAt: {
                    [Sequelize.Op.between]: [startDate, endDate],
                },
            },
        });
        return stats;
    } catch (error) {
        console.error("Error getting monthly performance stats:", error);
        throw error;
    }
  },

  getQuarterlyPerformanceStats: async (year, quarter) => {
      try {
          let startMonth, endMonth;
          switch (quarter) {
              case 1: startMonth = 0; endMonth = 2; break;
              case 2: startMonth = 3; endMonth = 5; break;
              case 3: startMonth = 6; endMonth = 8; break;
              case 4: startMonth = 9; endMonth = 11; break;
              default: throw new Error("Invalid quarter");
          }
          const startDate = new Date(year, startMonth, 1);
          const endDate = new Date(year, endMonth + 1, 0, 23, 59, 59);
          const stats = await PerformanceReview.findAll({
              where: {
                  createdAt: {
                      [Sequelize.Op.between]: [startDate, endDate],
                  },
              },
          });
          return stats;
      } catch (error) {
          console.error("Error getting quarterly performance stats:", error);
          throw error;
      }
  },

  getYearlyPerformanceStats: async (year) => {
      try {
          const startDate = new Date(year, 0, 1);
          const endDate = new Date(year, 11, 31, 23, 59, 59);
          const stats = await PerformanceReview.findAll({
              where: {
                  createdAt: {
                      [Sequelize.Op.between]: [startDate, endDate],
                  },
              },
          });
          return stats;
      } catch (error) {
          console.error("Error getting yearly performance stats:", error);
          throw error;
      }
  },

  updatePerformance_reviews: async (id, PrData) => {
    const pr = await Performance_reviews.findByPk(id);
    if (!pr) {
      throw new Error("Performance_reviews not found");
    }
    Object.assign(pr, PrData);
    await pr.save();
    return pr;
  },

  deletePerformance_reviews: async (id) => {
    const pr = await Performance_reviews.findByPk(id);
    if (!pr) {
      throw new Error("Performance_reviews not found");
    }
    await pr.destroy();
  },

};

module.exports = prService;
