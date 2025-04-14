const validatePayroll = (req, res, next) => {
    const { base_salary, employee_id, pay_period } = req.body;

    if (!employee_id) {
        return res.status(400).json({
            success: false,
            message: 'Employee ID is required'
        });
    }

    if (!base_salary || base_salary < 0) {
        return res.status(400).json({
            success: false,
            message: 'Valid base salary is required'
        });
    }

    if (pay_period && !['Monthly', 'Bi-Weekly', 'Weekly'].includes(pay_period)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid pay period'
        });
    }

    next();
};

module.exports = validatePayroll;