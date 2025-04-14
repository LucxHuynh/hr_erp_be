const payrollService = require('../../services/payrollService');
const User = require('../../models/User');

class PayrollController {

    async getAllPayrolls(req, res) {
        try {
            const payrolls = await payrollService.getAllPayrolls();
            res.status(200).json({ success: true, data: payrolls });
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                message: 'Failed to fetch all payrolls', 
                error: error.message 
            });
        }
    }
    
    async createPayroll(req, res) {
        try {
            const payroll = await payrollService.createPayroll(req.body);
            res.status(201).json({ success: true, message: 'Payroll created successfully', payroll });
        } catch (error) {
            res.status(400).json({ success: false, message: 'Payroll creation failed', error: error.message });
        }
    }

    async getPayrollHistory(req, res) {
        try {
            const { employeeId, month } = req.params;
            const history = await payrollService.getPayrollHistory(employeeId, month);
            res.status(200).json({ success: true, history });
        } catch (error) {
            res.status(400).json({ success: false, message: 'Failed to fetch payroll history', error: error.message });
        }
    }

    async getPayrollStatistics(req, res) {
        try {
            const statistics = await payrollService.getPayrollStatistics();
            res.status(200).json({ success: true, ...statistics });
        } catch (error) {
            res.status(400).json({ success: false, message: 'Failed to fetch payroll statistics', error: error.message });
        }
    }

    async exportPayroll(req, res) {
        try {
            const { employeeId } = req.params;
            
            // Nếu employeeId là 'all', xuất toàn bộ bảng lương - có thể thêm logic riêng
            if (employeeId === 'all') {
                // Logic xuất toàn bộ bảng lương (có thể tạo tệp Excel thay vì PDF)
                return res.status(501).json({ success: false, message: 'Chức năng xuất toàn bộ bảng lương đang được phát triển' });
            }
            
            // Tìm payroll bằng employeeId
            const payrolls = await payrollService.getPayrollHistory(employeeId);
            if (!payrolls || payrolls.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy bảng lương cho nhân viên này' });
            }
            
            // Lấy payroll mới nhất
            const latestPayroll = payrolls[0];
    
            // Kiểm tra quyền truy cập (nếu không phải Admin/Accountant thì chỉ được xem của chính mình)
            if (req.user.role === 'Employee' && req.user.id !== employeeId) {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền xuất bảng lương này' });
            }
    
            // Tạo file PDF
            const filePath = await payrollService.generatePayrollPDF(latestPayroll.id);
            if (!filePath) {
                return res.status(500).json({ success: false, message: 'Không thể tạo file PDF' });
            }
    
            // Gửi file cho người dùng
            res.download(filePath, `payroll_${employeeId}.pdf`);
        } catch (error) {
            console.error('Error exporting payroll:', error);
            res.status(500).json({ success: false, message: 'Không thể xuất bảng lương', error: error.message });
        }
    }

    async deletePayroll(req, res) {
        try {
            const { payrollId } = req.params;
            const result = await payrollService.deletePayroll(payrollId);

            if (result) {
                return res.status(200).json({ success: true, message: 'Payroll deleted successfully' });
            } else {
                return res.status(404).json({ success: false, message: 'Payroll not found' });
            }
        } catch (error) {
            console.error('Error deleting payroll:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete payroll', error: error.message });
        }
    }

    // Thêm phương thức cập nhật bảng lương
    async updatePayroll(req, res) {
        try {
            const { payrollId } = req.params;
            const payrollData = req.body;
            
            const updatedPayroll = await payrollService.updatePayroll(payrollId, payrollData);
            
            res.status(200).json({ 
                success: true, 
                message: 'Payroll updated successfully', 
                payroll: updatedPayroll 
            });
        } catch (error) {
            console.error('Error updating payroll:', error);
            res.status(400).json({ 
                success: false, 
                message: 'Failed to update payroll', 
                error: error.message 
            });
        }
    }
}

module.exports = new PayrollController();